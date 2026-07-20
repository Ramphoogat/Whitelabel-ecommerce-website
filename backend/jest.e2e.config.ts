import type { Config } from 'jest';

/**
 * Jest configuration for E2E tests.
 * Requires MongoDB + Redis — start with:
 *   docker compose -f docker-compose.test.yml up -d
 */
const config: Config = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testRegex: '\\.e2e-spec\\.ts$',
  transform: { '^.+\\.(t|j)s$': 'ts-jest' },
  testEnvironment: 'node',
  testTimeout: 30_000,
  globalSetup: './test/global-setup.ts',
  globalTeardown: './test/global-teardown.ts',
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1',
  },
};

export default config;
