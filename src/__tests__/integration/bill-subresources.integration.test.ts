import { createTestServer, testData } from "../utils/testServer.js";
import { createTestClient } from "../utils/mcpClient.js";

/**
 * Integration tests for all bill sub-resource handlers
 * These tests validate the new bill sub-resource functionality
 */
describe("Bill Sub-Resources Integration Tests", () => {
  const server = createTestServer();
  const client = createTestClient(server);

  describe("Bill Actions Resource", () => {
    it("should handle bill actions resource URI", async () => {
      const uri = `congress-gov://bill/${testData.bills.valid.congress}/${testData.bills.valid.billType}/${testData.bills.valid.billNumber}/actions`;

      const result = await client.readResource(uri);

      expect(result).toBeDefined();
      expect(result).toHaveProperty("contents");
      expect(Array.isArray(result.contents)).toBe(true);
      expect(result.contents[0]).toHaveProperty("uri", uri);
      expect(result.contents[0]).toHaveProperty("mimeType", "application/json");
      expect(result.contents[0]).toHaveProperty("text");

      const data = JSON.parse(String(result.contents[0].text));
      expect(data).toHaveProperty("actions");
    }, 15000);

    it("should throw error for invalid bill actions URI", async () => {
      const invalidUri = "congress-gov://bill/999/hr/99999/actions";

      await expect(client.readResource(invalidUri)).rejects.toThrow();
    }, 10000);
  });

  describe("Bill Amendments Resource", () => {
    it("should handle bill amendments resource URI", async () => {
      const uri = `congress-gov://bill/${testData.bills.valid.congress}/${testData.bills.valid.billType}/${testData.bills.valid.billNumber}/amendments`;

      const result = await client.readResource(uri);

      expect(result).toBeDefined();
      expect(result).toHaveProperty("contents");
      expect(Array.isArray(result.contents)).toBe(true);
      expect(result.contents[0]).toHaveProperty("uri", uri);
      expect(result.contents[0]).toHaveProperty("mimeType", "application/json");
      expect(result.contents[0]).toHaveProperty("text");

      const data = JSON.parse(String(result.contents[0].text));
      expect(data).toHaveProperty("amendments");
    }, 15000);
  });

  describe("Bill Committees Resource", () => {
    it("should handle bill committees resource URI", async () => {
      const uri = `congress-gov://bill/${testData.bills.valid.congress}/${testData.bills.valid.billType}/${testData.bills.valid.billNumber}/committees`;

      const result = await client.readResource(uri);

      expect(result).toBeDefined();
      expect(result).toHaveProperty("contents");
      expect(Array.isArray(result.contents)).toBe(true);
      expect(result.contents[0]).toHaveProperty("uri", uri);
      expect(result.contents[0]).toHaveProperty("mimeType", "application/json");
      expect(result.contents[0]).toHaveProperty("text");

      const data = JSON.parse(String(result.contents[0].text));
      expect(data).toHaveProperty("committees");
    }, 15000);
  });

  describe("Bill Cosponsors Resource", () => {
    it("should handle bill cosponsors resource URI", async () => {
      const uri = `congress-gov://bill/${testData.bills.valid.congress}/${testData.bills.valid.billType}/${testData.bills.valid.billNumber}/cosponsors`;

      const result = await client.readResource(uri);

      expect(result).toBeDefined();
      expect(result).toHaveProperty("contents");
      expect(Array.isArray(result.contents)).toBe(true);
      expect(result.contents[0]).toHaveProperty("uri", uri);
      expect(result.contents[0]).toHaveProperty("mimeType", "application/json");
      expect(result.contents[0]).toHaveProperty("text");

      const data = JSON.parse(String(result.contents[0].text));
      expect(data).toHaveProperty("cosponsors");
    }, 15000);
  });

  describe("Bill Related Bills Resource", () => {
    it("should handle bill related bills resource URI", async () => {
      const uri = `congress-gov://bill/${testData.bills.valid.congress}/${testData.bills.valid.billType}/${testData.bills.valid.billNumber}/relatedbills`;

      const result = await client.readResource(uri);

      expect(result).toBeDefined();
      expect(result).toHaveProperty("contents");
      expect(Array.isArray(result.contents)).toBe(true);
      expect(result.contents[0]).toHaveProperty("uri", uri);
      expect(result.contents[0]).toHaveProperty("mimeType", "application/json");
      expect(result.contents[0]).toHaveProperty("text");

      const data = JSON.parse(String(result.contents[0].text));
      expect(data).toHaveProperty("relatedBills");
    }, 15000);
  });

  describe("Bill Subjects Resource", () => {
    it("should handle bill subjects resource URI", async () => {
      const uri = `congress-gov://bill/${testData.bills.valid.congress}/${testData.bills.valid.billType}/${testData.bills.valid.billNumber}/subjects`;

      const result = await client.readResource(uri);

      expect(result).toBeDefined();
      expect(result).toHaveProperty("contents");
      expect(Array.isArray(result.contents)).toBe(true);
      expect(result.contents[0]).toHaveProperty("uri", uri);
      expect(result.contents[0]).toHaveProperty("mimeType", "application/json");
      expect(result.contents[0]).toHaveProperty("text");

      const data = JSON.parse(String(result.contents[0].text));
      expect(data).toHaveProperty("subjects");
    }, 15000);
  });

  describe("Bill Summaries Resource", () => {
    it("should handle bill summaries resource URI", async () => {
      const uri = `congress-gov://bill/${testData.bills.valid.congress}/${testData.bills.valid.billType}/${testData.bills.valid.billNumber}/summaries`;

      const result = await client.readResource(uri);

      expect(result).toBeDefined();
      expect(result).toHaveProperty("contents");
      expect(Array.isArray(result.contents)).toBe(true);
      expect(result.contents[0]).toHaveProperty("uri", uri);
      expect(result.contents[0]).toHaveProperty("mimeType", "application/json");
      expect(result.contents[0]).toHaveProperty("text");

      const data = JSON.parse(String(result.contents[0].text));
      expect(data).toHaveProperty("summaries");
    }, 15000);
  });

  describe("Bill Text Resource", () => {
    it("should handle bill text resource URI", async () => {
      const uri = `congress-gov://bill/${testData.bills.valid.congress}/${testData.bills.valid.billType}/${testData.bills.valid.billNumber}/text`;

      const result = await client.readResource(uri);

      expect(result).toBeDefined();
      expect(result).toHaveProperty("contents");
      expect(Array.isArray(result.contents)).toBe(true);
      expect(result.contents[0]).toHaveProperty("uri", uri);
      expect(result.contents[0]).toHaveProperty("mimeType", "application/json");
      expect(result.contents[0]).toHaveProperty("text");

      const data = JSON.parse(String(result.contents[0].text));
      expect(data).toHaveProperty("textVersions");
    }, 15000);
  });

  describe("Bill Titles Resource", () => {
    it("should handle bill titles resource URI", async () => {
      const uri = `congress-gov://bill/${testData.bills.valid.congress}/${testData.bills.valid.billType}/${testData.bills.valid.billNumber}/titles`;

      const result = await client.readResource(uri);

      expect(result).toBeDefined();
      expect(result).toHaveProperty("contents");
      expect(Array.isArray(result.contents)).toBe(true);
      expect(result.contents[0]).toHaveProperty("uri", uri);
      expect(result.contents[0]).toHaveProperty("mimeType", "application/json");
      expect(result.contents[0]).toHaveProperty("text");

      const data = JSON.parse(String(result.contents[0].text));
      expect(data).toHaveProperty("titles");
    }, 15000);
  });

  describe("URI Parsing", () => {
    it("should handle various bill types in URIs", async () => {
      const testCases = [
        { billType: "hr", expectedType: "hr" },
        { billType: "s", expectedType: "s" },
        { billType: "hjres", expectedType: "hjres" },
        { billType: "sjres", expectedType: "sjres" },
      ];

      for (const testCase of testCases) {
        const uri = `congress-gov://bill/118/${testCase.billType}/1/actions`;

        // This should not throw an error for valid bill types
        expect(async () => {
          await client.readResource(uri);
        }).not.toThrow();
      }
    }, 30000);

    it("should reject invalid URI formats", async () => {
      const invalidUris = [
        "congress-gov://bill/118/hr/actions", // missing bill number
        "congress-gov://bill/hr/1/actions", // missing congress
        "congress-gov://bill/118/hr/1/invalid-subresource", // invalid sub-resource
        "invalid://bill/118/hr/1/actions", // invalid protocol
      ];

      for (const invalidUri of invalidUris) {
        await expect(client.readResource(invalidUri)).rejects.toThrow();
      }
    });
  });

  describe("Service Method Integration (via Resources)", () => {
    it("should fetch all bill sub-resources via URIs", async () => {
      const base = `congress-gov://bill/${testData.bills.valid.congress}/${testData.bills.valid.billType}/${testData.bills.valid.billNumber}`;
      const uris = [
        `${base}/actions`,
        `${base}/amendments`,
        `${base}/committees`,
        `${base}/cosponsors`,
        `${base}/relatedbills`,
        `${base}/subjects`,
        `${base}/summaries`,
        `${base}/text`,
        `${base}/titles`,
      ];

      for (const uri of uris) {
        const result = await client.readResource(uri);
        expect(result).toBeDefined();
        expect(result).toHaveProperty("contents");
      }
    }, 45000);
  });
});
