module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src"],
  testMatch: ["**/__tests__/**/*.ts", "**/?(*.)+(spec|test).ts"],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  collectCoverageFrom: [
    "src/services/**/*.ts",
    "src/handlers/**/*.ts",
    "src/events/**/*.ts",
    "!src/**/*.d.ts",
    "!src/**/*.test.ts",
  ],
  coveragePathIgnorePatterns: [
    "src/rooms/",
    "src/index.ts",
    "src/demo.ts",
    "src/Board.ts",
  ],
  coverageThreshold: {
    "src/services/**/*.ts": {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
};

