module.exports = {
  verbose: true,
  preset: 'ts-jest',
  transformIgnorePatterns: [
    'node_modules/(?!(@react-native-community|react-native)/)'
  ],
  collectCoverage: true,
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: -10
    }
  }
};
