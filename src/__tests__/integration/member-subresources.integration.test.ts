import { CongressApiService } from "../../services/CongressApiService.js";
import {
  handleMemberSponsoredLegislationResource,
  handleMemberCosponsoredLegislationResource,
  handleMembersByStateResource,
  handleMembersByDistrictResource,
  handleMembersByCongressStateDistrictResource,
} from "../../resourceHandlers.js";
import { testData } from "../utils/testServer.js";
import {
  ResourceNotFoundError,
  InvalidParameterError,
} from "../../utils/errors.js";

/**
 * Integration tests for member sub-resource handlers
 * These tests validate member sub-resource functionality with real Congress.gov API calls
 */
describe("Member Sub-Resources Integration Tests", () => {
  let congressApiService: CongressApiService;

  beforeAll(() => {
    congressApiService = new CongressApiService();
  });

  describe("Member Sponsored Legislation", () => {
    it("should handle member sponsored legislation resource", async () => {
      const result = await handleMemberSponsoredLegislationResource(
        testData.members.subResourceUris.sponsoredLegislation,
        congressApiService
      );

      expect(result).toBeDefined();
      expect(result).toHaveProperty("contents");
      expect(Array.isArray(result.contents)).toBe(true);
      expect(result.contents.length).toBe(1);
      expect(result.contents[0]).toHaveProperty("uri");
      expect(result.contents[0]).toHaveProperty("mimeType", "application/json");
      expect(result.contents[0]).toHaveProperty("text");

      const data = JSON.parse(result.contents[0].text);
      expect(data).toHaveProperty("sponsoredLegislation");
      expect(Array.isArray(data.sponsoredLegislation)).toBe(true);
    }, 15000);

    it("should throw error for invalid URI format", async () => {
      await expect(
        handleMemberSponsoredLegislationResource(
          "congress-gov://member/INVALID/sponsored-legislation",
          congressApiService
        )
      ).rejects.toThrow(InvalidParameterError);
    });

    it("should throw error for missing sub-resource", async () => {
      await expect(
        handleMemberSponsoredLegislationResource(
          "congress-gov://member/P000197",
          congressApiService
        )
      ).rejects.toThrow(ResourceNotFoundError);
    });
  });

  describe("Member Cosponsored Legislation", () => {
    it("should handle member cosponsored legislation resource", async () => {
      const result = await handleMemberCosponsoredLegislationResource(
        testData.members.subResourceUris.cosponsoredLegislation,
        congressApiService
      );

      expect(result).toBeDefined();
      expect(result).toHaveProperty("contents");
      expect(Array.isArray(result.contents)).toBe(true);
      expect(result.contents.length).toBe(1);

      const data = JSON.parse(result.contents[0].text);
      expect(data).toHaveProperty("cosponsoredLegislation");
      expect(Array.isArray(data.cosponsoredLegislation)).toBe(true);
    }, 15000);

    it("should throw error for invalid BioguideId format", async () => {
      await expect(
        handleMemberCosponsoredLegislationResource(
          "congress-gov://member/invalid123/cosponsored-legislation",
          congressApiService
        )
      ).rejects.toThrow(InvalidParameterError);
    });
  });

  describe("Members by State", () => {
    it("should handle members by state resource", async () => {
      const result = await handleMembersByStateResource(
        testData.members.subResourceUris.byState,
        congressApiService
      );

      expect(result).toBeDefined();
      expect(result).toHaveProperty("contents");
      expect(Array.isArray(result.contents)).toBe(true);
      expect(result.contents.length).toBe(1);

      const data = JSON.parse(result.contents[0].text);
      expect(data).toHaveProperty("members");
      expect(Array.isArray(data.members)).toBe(true);
    }, 15000);

    it("should throw error for invalid state code", async () => {
      await expect(
        handleMembersByStateResource(
          "congress-gov://member/state/XX",
          congressApiService
        )
      ).rejects.toThrow(InvalidParameterError);
    });

    it("should handle lowercase state codes", async () => {
      const result = await handleMembersByStateResource(
        "congress-gov://member/state/ca",
        congressApiService
      );

      expect(result).toBeDefined();
      expect(result).toHaveProperty("contents");
    }, 15000);
  });

  describe("Members by District", () => {
    it("should handle members by district resource", async () => {
      const result = await handleMembersByDistrictResource(
        testData.members.subResourceUris.byDistrict,
        congressApiService
      );

      expect(result).toBeDefined();
      expect(result).toHaveProperty("contents");
      expect(Array.isArray(result.contents)).toBe(true);
      expect(result.contents.length).toBe(1);

      const data = JSON.parse(result.contents[0].text);
      expect(data).toHaveProperty("members");
      expect(Array.isArray(data.members)).toBe(true);
    }, 15000);

    it("should throw error for invalid district number", async () => {
      await expect(
        handleMembersByDistrictResource(
          "congress-gov://member/state/CA/district/99",
          congressApiService
        )
      ).rejects.toThrow(InvalidParameterError);
    });

    it("should handle at-large districts (district 0)", async () => {
      const result = await handleMembersByDistrictResource(
        "congress-gov://member/state/WY/district/0",
        congressApiService
      );

      expect(result).toBeDefined();
      expect(result).toHaveProperty("contents");
    }, 15000);
  });

  describe("Members by Congress/State/District", () => {
    it("should handle members by congress/state/district resource", async () => {
      const result = await handleMembersByCongressStateDistrictResource(
        testData.members.subResourceUris.byCongressStateDistrict,
        congressApiService
      );

      expect(result).toBeDefined();
      expect(result).toHaveProperty("contents");
      expect(Array.isArray(result.contents)).toBe(true);
      expect(result.contents.length).toBe(1);

      const data = JSON.parse(result.contents[0].text);
      expect(data).toHaveProperty("members");
      expect(Array.isArray(data.members)).toBe(true);
    }, 15000);

    it("should throw error for invalid congress number", async () => {
      await expect(
        handleMembersByCongressStateDistrictResource(
          "congress-gov://member/congress/abc/state/CA/district/5",
          congressApiService
        )
      ).rejects.toThrow(InvalidParameterError);
    });

    it("should throw error for invalid URI format", async () => {
      await expect(
        handleMembersByCongressStateDistrictResource(
          "congress-gov://member/congress/118/state/CA",
          congressApiService
        )
      ).rejects.toThrow(ResourceNotFoundError);
    });
  });

  describe("Error Handling", () => {
    it("should handle non-existent members by state", async () => {
      // This should not throw as even if no members are found, the API should return an empty array
      const result = await handleMembersByStateResource(
        "congress-gov://member/state/AS", // American Samoa - likely fewer members
        congressApiService
      );

      expect(result).toBeDefined();
      expect(result).toHaveProperty("contents");
    }, 15000);
  });
});
