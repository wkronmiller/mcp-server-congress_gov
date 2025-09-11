import { createServer } from "../../createServer.js";

/**
 * Creates a test MCP server instance with all tools and resources registered
 */
export function createTestServer() {
  // Use the existing createServer function which already sets up everything properly
  return createServer();
}

/**
 * Common test data for integration tests
 */
export const testData = {
  // Valid test parameters that should work with the real API
  bills: {
    valid: {
      congress: "118",
      billType: "hr",
      billNumber: "1",
    },
    uri: "congress-gov://bill/118/hr/1",
  },
  members: {
    valid: {
      memberId: "P000197", // Nancy Pelosi
    },
    uri: "congress-gov://member/P000197",
  },
  congress: {
    valid: {
      congress: "118",
    },
    uri: "congress-gov://congress/118",
  },
  committees: {
    valid: {
      chamber: "house",
      committeeCode: "hsju00",
      congress: "118",
    },
    uri: "congress-gov://committee/118/house/hsju00",
  },
  search: {
    validQuery: "infrastructure",
    validCollection: "bill",
    validFilters: {
      type: "hr",
    },
  },
  subresource: {
    validParentUri: "congress-gov://bill/118/hr/1",
    validSubResource: "actions",
  },
};
