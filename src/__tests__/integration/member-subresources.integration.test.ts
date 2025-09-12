import { createTestServer, testData } from "../utils/testServer.js";
import { createTestClient } from "../utils/mcpClient.js";
import {
  ResourceNotFoundError,
  InvalidParameterError,
} from "../../utils/errors.js";

/**
 * Integration tests for member sub-resource handlers
 * These tests validate member sub-resource functionality with real Congress.gov API calls
 */
describe("Member Sub-Resources Integration Tests", () => {
  const server = createTestServer();
  const client = createTestClient(server);

  describe("Member Sponsored Legislation", () => {
    it("should handle member sponsored legislation resource", async () => {
      const result = await client.readResource(
        testData.members.subResourceUris.sponsoredLegislation
      );

      expect(result).toBeDefined();
      expect(result).toHaveProperty("contents");
      expect(Array.isArray(result.contents)).toBe(true);
      expect(result.contents.length).toBe(1);
      expect(result.contents[0]).toHaveProperty("uri");
      expect(result.contents[0]).toHaveProperty("mimeType", "application/json");
      expect(result.contents[0]).toHaveProperty("text");

      const data = JSON.parse(String(result.contents[0].text));
      expect(data).toHaveProperty("sponsoredLegislation");
      expect(Array.isArray(data.sponsoredLegislation)).toBe(true);
    }, 15000);

    it("should throw error for invalid URI format", async () => {
      await expect(
        client.readResource(
          "congress-gov://member/INVALID/sponsored-legislation"
        )
      ).rejects.toThrow(InvalidParameterError);
    });

    it("should handle base member resource (no sub-resource)", async () => {
      const result = await client.readResource("congress-gov://member/P000197");
      expect(result).toBeDefined();
      expect(result).toHaveProperty("contents");
      const data = JSON.parse(String(result.contents[0].text));
      expect(data).toHaveProperty("member");
    });
  });

  describe("Member Cosponsored Legislation", () => {
    it("should handle member cosponsored legislation resource", async () => {
      const result = await client.readResource(
        testData.members.subResourceUris.cosponsoredLegislation
      );

      expect(result).toBeDefined();
      expect(result).toHaveProperty("contents");
      expect(Array.isArray(result.contents)).toBe(true);
      expect(result.contents.length).toBe(1);

      const data = JSON.parse(String(result.contents[0].text));
      expect(data).toHaveProperty("cosponsoredLegislation");
      expect(Array.isArray(data.cosponsoredLegislation)).toBe(true);
    }, 15000);

    it("should throw error for invalid BioguideId format", async () => {
      await expect(
        client.readResource(
          "congress-gov://member/invalid123/cosponsored-legislation"
        )
      ).rejects.toThrow(InvalidParameterError);
    });
  });

  describe("Members by State", () => {
    it("should handle members by state resource", async () => {
      const result = await client.readResource(
        testData.members.subResourceUris.byState
      );

      expect(result).toBeDefined();
      expect(result).toHaveProperty("contents");
      expect(Array.isArray(result.contents)).toBe(true);
      expect(result.contents.length).toBe(1);

      const data = JSON.parse(String(result.contents[0].text));
      expect(data).toHaveProperty("members");
      expect(Array.isArray(data.members)).toBe(true);
    }, 15000);

    it("should throw error for invalid state code", async () => {
      await expect(
        client.readResource("congress-gov://member/state/XX")
      ).rejects.toThrow(InvalidParameterError);
    });

    it("should handle lowercase state codes", async () => {
      const result = await client.readResource(
        "congress-gov://member/state/ca"
      );

      expect(result).toBeDefined();
      expect(result).toHaveProperty("contents");
    }, 15000);
  });

  describe("Members by District", () => {
    it("should handle members by district resource", async () => {
      const result = await client.readResource(
        testData.members.subResourceUris.byDistrict
      );

      expect(result).toBeDefined();
      expect(result).toHaveProperty("contents");
      expect(Array.isArray(result.contents)).toBe(true);
      expect(result.contents.length).toBe(1);

      const data = JSON.parse(String(result.contents[0].text));
      expect(data).toHaveProperty("members");
      expect(Array.isArray(data.members)).toBe(true);
    }, 15000);

    it("should throw error for invalid district number", async () => {
      await expect(
        client.readResource("congress-gov://member/state/CA/district/99")
      ).rejects.toThrow(InvalidParameterError);
    });

    it("should handle at-large districts (district 0)", async () => {
      const result = await client.readResource(
        "congress-gov://member/state/WY/district/0"
      );

      expect(result).toBeDefined();
      expect(result).toHaveProperty("contents");
    }, 15000);
  });

  describe("Members by Congress/State/District", () => {
    it("should handle members by congress/state/district resource", async () => {
      const result = await client.readResource(
        testData.members.subResourceUris.byCongressStateDistrict
      );

      expect(result).toBeDefined();
      expect(result).toHaveProperty("contents");
      expect(Array.isArray(result.contents)).toBe(true);
      expect(result.contents.length).toBe(1);

      const data = JSON.parse(String(result.contents[0].text));
      expect(data).toHaveProperty("members");
      expect(Array.isArray(data.members)).toBe(true);
    }, 15000);

    it("should throw error for invalid congress number", async () => {
      await expect(
        client.readResource(
          "congress-gov://member/congress/abc/state/CA/district/5"
        )
      ).rejects.toThrow(InvalidParameterError);
    });

    it("should throw error for invalid URI format", async () => {
      await expect(
        client.readResource("congress-gov://member/congress/118/state/CA")
      ).rejects.toThrow(ResourceNotFoundError);
    });
  });

  describe("Error Handling", () => {
    it("should handle non-existent members by state", async () => {
      // This should not throw as even if no members are found, the API should return an empty array
      const result = await client.readResource(
        "congress-gov://member/state/AS" // American Samoa - likely fewer members
      );

      expect(result).toBeDefined();
      expect(result).toHaveProperty("contents");
    }, 15000);
  });
});
