import { config } from "dotenv";

// Load environment variables from .env file
config();

// Global test setup
beforeAll(() => {
  // Ensure we have required environment variables
  if (!process.env.CONGRESS_GOV_API_KEY) {
    throw new Error(
      "CONGRESS_GOV_API_KEY environment variable is required for integration tests"
    );
  }
});

// Global test timeout
jest.setTimeout(30000);
