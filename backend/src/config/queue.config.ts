import { registerAs } from '@nestjs/config';

export default registerAs('queue', () => ({
  prefix: process.env.QUEUE_PREFIX || 'storeq',
}));
