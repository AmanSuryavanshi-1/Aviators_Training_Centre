/**
 * Jest Configuration for Comprehensive Testing Suite
 */

const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: './',
});

// Add any custom config to be passed to Jest
const customJestConfig = {
  // Test environment
  testEnvironment: 'jsdom',

  // Setup files
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup/testSetup.ts'],

  // Module name mapping for absolute imports
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@/components/(.*)$': '<rootDir>/src/components/$1',
    '^@/lib/(.*)$': '<rootDir>/src/lib/$1',
    '^@/contexts/(.*)$': '<rootDir>/src/contexts/$1',
    '^@/hooks/(.*)$': '<rootDir>/src/hooks/$1',
    '^@/types/(.*)$': '<rootDir>/src/types/$1',
    '^@/styles/(.*)$': '<rootDir>/src/styles/$1',
  },

  // Test patterns
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/src/**/*.{test,spec}.{js,jsx,ts,tsx}',
  ],

  // Coverage configuration
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/**/__tests__/**',
    '!src/**/__mocks__/**',
    '!src/app/**/layout.tsx',
    '!src/app/**/loading.tsx',
    '!src/app/**/error.tsx',
    '!src/app/**/not-found.tsx',
    '!src/middleware.ts',
  ],

  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
    // Specific thresholds for critical modules
    './src/lib/auth/': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
    './src/contexts/': {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85,
    },
  },

  // Coverage reporters
  coverageReporters: ['text', 'lcov', 'html', 'json-summary'],

  // Test timeout
  testTimeout: 10000,

  // Transform configuration
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }],
  },

  // Module file extensions
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],

  // Ignore patterns
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
    '<rootDir>/dist/',
    '<rootDir>/build/',
  ],

  // Transform ignore patterns
  transformIgnorePatterns: [
    '/node_modules/(?!(.*\\.mjs$|@sanity|@portabletext))',
  ],

  // Global variables
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json',
    },
  },

  // Verbose output
  verbose: true,

  // Clear mocks between tests
  clearMocks: true,

  // Restore mocks after each test
  restoreMocks: true,

  // Error on deprecated features
  errorOnDeprecated: true,

  // Test suites configuration
  projects: [
    {
      displayName: 'Unit Tests',
      testMatch: ['<rootDir>/src/**/*.test.{js,jsx,ts,tsx}'],
      testEnvironment: 'jsdom',
    },
    {
      displayName: 'Integration Tests',
      testMatch: ['<rootDir>/src/**/__tests__/integration/*.{js,jsx,ts,tsx}'],
      testEnvironment: 'jsdom',
      testTimeout: 15000,
    },
    {
      displayName: 'Security Tests',
      testMatch: ['<rootDir>/src/**/__tests__/security/*.{js,jsx,ts,tsx}'],
      testEnvironment: 'node',
      testTimeout: 20000,
    },
    {
      displayName: 'Compatibility Tests',
      testMatch: ['<rootDir>/src/**/__tests__/compatibility/*.{js,jsx,ts,tsx}'],
      testEnvironment: 'jsdom',
      testTimeout: 30000,
    },
  ],

  // Reporters
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: './test-results',
        outputName: 'junit.xml',
        suiteName: 'Production Critical Fixes Test Suite',
      },
    ],
    [
      'jest-html-reporters',
      {
        publicPath: './test-results',
        filename: 'test-report.html',
        expand: true,
      },
    ],
  ],

  // Watch plugins
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname',
  ],

  // Max workers for parallel execution
  maxWorkers: '50%',

  // Cache directory
  cacheDirectory: '<rootDir>/.jest-cache',

  // Notify mode
  notify: false,

  // Bail on first test failure in CI
  bail: process.env.CI ? 1 : 0,

  // Force exit after tests complete
  forceExit: true,

  // Detect open handles
  detectOpenHandles: true,

  // Detect leaked timers
  detectLeaks: false,
};

// Create and export the Jest configuration
module.exports = createJestConfig(customJestConfig);