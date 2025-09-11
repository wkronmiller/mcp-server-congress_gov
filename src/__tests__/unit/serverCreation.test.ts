/**
 * Integration test to verify that the server can be created and basic functionality works
 * This test uses a mock API key but does not make actual API calls
 */
import { createServer } from "../../createServer.js";

// Mock environment setup
process.env.CONGRESS_GOV_API_KEY = "test-api-key";

describe("Server Creation Integration Test", () => {
  it("should create server without errors", async () => {
    expect(() => {
      const server = createServer();
      expect(server).toBeDefined();
    }).not.toThrow();
  });
});