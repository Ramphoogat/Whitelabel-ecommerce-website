/**
 * Runs once before the entire E2E suite.
 * Sets environment variables that point the app at the test containers.
 */
export default async function globalSetup() {
  process.env.NODE_ENV = 'test';
  process.env.MONGO_URI = process.env.TEST_MONGO_URI ?? 'mongodb://localhost:27018/store_test';
  process.env.REDIS_HOST = process.env.TEST_REDIS_HOST ?? 'localhost';
  process.env.REDIS_PORT = process.env.TEST_REDIS_PORT ?? '6380';
  process.env.JWT_ACCESS_SECRET = 'e2e-test-access-secret-32chars!!';
  process.env.JWT_REFRESH_SECRET = 'e2e-test-refresh-secret-32chars!';
  process.env.CREDENTIALS_ENCRYPTION_KEY = 'e2e-test-enc-key-32chars!!!!!!!!';
  process.env.STORAGE_PROVIDER = 's3';
  process.env.STORAGE_BUCKET = 'test-bucket';
  process.env.STORAGE_ACCESS_KEY = 'test-key';
  process.env.STORAGE_SECRET_KEY = 'test-secret';
}
