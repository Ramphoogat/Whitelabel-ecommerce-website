import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Model } from 'mongoose';
import * as Handlebars from 'handlebars';
import {
  NotificationChannelConfig,
  NotificationChannelConfigDocument,
  NotificationChannel,
} from './schemas/notification-channel-config.schema';
import { NotificationTemplate, NotificationTemplateDocument } from './schemas/notification-template.schema';
import { NotificationLog, NotificationLogDocument } from './schemas/notification-log.schema';
import { UpdateChannelConfigDto } from './dto/update-channel-config.dto';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';
import { createMailProvider } from '../../providers/mail/mail.factory';
import { createSmsProvider } from '../../providers/sms/sms.factory';
import { decrypt, encrypt } from '../../shared/utils/encryption.util';

export const NOTIFICATION_QUEUE = 'notifications';

export interface SendNotificationJobData {
  templateKey: string;
  recipient: string;
  data: Record<string, unknown>;
}

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @InjectModel(NotificationChannelConfig.name)
    private readonly channelModel: Model<NotificationChannelConfigDocument>,
    @InjectModel(NotificationTemplate.name)
    private readonly templateModel: Model<NotificationTemplateDocument>,
    @InjectModel(NotificationLog.name)
    private readonly logModel: Model<NotificationLogDocument>,
    private readonly config: ConfigService,
    @InjectQueue(NOTIFICATION_QUEUE) private readonly queue: Queue<SendNotificationJobData>,
  ) {}

  async listChannelConfigs() {
    const docs = await this.channelModel.find().lean();
    return docs.map((doc) => ({
      channel: doc.channel,
      provider: doc.provider,
      isActive: doc.isActive,
      hasCredentialsConfigured: Object.keys(doc.encryptedCredentials || {}).length > 0,
    }));
  }

  async upsertChannelConfig(channel: NotificationChannel, dto: UpdateChannelConfigDto) {
    const secret = this.config.get<string>('security.credentialsEncryptionKey')!;
    const update: Partial<NotificationChannelConfig> = { provider: dto.provider };
    if (dto.isActive !== undefined) update.isActive = dto.isActive;

    if (dto.credentials) {
      const encryptedCredentials: Record<string, string> = {};
      for (const [key, value] of Object.entries(dto.credentials)) {
        encryptedCredentials[key] = encrypt(value, secret);
      }
      update.encryptedCredentials = encryptedCredentials;
    }

    return this.channelModel.findOneAndUpdate(
      { channel },
      { $set: update, $setOnInsert: { channel } },
      { new: true, upsert: true },
    );
  }

  async createTemplate(dto: CreateTemplateDto) {
    return this.templateModel.create(dto);
  }

  async listTemplates() {
    return this.templateModel.find().sort({ key: 1 }).lean();
  }

  async updateTemplate(id: string, dto: UpdateTemplateDto) {
    const template = await this.templateModel.findByIdAndUpdate(id, dto, { new: true });
    if (!template) throw new NotFoundException('Template not found');
    return template;
  }

  async deleteTemplate(id: string) {
    const template = await this.templateModel.findByIdAndDelete(id);
    if (!template) throw new NotFoundException('Template not found');
    return { success: true };
  }

  async listLogs(limit = 50) {
    return this.logModel.find().sort({ createdAt: -1 }).limit(limit).lean();
  }

  /**
   * Enqueues a notification for async sending -- callers (e.g. OrderService)
   * never wait on this, and a slow/down mail provider never blocks the
   * request that triggered it.
   */
  async enqueue(templateKey: string, recipient: string, data: Record<string, unknown>): Promise<void> {
    await this.queue.add(
      'send-notification',
      { templateKey, recipient, data },
      { attempts: 3, backoff: { type: 'exponential', delay: 2000 } },
    );
  }

  /** Called by the queue processor, and directly by the admin "send test" endpoint. */
  async sendNow(templateKey: string, recipient: string, data: Record<string, unknown>): Promise<void> {
    const template = await this.templateModel.findOne({ key: templateKey, isActive: true });
    if (!template) {
      throw new NotFoundException(`No active template found for key "${templateKey}"`);
    }

    const channelConfig = await this.channelModel.findOne({
      channel: template.channel,
      isActive: true,
    });
    if (!channelConfig) {
      throw new BadRequestException(`No active ${template.channel} provider configured`);
    }

    const secret = this.config.get<string>('security.credentialsEncryptionKey')!;
    const credentials: Record<string, string> = {};
    for (const [key, value] of Object.entries(channelConfig.encryptedCredentials || {})) {
      credentials[key] = decrypt(value, secret);
    }

    const bodyHtml = Handlebars.compile(template.bodyTemplate)(data);

    try {
      let providerMessageId = '';

      if (template.channel === 'email') {
        const subject = Handlebars.compile(template.subjectTemplate || '')(data);
        const provider = createMailProvider(channelConfig.provider, credentials);
        const result = await provider.send({ to: recipient, subject, html: bodyHtml });
        providerMessageId = result.messageId;
      } else {
        const provider = createSmsProvider(channelConfig.provider, credentials);
        const result = await provider.send({ to: recipient, message: bodyHtml });
        providerMessageId = result.messageId;
      }

      await this.logModel.create({
        channel: template.channel,
        templateKey,
        recipient,
        status: 'sent',
        providerMessageId,
      });
    } catch (err) {
      await this.logModel.create({
        channel: template.channel,
        templateKey,
        recipient,
        status: 'failed',
        error: (err as Error).message,
      });
      throw err;
    }
  }
}
