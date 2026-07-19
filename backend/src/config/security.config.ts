import { registerAs } from '@nestjs/config';

export default registerAs('security', () => ({
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET || 'change_me_access_secret',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'change_me_refresh_secret',
  jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  credentialsEncryptionKey:
    process.env.CREDENTIALS_ENCRYPTION_KEY || 'change_me_credentials_encryption_key',
}));
