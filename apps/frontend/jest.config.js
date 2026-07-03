const nextJest = require('next/jest');

// next/jest wires up SWC transforms, CSS-module mocking and tsconfig paths so
// the tests run against the same compilation as the app.
const createJestConfig = nextJest({ dir: './' });

/** @type {import('jest').Config} */
const config = {
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],
  // Keep the build output (.next/standalone copies package.json) out of the
  // haste module map, otherwise Jest warns about duplicate package names.
  modulePathIgnorePatterns: ['<rootDir>/.next/'],
};

module.exports = createJestConfig(config);
