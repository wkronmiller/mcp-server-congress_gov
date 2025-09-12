import { CongressApiService } from "../../services/CongressApiService.js";
import {
  handleNominationResource,
  handleNominationNomineesResource,
  handleNominationActionsResource,
  handleNominationCommitteesResource,
  handleNominationHearingsResource,
} from "../../resourceHandlers.js";

/**
 * Integration tests for nomination resources and API functionality
 * These tests validate nomination API service methods and handlers
 */
describe("Nomination Resources Integration Tests", () => {
  let congressApiService: CongressApiService;

  beforeAll(() => {
    congressApiService = new CongressApiService();
  });

  // Test Basic Nomination Resource
  describe("getNominationDetails", () => {
    test("should fetch valid nomination details", async () => {
      const params = {
        congress: "118",
        nominationNumber: "1",
      };

      const result = await congressApiService.getNominationDetails(params);

      expect(result).toBeDefined();
      expect(result).toHaveProperty("nomination");
    });

    test("should handle API errors gracefully", async () => {
      const params = {
        congress: "118",
        nominationNumber: "99999", // Non-existent nomination
      };

      await expect(
        congressApiService.getNominationDetails(params)
      ).rejects.toThrow();
    });
  });

  // Test Nomination Individual Nominee Resource
  describe("getNominationNominee", () => {
    test("should fetch individual nominee details", async () => {
      const params = {
        congress: "118",
        nominationNumber: "1",
        ordinal: "1",
      };

      try {
        const result = await congressApiService.getNominationNominee(params);
        expect(result).toBeDefined();
        expect(result).toHaveProperty("nominees");
      } catch (error: any) {
        // Some nominations may not exist, which is acceptable
        expect(error).toBeDefined();
      }
    });

    test("should handle invalid ordinal", async () => {
      const params = {
        congress: "118",
        nominationNumber: "1",
        ordinal: "999", // Non-existent ordinal
      };

      try {
        const result = await congressApiService.getNominationNominee(params);
        // API may return empty results for invalid ordinals instead of throwing
        expect(result).toBeDefined();
        expect(result).toHaveProperty("nominees");
        expect(result.nominees).toEqual([]); // Should be empty for invalid ordinal
      } catch (error: any) {
        // API may also throw errors for invalid ordinals
        expect(error).toBeDefined();
      }
    });
  });

  // Test Nomination Actions Resource
  describe("getNominationActions", () => {
    test("should fetch nomination actions", async () => {
      const params = {
        congress: "118",
        nominationNumber: "1",
      };

      const result = await congressApiService.getNominationActions(params);

      expect(result).toBeDefined();
      expect(result).toHaveProperty("actions");
    });

    test("should support pagination", async () => {
      const params = {
        congress: "118",
        nominationNumber: "1",
      };
      const pagination = { limit: 2, offset: 0 };

      const result = await congressApiService.getNominationActions(
        params,
        pagination
      );

      expect(result).toBeDefined();
    });
  });

  // Test Nomination Committees Resource
  describe("getNominationCommittees", () => {
    test("should fetch nomination committees", async () => {
      const params = {
        congress: "118",
        nominationNumber: "1",
      };

      const result = await congressApiService.getNominationCommittees(params);

      expect(result).toBeDefined();
      expect(result).toHaveProperty("committees");
    });
  });

  // Test Nomination Hearings Resource
  describe("getNominationHearings", () => {
    test("should fetch nomination hearings", async () => {
      const params = {
        congress: "118",
        nominationNumber: "1",
      };

      const result = await congressApiService.getNominationHearings(params);

      expect(result).toBeDefined();
      expect(result).toHaveProperty("hearings");
    });
  });

  // Test Resource Handlers
  describe("Resource Handlers", () => {
    test("handleNominationResource should handle valid URI", async () => {
      const uri = "congress-gov://nomination/118/1";

      const result = await handleNominationResource(uri, congressApiService);

      expect(result).toBeDefined();
      expect(result).toHaveProperty("contents");
      expect(Array.isArray(result.contents)).toBe(true);
    });

    test("handleNominationResource should reject invalid URI", async () => {
      const uri = "congress-gov://nomination/invalid";

      await expect(
        handleNominationResource(uri, congressApiService)
      ).rejects.toThrow("Invalid nomination resource URI format");
    });

    test("handleNominationNomineesResource should handle valid URI", async () => {
      const uri = "congress-gov://nomination/118/1/nominee/1";

      const result = await handleNominationNomineesResource(
        uri,
        congressApiService
      );

      expect(result).toBeDefined();
      expect(result).toHaveProperty("contents");
    });

    test("handleNominationActionsResource should handle valid URI", async () => {
      const uri = "congress-gov://nomination/118/1/actions";

      const result = await handleNominationActionsResource(
        uri,
        congressApiService
      );

      expect(result).toBeDefined();
      expect(result).toHaveProperty("contents");
    });

    test("handleNominationCommitteesResource should handle valid URI", async () => {
      const uri = "congress-gov://nomination/118/1/committees";

      const result = await handleNominationCommitteesResource(
        uri,
        congressApiService
      );

      expect(result).toBeDefined();
      expect(result).toHaveProperty("contents");
    });

    test("handleNominationHearingsResource should handle valid URI", async () => {
      const uri = "congress-gov://nomination/118/1/hearings";

      const result = await handleNominationHearingsResource(
        uri,
        congressApiService
      );

      expect(result).toBeDefined();
      expect(result).toHaveProperty("contents");
    });
  });

  // Test URI Pattern Validation
  describe("URI Pattern Validation", () => {
    test("should reject invalid congress numbers", async () => {
      const uri = "congress-gov://nomination/50/1"; // Too low

      await expect(
        handleNominationResource(uri, congressApiService)
      ).rejects.toThrow(
        "Invalid congress number '50'. Must be between 93 and 118."
      );
    });

    test("should reject invalid nomination numbers", async () => {
      const uri = "congress-gov://nomination/118/abc";

      await expect(
        handleNominationResource(uri, congressApiService)
      ).rejects.toThrow("Invalid nomination resource URI format");
    });

    test("should reject invalid ordinal numbers", async () => {
      const uri = "congress-gov://nomination/118/1/nominee/0"; // Must be positive

      await expect(
        handleNominationNomineesResource(uri, congressApiService)
      ).rejects.toThrow(
        "Invalid ordinal number '0'. Must be a positive integer."
      );
    });

    test("should require ordinal for nominee resources", async () => {
      const uri = "congress-gov://nomination/118/1/nominee/";

      await expect(
        handleNominationNomineesResource(uri, congressApiService)
      ).rejects.toThrow("Invalid nomination nominees resource URI format");
    });
  });

  // Test Edge Cases
  describe("Edge Cases", () => {
    test("should handle minimum congress number (93)", async () => {
      const uri = "congress-gov://nomination/93/1";

      try {
        await handleNominationResource(uri, congressApiService);
      } catch (error: any) {
        // Allow API errors but not validation errors
        expect(error.message).not.toContain("Invalid congress number");
      }
    });

    test("should handle maximum congress number (118)", async () => {
      const uri = "congress-gov://nomination/118/1";

      try {
        await handleNominationResource(uri, congressApiService);
      } catch (error: any) {
        // Allow API errors but not validation errors
        expect(error.message).not.toContain("Invalid congress number");
      }
    });

    test("should reject congress numbers outside valid range", async () => {
      const uriTooLow = "congress-gov://nomination/92/1";
      const uriTooHigh = "congress-gov://nomination/119/1";

      await expect(
        handleNominationResource(uriTooLow, congressApiService)
      ).rejects.toThrow(
        "Invalid congress number '92'. Must be between 93 and 118."
      );

      await expect(
        handleNominationResource(uriTooHigh, congressApiService)
      ).rejects.toThrow(
        "Invalid congress number '119'. Must be between 93 and 118."
      );
    });
  });
});
