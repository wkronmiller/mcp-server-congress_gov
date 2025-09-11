import { CongressApiService } from "../../services/CongressApiService.js";
import { testData } from "../utils/testServer.js";

/**
 * Integration tests for MCP tools functionality
 * These tests validate tool-like operations with real Congress.gov API calls
 */
describe("Congress.gov MCP Tools Integration Tests", () => {
  let congressApiService: CongressApiService;

  beforeAll(() => {
    congressApiService = new CongressApiService();
  });

  describe("Search Tool Functionality", () => {
    it("should search for bills (simulating search tool)", async () => {
      const result = await congressApiService.searchCollection("bill", {
        limit: 2,
      });

      expect(result).toBeDefined();
      expect(result).toHaveProperty("bills");
      expect(Array.isArray(result.bills)).toBe(true);
      expect(result.bills.length).toBeLessThanOrEqual(2);
    }, 15000);

    it("should search for members (simulating search tool)", async () => {
      const result = await congressApiService.searchCollection("member", {
        limit: 2,
      });

      expect(result).toBeDefined();
      expect(result).toHaveProperty("members");
      expect(Array.isArray(result.members)).toBe(true);
      expect(result.members.length).toBeLessThanOrEqual(2);
    }, 15000);

    it("should handle search with query parameters", async () => {
      const result = await congressApiService.searchCollection("bill", {
        query: "healthcare",
        limit: 1,
      });

      expect(result).toBeDefined();
      expect(result).toHaveProperty("bills");
      expect(Array.isArray(result.bills)).toBe(true);
    }, 15000);

    it("should handle invalid collection types", async () => {
      await expect(
        congressApiService.searchCollection("invalid" as any, {
          limit: 1,
        })
      ).rejects.toThrow();
    });
  });

  describe("GetSubResource Tool Functionality", () => {
    it("should get bill actions (simulating getSubResource tool)", async () => {
      const result = await congressApiService.getSubResource(
        testData.bills.uri,
        "actions",
        { limit: 2 }
      );

      expect(result).toBeDefined();
      expect(result).toHaveProperty("actions");
      expect(Array.isArray(result.actions)).toBe(true);
    }, 15000);

    it("should get bill subjects (simulating getSubResource tool)", async () => {
      const result = await congressApiService.getSubResource(
        testData.bills.uri,
        "subjects"
      );

      expect(result).toBeDefined();
      expect(result).toHaveProperty("subjects");
    }, 15000);

    it("should get bill text (simulating getSubResource tool)", async () => {
      const result = await congressApiService.getSubResource(
        testData.bills.uri,
        "text"
      );

      expect(result).toBeDefined();
      expect(result).toHaveProperty("textVersions");
    }, 15000);

    it("should handle invalid sub-resource types", async () => {
      await expect(
        congressApiService.getSubResource(testData.bills.uri, "invalid" as any)
      ).rejects.toThrow();
    });

    it("should handle malformed resource URIs", async () => {
      await expect(
        congressApiService.getSubResource("invalid-uri", "actions")
      ).rejects.toThrow();
    });
  });

  describe("Tool Parameter Validation", () => {
    it("should handle missing required parameters gracefully", async () => {
      await expect(
        congressApiService.searchCollection("bill", {
          // Missing required collection parameter test
        } as any)
      ).resolves.toBeDefined(); // Should still work with defaults
    });

    it("should handle limit parameter correctly", async () => {
      const result = await congressApiService.searchCollection("bill", {
        limit: 1,
      });

      expect(result).toBeDefined();
      expect(result.bills?.length).toBeLessThanOrEqual(1);
    }, 15000);

    it("should handle offset parameter correctly", async () => {
      const result = await congressApiService.searchCollection("bill", {
        limit: 1,
        offset: 5,
      });

      expect(result).toBeDefined();
      expect(result).toHaveProperty("bills");
    }, 15000);
  });

  describe("Tool Error Handling", () => {
    it("should handle non-existent resources", async () => {
      await expect(
        congressApiService.getSubResource(
          "https://api.congress.gov/v3/bill/999/hr/999999",
          "actions"
        )
      ).rejects.toThrow();
    });

    it("should handle API rate limiting service", async () => {
      // The rate limiter should be tracking requests
      const rateLimiter = congressApiService["rateLimitService"];
      expect(rateLimiter).toBeDefined();
      expect(rateLimiter["requestTimes"]).toBeDefined();
    });
  });
});
