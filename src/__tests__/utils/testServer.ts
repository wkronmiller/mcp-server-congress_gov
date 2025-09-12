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
      bioguideId: "P000197", // Same as memberId for consistency
      stateCode: "CA",
      district: "5", // Nancy Pelosi's district
      congress: "118",
    },
    uri: "congress-gov://member/P000197",
    subResourceUris: {
      sponsoredLegislation:
        "congress-gov://member/P000197/sponsored-legislation",
      cosponsoredLegislation:
        "congress-gov://member/P000197/cosponsored-legislation",
      byState: "congress-gov://member/state/CA",
      byDistrict: "congress-gov://member/state/CA/district/5",
      byCongressStateDistrict:
        "congress-gov://member/congress/118/state/CA/district/5",
    },
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
  amendments: {
    valid: {
      congress: "109",
      amendmentType: "hamdt", // Use the API's abbreviated form (lowercase for input)
      amendmentNumber: "2",
    },
    uriBase: "congress-gov://amendment/109/hamdt/2",
    uris: {
      basic: "congress-gov://amendment/109/hamdt/2",
      actions: "congress-gov://amendment/109/hamdt/2/actions",
      cosponsors: "congress-gov://amendment/109/hamdt/2/cosponsors",
      amendments: "congress-gov://amendment/109/hamdt/2/amendments",
      text: "congress-gov://amendment/109/hamdt/2/text",
    },
  },
  laws: {
    valid: {
      congress: "118",
      lawType: "public",
      lawNumber: "206", // Using a law that likely exists based on test output
    },
    uris: {
      specific: "congress-gov://law/118/public/206",
      byCongressAndType: "congress-gov://law/118/public",
      byCongress: "congress-gov://law/118",
    },
  },
  congressionalRecord: {
    valid: {
      volumeNumber: "169", // 2023 volume
      issueNumber: "1", // First issue of 2023
      year: "2025", // Use current year
      month: "09", // Current month
      day: "10", // Recent date
    },
    uris: {
      general: "congress-gov://congressional-record",
      daily: "congress-gov://daily-congressional-record/169/1",
      dailyArticles: "congress-gov://daily-congressional-record/169/1/articles",
      bound: "congress-gov://bound-congressional-record/2025/09/10",
    },
  },
  // Communication resources test data
  communications: {
    houseCommunication: {
      valid: {
        congress: "118",
        communicationType: "ec", // Executive Communication
        communicationNumber: "1",
      },
      uri: "congress-gov://house-communication/118/ec/1",
    },
    senateCommunication: {
      valid: {
        congress: "118",
        communicationType: "ec", // Executive Communication
        communicationNumber: "1",
      },
      uri: "congress-gov://senate-communication/118/ec/1",
    },
    houseRequirement: {
      valid: {
        requirementNumber: "1000", // Using a 4-digit number as typical
      },
      uri: "congress-gov://house-requirement/1000",
      matchingCommunicationsUri:
        "congress-gov://house-requirement/1000/matching-communications",
    },
  },
};
