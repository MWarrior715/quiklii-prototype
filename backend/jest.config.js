export default {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js', '**/tests/**/*.spec.js'],
  setupFilesAfterEnv: ['<rootDir>/src/tests/setup.js'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/tests/**',
    '!src/database.js',
    '!src/app-db.js'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  transformIgnorePatterns: [
    'node_modules/(?!((@babel/runtime|@jest/transform)|sequelize)/)'
  ]
};