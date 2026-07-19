import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuditLog, AuditLogDocument } from './schemas/audit-log.schema';
import { JwtStaffPayload } from '../../shared/interfaces/jwt-payload.interface';

@Injectable()
export class AuditService {
  constructor(@InjectModel(AuditLog.name) private readonly auditLogModel: Model<AuditLogDocument>) {}

  async log(
    actor: JwtStaffPayload,
    action: string,
    entityType: string,
    entityId: string,
    metadata: Record<string, unknown> = {},
  ): Promise<void> {
    await this.auditLogModel.create({
      actorUserId: actor.sub,
      actorEmail: actor.email,
      action,
      entityType,
      entityId,
      metadata,
    });
  }

  async list(entityType?: string, limit = 100) {
    const filter = entityType ? { entityType } : {};
    return this.auditLogModel.find(filter).sort({ createdAt: -1 }).limit(limit).lean();
  }
}
