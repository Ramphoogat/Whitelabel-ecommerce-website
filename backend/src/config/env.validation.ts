import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().default(4000),
  API_PREFIX: Joi.string().default('api'),
  CORS_ORIGIN: Joi.string().default('*'),
  BUSINESS_TYPE: Joi.string().default('fashion'),
  STORE_NAME: Joi.string().default('My Store'),

  MONGO_URI: Joi.string().required(),

  REDIS_MODE: Joi.string().valid('standalone', 'sentinel').default('standalone'),
  REDIS_HOST: Joi.string().default('localhost'),
  REDIS_PORT: Joi.number().default(6379),
  REDIS_PASSWORD: Joi.string().allow('').optional(),
  REDIS_SENTINELS: Joi.string().allow('').optional(),
  REDIS_SENTINEL_NAME: Joi.string().default('mymaster'),

  STORAGE_PROVIDER: Joi.string().valid('s3', 'contabo', 'zata', 'minio', 'r2').default('s3'),
  STORAGE_BUCKET: Joi.string().allow('').optional(),
  STORAGE_REGION: Joi.string().default('us-east-1'),
  STORAGE_ENDPOINT: Joi.string().allow('').optional(),
  STORAGE_ACCESS_KEY: Joi.string().allow('').optional(),
  STORAGE_SECRET_KEY: Joi.string().allow('').optional(),
  STORAGE_PUBLIC_URL: Joi.string().allow('').optional(),

  QUEUE_PREFIX: Joi.string().default('storeq'),

  JWT_ACCESS_SECRET: Joi.string().required(),
  JWT_REFRESH_SECRET: Joi.string().required(),
  JWT_ACCESS_EXPIRES_IN: Joi.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default('30d'),
  CREDENTIALS_ENCRYPTION_KEY: Joi.string().min(16).required(),
});
