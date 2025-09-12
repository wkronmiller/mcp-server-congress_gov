import { CongressApiService } from "../../services/CongressApiService.js";
import {
  handleCommitteeBillsResource,
  handleCommitteeReportsResource,
  handleCommitteeNominationsResource,
  handleCommitteeHouseCommunicationsResource,
  handleCommitteeSenateCommunicationsResource,
} from "../../resourceHandlers.js";

/**
 * Integration tests for all committee sub-resource handlers
 * These tests validate the new committee sub-resource functionality
 */
describe("Committee Sub-Resources Integration Tests", () => {
  let congressApiService: CongressApiService;

  // Test data for committee sub-resources
  const testCommitteeData = {
    valid: {
      houseChamber: "house",
      houseCommitteeCode: "hsju00", // House Judiciary Committee
      senateChamber: "senate",
      senateCommitteeCode: "ssga00", // Senate Committee on Governmental Affairs
      congress: "118",
    },
    invalid: {
      chamber: "invalid",
      committeeCode: "invalid00",
    },
  };

  beforeAll(() => {
    congressApiService = new CongressApiService();
  });

  describe("Committee Bills Resource", () => {
    it("should handle committee bills resource URI for House committee", async () => {
      const uri = `congress-gov://committee/${testCommitteeData.valid.houseChamber}/${testCommitteeData.valid.houseCommitteeCode}/bills`;

      const result = await handleCommitteeBillsResource(
        uri,
        congressApiService
      );

      expect(result).toBeDefined();
      expect(result).toHaveProperty("contents");
      expect(Array.isArray(result.contents)).toBe(true);
      expect(result.contents[0]).toHaveProperty("uri", uri);
      expect(result.contents[0]).toHaveProperty("mimeType", "application/json");
      expect(result.contents[0]).toHaveProperty("text");

      const data = JSON.parse(result.contents[0].text);
      expect(data).toHaveProperty("committee-bills");
      expect(data["committee-bills"]).toHaveProperty("bills");
    }, 15000);

    it("should handle committee bills resource URI for Senate committee", async () => {
      const uri = `congress-gov://committee/${testCommitteeData.valid.senateChamber}/${testCommitteeData.valid.senateCommitteeCode}/bills`;

      const result = await handleCommitteeBillsResource(
        uri,
        congressApiService
      );

      expect(result).toBeDefined();
      expect(result).toHaveProperty("contents");
      expect(Array.isArray(result.contents)).toBe(true);
      expect(result.contents[0]).toHaveProperty("uri", uri);
      expect(result.contents[0]).toHaveProperty("mimeType", "application/json");
      expect(result.contents[0]).toHaveProperty("text");

      const data = JSON.parse(result.contents[0].text);
      expect(data).toHaveProperty("committee-bills");
      expect(data["committee-bills"]).toHaveProperty("bills");
    }, 15000);

    it("should handle committee bills resource URI with congress parameter", async () => {
      const uri = `congress-gov://committee/${testCommitteeData.valid.houseChamber}/${testCommitteeData.valid.houseCommitteeCode}/bills?congress=${testCommitteeData.valid.congress}`;

      const result = await handleCommitteeBillsResource(
        uri,
        congressApiService
      );

      expect(result).toBeDefined();
      expect(result).toHaveProperty("contents");
      expect(Array.isArray(result.contents)).toBe(true);
      expect(result.contents[0]).toHaveProperty("uri", uri);
      expect(result.contents[0]).toHaveProperty("mimeType", "application/json");
      expect(result.contents[0]).toHaveProperty("text");

      const data = JSON.parse(result.contents[0].text);
      expect(data).toHaveProperty("committee-bills");
      expect(data["committee-bills"]).toHaveProperty("bills");
    }, 15000);

    it("should throw error for invalid chamber in committee bills URI", async () => {
      const invalidUri = `congress-gov://committee/${testCommitteeData.invalid.chamber}/${testCommitteeData.valid.houseCommitteeCode}/bills`;

      await expect(
        handleCommitteeBillsResource(invalidUri, congressApiService)
      ).rejects.toThrow();
    }, 10000);

    it("should throw error for invalid committee bills URI format", async () => {
      const invalidUri = "congress-gov://committee/invalid/format/bills";

      await expect(
        handleCommitteeBillsResource(invalidUri, congressApiService)
      ).rejects.toThrow();
    }, 10000);
  });

  describe("Committee Reports Resource", () => {
    it("should handle committee reports resource URI for House committee", async () => {
      const uri = `congress-gov://committee/${testCommitteeData.valid.houseChamber}/${testCommitteeData.valid.houseCommitteeCode}/reports`;

      const result = await handleCommitteeReportsResource(
        uri,
        congressApiService
      );

      expect(result).toBeDefined();
      expect(result).toHaveProperty("contents");
      expect(Array.isArray(result.contents)).toBe(true);
      expect(result.contents[0]).toHaveProperty("uri", uri);
      expect(result.contents[0]).toHaveProperty("mimeType", "application/json");
      expect(result.contents[0]).toHaveProperty("text");

      const data = JSON.parse(result.contents[0].text);
      expect(data).toHaveProperty("reports");
    }, 15000);

    it("should handle committee reports resource URI for Senate committee", async () => {
      const uri = `congress-gov://committee/${testCommitteeData.valid.senateChamber}/${testCommitteeData.valid.senateCommitteeCode}/reports`;

      const result = await handleCommitteeReportsResource(
        uri,
        congressApiService
      );

      expect(result).toBeDefined();
      expect(result).toHaveProperty("contents");
      expect(Array.isArray(result.contents)).toBe(true);
      expect(result.contents[0]).toHaveProperty("uri", uri);
      expect(result.contents[0]).toHaveProperty("mimeType", "application/json");
      expect(result.contents[0]).toHaveProperty("text");

      const data = JSON.parse(result.contents[0].text);
      expect(data).toHaveProperty("reports");
    }, 15000);

    it("should throw error for invalid committee reports URI", async () => {
      const invalidUri = `congress-gov://committee/invalid/format/reports`;

      await expect(
        handleCommitteeReportsResource(invalidUri, congressApiService)
      ).rejects.toThrow();
    }, 10000);
  });

  describe("Committee Nominations Resource", () => {
    it("should handle committee nominations resource URI for Senate committee", async () => {
      const uri = `congress-gov://committee/${testCommitteeData.valid.senateChamber}/${testCommitteeData.valid.senateCommitteeCode}/nominations`;

      const result = await handleCommitteeNominationsResource(
        uri,
        congressApiService
      );

      expect(result).toBeDefined();
      expect(result).toHaveProperty("contents");
      expect(Array.isArray(result.contents)).toBe(true);
      expect(result.contents[0]).toHaveProperty("uri", uri);
      expect(result.contents[0]).toHaveProperty("mimeType", "application/json");
      expect(result.contents[0]).toHaveProperty("text");

      const data = JSON.parse(result.contents[0].text);
      expect(data).toHaveProperty("nominations");
    }, 15000);

    it("should handle committee nominations resource URI for House committee", async () => {
      const uri = `congress-gov://committee/${testCommitteeData.valid.houseChamber}/${testCommitteeData.valid.houseCommitteeCode}/nominations`;

      const result = await handleCommitteeNominationsResource(
        uri,
        congressApiService
      );

      expect(result).toBeDefined();
      expect(result).toHaveProperty("contents");
      expect(Array.isArray(result.contents)).toBe(true);
      expect(result.contents[0]).toHaveProperty("uri", uri);
      expect(result.contents[0]).toHaveProperty("mimeType", "application/json");
      expect(result.contents[0]).toHaveProperty("text");

      const data = JSON.parse(result.contents[0].text);
      expect(data).toHaveProperty("nominations");
    }, 15000);

    it("should throw error for invalid committee nominations URI", async () => {
      const invalidUri = `congress-gov://committee/invalid/format/nominations`;

      await expect(
        handleCommitteeNominationsResource(invalidUri, congressApiService)
      ).rejects.toThrow();
    }, 10000);
  });

  describe("Committee House Communications Resource", () => {
    it("should handle committee house communications resource URI for House committee", async () => {
      const uri = `congress-gov://committee/${testCommitteeData.valid.houseChamber}/${testCommitteeData.valid.houseCommitteeCode}/house-communication`;

      const result = await handleCommitteeHouseCommunicationsResource(
        uri,
        congressApiService
      );

      expect(result).toBeDefined();
      expect(result).toHaveProperty("contents");
      expect(Array.isArray(result.contents)).toBe(true);
      expect(result.contents[0]).toHaveProperty("uri", uri);
      expect(result.contents[0]).toHaveProperty("mimeType", "application/json");
      expect(result.contents[0]).toHaveProperty("text");

      const data = JSON.parse(result.contents[0].text);
      expect(data).toHaveProperty("houseCommunications");
    }, 15000);

    it("should handle committee house communications resource URI for Senate committee", async () => {
      const uri = `congress-gov://committee/${testCommitteeData.valid.senateChamber}/${testCommitteeData.valid.senateCommitteeCode}/house-communication`;

      const result = await handleCommitteeHouseCommunicationsResource(
        uri,
        congressApiService
      );

      expect(result).toBeDefined();
      expect(result).toHaveProperty("contents");
      expect(Array.isArray(result.contents)).toBe(true);
      expect(result.contents[0]).toHaveProperty("uri", uri);
      expect(result.contents[0]).toHaveProperty("mimeType", "application/json");
      expect(result.contents[0]).toHaveProperty("text");

      const data = JSON.parse(result.contents[0].text);
      expect(data).toHaveProperty("houseCommunications");
    }, 15000);

    it("should throw error for invalid committee house communications URI", async () => {
      const invalidUri = `congress-gov://committee/invalid/format/house-communication`;

      await expect(
        handleCommitteeHouseCommunicationsResource(
          invalidUri,
          congressApiService
        )
      ).rejects.toThrow();
    }, 10000);
  });

  describe("Committee Senate Communications Resource", () => {
    it("should handle committee senate communications resource URI for Senate committee", async () => {
      const uri = `congress-gov://committee/${testCommitteeData.valid.senateChamber}/${testCommitteeData.valid.senateCommitteeCode}/senate-communication`;

      const result = await handleCommitteeSenateCommunicationsResource(
        uri,
        congressApiService
      );

      expect(result).toBeDefined();
      expect(result).toHaveProperty("contents");
      expect(Array.isArray(result.contents)).toBe(true);
      expect(result.contents[0]).toHaveProperty("uri", uri);
      expect(result.contents[0]).toHaveProperty("mimeType", "application/json");
      expect(result.contents[0]).toHaveProperty("text");

      const data = JSON.parse(result.contents[0].text);
      expect(data).toHaveProperty("senateCommunications");
    }, 15000);

    it("should handle committee senate communications resource URI for House committee", async () => {
      const uri = `congress-gov://committee/${testCommitteeData.valid.houseChamber}/${testCommitteeData.valid.houseCommitteeCode}/senate-communication`;

      const result = await handleCommitteeSenateCommunicationsResource(
        uri,
        congressApiService
      );

      expect(result).toBeDefined();
      expect(result).toHaveProperty("contents");
      expect(Array.isArray(result.contents)).toBe(true);
      expect(result.contents[0]).toHaveProperty("uri", uri);
      expect(result.contents[0]).toHaveProperty("mimeType", "application/json");
      expect(result.contents[0]).toHaveProperty("text");

      const data = JSON.parse(result.contents[0].text);
      expect(data).toHaveProperty("senateCommunications");
    }, 15000);

    it("should throw error for invalid committee senate communications URI", async () => {
      const invalidUri = `congress-gov://committee/invalid/format/senate-communication`;

      await expect(
        handleCommitteeSenateCommunicationsResource(
          invalidUri,
          congressApiService
        )
      ).rejects.toThrow();
    }, 10000);
  });

  describe("URI Pattern Validation", () => {
    it("should validate chamber parameter correctly", async () => {
      const invalidChamberUri = `congress-gov://committee/invalidchamber/${testCommitteeData.valid.houseCommitteeCode}/bills`;

      await expect(
        handleCommitteeBillsResource(invalidChamberUri, congressApiService)
      ).rejects.toThrow("Invalid chamber");
    }, 10000);

    it("should handle congress parameter in query string", async () => {
      const uriWithCongress = `congress-gov://committee/${testCommitteeData.valid.houseChamber}/${testCommitteeData.valid.houseCommitteeCode}/bills?congress=117`;

      const result = await handleCommitteeBillsResource(
        uriWithCongress,
        congressApiService
      );

      expect(result).toBeDefined();
      expect(result).toHaveProperty("contents");
    }, 15000);

    it("should handle malformed URI patterns", async () => {
      const malformedUri = "congress-gov://committee/house/bills"; // Missing committee code

      await expect(
        handleCommitteeBillsResource(malformedUri, congressApiService)
      ).rejects.toThrow();
    }, 10000);
  });

  describe("Error Handling", () => {
    it("should handle API errors gracefully for committee bills", async () => {
      const nonExistentUri = `congress-gov://committee/${testCommitteeData.valid.houseChamber}/${testCommitteeData.invalid.committeeCode}/bills`;

      await expect(
        handleCommitteeBillsResource(nonExistentUri, congressApiService)
      ).rejects.toThrow();
    }, 15000);

    it("should handle API errors gracefully for committee reports", async () => {
      const nonExistentUri = `congress-gov://committee/${testCommitteeData.valid.houseChamber}/${testCommitteeData.invalid.committeeCode}/reports`;

      await expect(
        handleCommitteeReportsResource(nonExistentUri, congressApiService)
      ).rejects.toThrow();
    }, 15000);

    it("should handle API errors gracefully for committee nominations", async () => {
      const nonExistentUri = `congress-gov://committee/${testCommitteeData.valid.houseChamber}/${testCommitteeData.invalid.committeeCode}/nominations`;

      await expect(
        handleCommitteeNominationsResource(nonExistentUri, congressApiService)
      ).rejects.toThrow();
    }, 15000);

    it("should handle API errors gracefully for committee house communications", async () => {
      const nonExistentUri = `congress-gov://committee/${testCommitteeData.valid.houseChamber}/${testCommitteeData.invalid.committeeCode}/house-communication`;

      await expect(
        handleCommitteeHouseCommunicationsResource(
          nonExistentUri,
          congressApiService
        )
      ).rejects.toThrow();
    }, 15000);

    it("should handle API errors gracefully for committee senate communications", async () => {
      const nonExistentUri = `congress-gov://committee/${testCommitteeData.valid.houseChamber}/${testCommitteeData.invalid.committeeCode}/senate-communication`;

      await expect(
        handleCommitteeSenateCommunicationsResource(
          nonExistentUri,
          congressApiService
        )
      ).rejects.toThrow();
    }, 15000);
  });
});
