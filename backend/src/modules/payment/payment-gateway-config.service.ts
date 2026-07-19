import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  PaymentGatewayConfig,
  PaymentGatewayConfigDocument,
} from './schemas/payment-gateway-config.schema';
import { PaymentMode, PaymentModeDocument } from './schemas/payment-mode.schema';
import { UpdateGatewayConfigDto } from './dto/update-gateway-config.dto';
import { PaymentOptionsResponseDto } from './dto/payment-options-response.dto';
import { SUPPORTED_GATEWAYS } from '../../providers/payment/payment.factory';
import { decrypt, encrypt } from '../../shared/utils/encryption.util';

@Injectable()
export class PaymentGatewayConfigService {
  constructor(
    @InjectModel(PaymentGatewayConfig.name)
    private readonly gatewayModel: Model<PaymentGatewayConfigDocument>,
    @InjectModel(PaymentMode.name)
    private readonly modeModel: Model<PaymentModeDocument>,
    private readonly config: ConfigService,
  ) {}

  /** Admin: list every configured gateway (credentials never included). */
  async listForAdmin() {
    const docs = await this.gatewayModel.find().sort({ priority: 1 }).lean();
    return docs.map((doc) => ({
      id: doc._id,
      provider: doc.provider,
      isActive: doc.isActive,
      supportedModes: doc.supportedModes,
      priority: doc.priority,
      isTestMode: doc.isTestMode,
      hasCredentialsConfigured: Object.keys(doc.encryptedCredentials || {}).length > 0,
    }));
  }

  /** Admin: create-or-update a gateway's config by provider name (e.g. "razorpay"). */
  async upsertForAdmin(provider: string, dto: UpdateGatewayConfigDto) {
    if (!SUPPORTED_GATEWAYS.includes(provider)) {
      throw new NotFoundException(
        `"${provider}" is not an implemented gateway. Supported: ${SUPPORTED_GATEWAYS.join(', ')}`,
      );
    }

    const secret = this.config.get<string>('security.credentialsEncryptionKey')!;

    const update: Partial<PaymentGatewayConfig> = {};
    if (dto.isActive !== undefined) update.isActive = dto.isActive;
    if (dto.supportedModes !== undefined) update.supportedModes = dto.supportedModes;
    if (dto.priority !== undefined) update.priority = dto.priority;
    if (dto.isTestMode !== undefined) update.isTestMode = dto.isTestMode;

    if (dto.credentials) {
      const encryptedCredentials: Record<string, string> = {};
      for (const [key, value] of Object.entries(dto.credentials)) {
        encryptedCredentials[key] = encrypt(value, secret);
      }
      update.encryptedCredentials = encryptedCredentials;
    }

    const doc = await this.gatewayModel.findOneAndUpdate(
      { provider },
      { $set: update, $setOnInsert: { provider } },
      { new: true, upsert: true },
    );

    return {
      id: doc._id,
      provider: doc.provider,
      isActive: doc.isActive,
      supportedModes: doc.supportedModes,
      priority: doc.priority,
      isTestMode: doc.isTestMode,
    };
  }

  /** Internal use only (checkout service) — returns decrypted credentials for one active gateway. */
  async getDecryptedCredentials(provider: string): Promise<Record<string, string>> {
    const doc = await this.gatewayModel.findOne({ provider, isActive: true });
    if (!doc) {
      throw new NotFoundException(`Gateway "${provider}" is not active`);
    }

    const secret = this.config.get<string>('security.credentialsEncryptionKey')!;
    const decrypted: Record<string, string> = {};
    for (const [key, value] of Object.entries(doc.encryptedCredentials || {})) {
      decrypted[key] = decrypt(value, secret);
    }
    return decrypted;
  }

  /**
   * Storefront: group currently-active gateways by the payment mode they
   * support (§6.2/§6.4 of the architecture doc). COD is included whenever
   * its payment_modes entry is enabled, with an empty gateway list since it
   * has no processor behind it.
   */
  async getCheckoutPaymentOptions(): Promise<PaymentOptionsResponseDto> {
    const [modes, activeGateways] = await Promise.all([
      this.modeModel.find().sort({ displayOrder: 1 }).lean(),
      this.gatewayModel.find({ isActive: true }).sort({ priority: 1 }).lean(),
    ]);

    const result: PaymentOptionsResponseDto = { modes: [] };

    for (const mode of modes) {
      if (!mode.enabledByDefault) continue;

      if (!mode.requiresGateway) {
        // e.g. COD — always shown (if enabled) with no gateway list
        result.modes.push({ code: mode.code, label: mode.label, icon: mode.icon, gateways: [] });
        continue;
      }

      const gatewaysForMode = activeGateways
        .filter((g) => (g.supportedModes || []).includes(mode.code as any))
        .map((g) => g.provider);

      // Only show a gateway-backed mode if at least one active gateway supports it
      if (gatewaysForMode.length > 0) {
        result.modes.push({
          code: mode.code,
          label: mode.label,
          icon: mode.icon,
          gateways: gatewaysForMode,
        });
      }
    }

    return result;
  }
}
