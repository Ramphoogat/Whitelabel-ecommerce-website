import {
  Body,
  Controller,
  Delete,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { MediaService } from './media.service';
import { JwtStaffGuard } from '../../shared/guards/jwt-staff.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { Roles } from '../../shared/decorators/roles.decorator';

class GetSignedUrlDto {
  @IsString()
  filename!: string;

  @IsString()
  mimeType!: string;

  @IsOptional()
  @IsString()
  folder?: string;
}

@ApiTags('admin-media')
@ApiBearerAuth()
@UseGuards(JwtStaffGuard, RolesGuard)
@Roles('owner', 'admin', 'staff')
@Controller('admin/media')
export class MediaAdminController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('upload')
  @ApiOperation({
    summary: 'Upload a file directly (multipart/form-data). Returns the public URL.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        folder: { type: 'string', example: 'products' },
      },
      required: ['file'],
    },
  })
  @UseInterceptors(FileInterceptor('file', { storage: undefined /* memory */ }))
  uploadFile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 })],
        fileIsRequired: true,
      }),
    )
    file: Express.Multer.File,
    @Query('folder') folder?: string,
  ) {
    return this.mediaService.upload(file, folder ?? 'uploads');
  }

  @Post('signed-url')
  @ApiOperation({
    summary:
      'Get a presigned PUT URL so the client can upload directly to storage (avoids routing the file through the server).',
  })
  getSignedUrl(@Body() dto: GetSignedUrlDto) {
    return this.mediaService.getSignedUploadUrl(dto.filename, dto.mimeType, dto.folder);
  }

  @Delete(':key(*)')
  @ApiOperation({ summary: 'Delete a stored file by its storage key' })
  @Roles('owner', 'admin')
  deleteFile(@Param('key') key: string) {
    return this.mediaService.delete(key);
  }
}
