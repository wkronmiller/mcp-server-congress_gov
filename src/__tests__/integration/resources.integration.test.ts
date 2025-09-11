import { CongressApiService } from "../../services/CongressApiService.js";
import { testData } from "../utils/testServer.js";

/**
 * Integration tests for resource handlers and API functionality
 * These tests validate core API service methods with real Congress.gov API calls
 */
describe("Congress.gov Resources Integration Tests", () => {
  let congressApiService: CongressApiService;

  beforeAll(() => {
    congressApiService = new CongressApiService();
  });

  describe("Bill Resources", () => {
    it("should search bills", async () => {
      const result = await congressApiService.searchCollection("bill", {
        limit: 2,
      });

      expect(result).toBeDefined();
      expect(result).toHaveProperty("bills");
      expect(Array.isArray(result.bills)).toBe(true);
      expect(result.bills.length).toBeLessThanOrEqual(2);
    }, 10000);

    it("should get bill details", async () => {
      const result = await congressApiService.getBillDetails({
        congress: testData.bills.valid.congress,
        billType: testData.bills.valid.billType,
        billNumber: testData.bills.valid.billNumber,
      });

      expect(result).toBeDefined();
      expect(result).toHaveProperty("bill");
      expect(result.bill).toHaveProperty("title");
      expect(result.bill).toHaveProperty("congress");
      expect(result.bill.congress).toBe(
        parseInt(testData.bills.valid.congress)
      );
    }, 10000);

    it("should get bill actions sub-resource", async () => {
      const result = await congressApiService.getSubResource(
        testData.bills.uri,
        "actions",
        { limit: 3 }
      );

      expect(result).toBeDefined();
      expect(result).toHaveProperty("actions");
      expect(Array.isArray(result.actions)).toBe(true);
    }, 10000);

    it("should get bill subjects sub-resource", async () => {
      const result = await congressApiService.getSubResource(
        testData.bills.uri,
        "subjects"
      );

      expect(result).toBeDefined();
      expect(result).toHaveProperty("subjects");
    }, 10000);
  });

  describe("Member Resources", () => {
    it("should search members", async () => {
      const result = await congressApiService.searchCollection("member", {
        limit: 2,
      });

      expect(result).toBeDefined();
      expect(result).toHaveProperty("members");
      expect(Array.isArray(result.members)).toBe(true);
      expect(result.members.length).toBeLessThanOrEqual(2);
    }, 10000);

    it("should get member details", async () => {
      const result = await congressApiService.getMemberDetails({
        memberId: testData.members.valid.memberId,
      });

      expect(result).toBeDefined();
      expect(result).toHaveProperty("member");
      expect(result.member).toHaveProperty("bioguideId");
      expect(result.member.bioguideId).toBe(testData.members.valid.memberId);
    }, 10000);

    it("should search members with query", async () => {
      const result = await congressApiService.searchCollection("member", {
        query: "pelosi",
        limit: 1,
      });

      expect(result).toBeDefined();
      expect(result).toHaveProperty("members");
      expect(Array.isArray(result.members)).toBe(true);
    }, 10000);
  });

  describe("Error Handling", () => {
    it("should handle invalid collection types", async () => {
      await expect(
        congressApiService.searchCollection("invalid" as any, {
          query: "test",
        })
      ).rejects.toThrow();
    });

    it("should handle non-existent bill resources", async () => {
      await expect(
        congressApiService.getBillDetails({
          congress: "999",
          billType: "hr",
          billNumber: "999999",
        })
      ).rejects.toThrow();
    });

    it("should handle non-existent member resources", async () => {
      await expect(
        congressApiService.getMemberDetails({
          memberId: "INVALID123",
        })
      ).rejects.toThrow();
    });

    it("should handle invalid sub-resource requests", async () => {
      await expect(
        congressApiService.getSubResource(testData.bills.uri, "invalid" as any)
      ).rejects.toThrow();
    });
  });

  describe("API Service Initialization", () => {
    it("should have rate limiting service initialized", () => {
      expect(congressApiService["rateLimitService"]).toBeDefined();
    });

    it("should record API requests for rate limiting", async () => {
      const result = await congressApiService.searchCollection("bill", {
        limit: 1,
      });

      expect(result).toBeDefined();

      const rateLimiter = congressApiService["rateLimitService"];
      expect(rateLimiter["requestTimes"].length).toBeGreaterThan(0);
    }, 10000);

    it("should connect to Congress.gov API", async () => {
      const result = await congressApiService.searchCollection("bill", {
        limit: 1,
      });

      expect(result).toBeDefined();
      expect(result).toHaveProperty("bills");
      expect(Array.isArray(result.bills)).toBe(true);
    }, 10000);
  });
});
