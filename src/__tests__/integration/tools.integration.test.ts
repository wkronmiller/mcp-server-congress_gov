import { createTestServer, testData } from "../utils/testServer.js";
import { createTestClient } from "../utils/mcpClient.js";

/**
 * Integration tests for MCP tools functionality
 * These tests validate tool-like operations with real Congress.gov API calls
 */
describe("Congress.gov MCP Tools Integration Tests", () => {
  const server = createTestServer();
  const client = createTestClient(server);

  describe("Search Tool Functionality", () => {
    it("should search for bills via tool", async () => {
      const toolResult = await client.callTool("congress_search", {
        collection: "bill",
        limit: 2,
      });
      expect(toolResult).toBeDefined();
      const data = JSON.parse((toolResult.content?.[0] as any).text);
      expect(data).toHaveProperty("bills");
      expect(Array.isArray(data.bills)).toBe(true);
      expect(data.bills.length).toBeLessThanOrEqual(2);
    }, 15000);

    it("should search for members via tool", async () => {
      const toolResult = await client.callTool("congress_search", {
        collection: "member",
        limit: 2,
      });
      expect(toolResult).toBeDefined();
      const data = JSON.parse((toolResult.content?.[0] as any).text);
      expect(data).toHaveProperty("members");
      expect(Array.isArray(data.members)).toBe(true);
      expect(data.members.length).toBeLessThanOrEqual(2);
    }, 15000);

    it("should handle search with query parameters via tool", async () => {
      const toolResult = await client.callTool("congress_search", {
        collection: "bill",
        query: "healthcare",
        limit: 1,
      });
      const data = JSON.parse((toolResult.content?.[0] as any).text);
      expect(data).toBeDefined();
      expect(data).toHaveProperty("bills");
      expect(Array.isArray(data.bills)).toBe(true);
    }, 15000);

    it("should handle invalid collection types via tool", async () => {
      await expect(
        client.callTool("congress_search", {
          collection: "invalid",
          limit: 1,
        } as any)
      ).rejects.toThrow();
    });
  });

  describe("GetSubResource Tool Functionality", () => {
    it("should get bill actions via tool", async () => {
      const toolResult = await client.callTool("congress_getSubResource", {
        parentUri: testData.bills.uri,
        subResource: "actions",
        limit: 2,
      });
      const data = JSON.parse((toolResult.content?.[0] as any).text);
      expect(data).toBeDefined();
      expect(data).toHaveProperty("actions");
      expect(Array.isArray(data.actions)).toBe(true);
    }, 15000);

    it("should get bill subjects via tool", async () => {
      const toolResult = await client.callTool("congress_getSubResource", {
        parentUri: testData.bills.uri,
        subResource: "subjects",
      });
      const data = JSON.parse((toolResult.content?.[0] as any).text);
      expect(data).toBeDefined();
      expect(data).toHaveProperty("subjects");
    }, 15000);

    it("should get bill text via tool", async () => {
      const toolResult = await client.callTool("congress_getSubResource", {
        parentUri: testData.bills.uri,
        subResource: "text",
      });
      const data = JSON.parse((toolResult.content?.[0] as any).text);
      expect(data).toBeDefined();
      expect(data).toHaveProperty("textVersions");
    }, 15000);

    it("should handle invalid sub-resource types via tool", async () => {
      await expect(
        client.callTool("congress_getSubResource", {
          parentUri: testData.bills.uri,
          subResource: "invalid",
        } as any)
      ).rejects.toThrow();
    });

    it("should handle malformed resource URIs via tool", async () => {
      await expect(
        client.callTool("congress_getSubResource", {
          parentUri: "invalid-uri",
          subResource: "actions",
        })
      ).rejects.toThrow();
    });
  });

  describe("Tool Parameter Validation", () => {
    it("should handle missing optional parameters", async () => {
      const toolResult = await client.callTool("congress_search", {
        collection: "bill",
      });
      const data = JSON.parse((toolResult.content?.[0] as any).text);
      expect(data).toBeDefined();
      expect(data).toHaveProperty("bills");
    });

    it("should handle limit parameter correctly", async () => {
      const toolResult = await client.callTool("congress_search", {
        collection: "bill",
        limit: 1,
      });
      const data = JSON.parse((toolResult.content?.[0] as any).text);
      expect(data).toBeDefined();
      expect(data.bills?.length).toBeLessThanOrEqual(1);
    }, 15000);

    it("should handle offset parameter correctly", async () => {
      const toolResult = await client.callTool("congress_search", {
        collection: "bill",
        limit: 1,
        offset: 5,
      });
      const data = JSON.parse((toolResult.content?.[0] as any).text);
      expect(data).toBeDefined();
      expect(data).toHaveProperty("bills");
    }, 15000);
  });

  describe("Tool Error Handling", () => {
    it("should handle non-existent resources via tool", async () => {
      await expect(
        client.callTool("congress_getSubResource", {
          parentUri: "congress-gov://bill/999/hr/999999",
          subResource: "actions",
        })
      ).rejects.toThrow();
    });
  });
});
