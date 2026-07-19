import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { NotificationService } from './notification.service';
import { UpdateChannelConfigDto } from './dto/update-channel-config.dto';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';
import { SendTestNotificationDto } from './dto/send-test-notification.dto';
import { NotificationChannel } from './schemas/notification-channel-config.schema';
import { JwtStaffGuard } from '../../shared/guards/jwt-staff.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { Roles } from '../../shared/decorators/roles.decorator';

@ApiTags('admin-notifications')
@ApiBearerAuth()
@UseGuards(JwtStaffGuard, RolesGuard)
@Roles('owner', 'admin')
@Controller('admin/notifications')
export class NotificationAdminController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get('channels')
  listChannels() {
    return this.notificationService.listChannelConfigs();
  }

  @Patch('channels/:channel')
  updateChannel(@Param('channel') channel: NotificationChannel, @Body() dto: UpdateChannelConfigDto) {
    return this.notificationService.upsertChannelConfig(channel, dto);
  }

  @Post('templates')
  createTemplate(@Body() dto: CreateTemplateDto) {
    return this.notificationService.createTemplate(dto);
  }

  @Get('templates')
  listTemplates() {
    return this.notificationService.listTemplates();
  }

  @Patch('templates/:id')
  updateTemplate(@Param('id') id: string, @Body() dto: UpdateTemplateDto) {
    return this.notificationService.updateTemplate(id, dto);
  }

  @Delete('templates/:id')
  deleteTemplate(@Param('id') id: string) {
    return this.notificationService.deleteTemplate(id);
  }

  @Get('logs')
  listLogs() {
    return this.notificationService.listLogs();
  }

  @Post('test-send')
  async testSend(@Body() dto: SendTestNotificationDto) {
    await this.notificationService.sendNow(dto.templateKey, dto.recipient, dto.data);
    return { success: true };
  }
}
