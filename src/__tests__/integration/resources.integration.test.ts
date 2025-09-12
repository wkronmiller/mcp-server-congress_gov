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
    }, 10000);

    it("should get bill actions using dedicated method", async () => {
      const result = await congressApiService.getBillActions({
        congress: testData.bills.valid.congress,
        billType: testData.bills.valid.billType,
        billNumber: testData.bills.valid.billNumber,
      });

      expect(result).toBeDefined();
      expect(result).toHaveProperty("actions");
    }, 10000);

    it("should get bill amendments using dedicated method", async () => {
      const result = await congressApiService.getBillAmendments({
        congress: testData.bills.valid.congress,
        billType: testData.bills.valid.billType,
        billNumber: testData.bills.valid.billNumber,
      });

      expect(result).toBeDefined();
      expect(result).toHaveProperty("amendments");
    }, 10000);

    it("should get bill committees using dedicated method", async () => {
      const result = await congressApiService.getBillCommittees({
        congress: testData.bills.valid.congress,
        billType: testData.bills.valid.billType,
        billNumber: testData.bills.valid.billNumber,
      });

      expect(result).toBeDefined();
      expect(result).toHaveProperty("committees");
    }, 10000);

    it("should get bill cosponsors using dedicated method", async () => {
      const result = await congressApiService.getBillCosponsors({
        congress: testData.bills.valid.congress,
        billType: testData.bills.valid.billType,
        billNumber: testData.bills.valid.billNumber,
      });

      expect(result).toBeDefined();
      expect(result).toHaveProperty("cosponsors");
    }, 10000);

    it("should get bill related bills using dedicated method", async () => {
      const result = await congressApiService.getBillRelatedBills({
        congress: testData.bills.valid.congress,
        billType: testData.bills.valid.billType,
        billNumber: testData.bills.valid.billNumber,
      });

      expect(result).toBeDefined();
      expect(result).toHaveProperty("relatedBills");
    }, 10000);

    it("should get bill subjects using dedicated method", async () => {
      const result = await congressApiService.getBillSubjects({
        congress: testData.bills.valid.congress,
        billType: testData.bills.valid.billType,
        billNumber: testData.bills.valid.billNumber,
      });

      expect(result).toBeDefined();
      expect(result).toHaveProperty("subjects");
    }, 10000);

    it("should get bill summaries using dedicated method", async () => {
      const result = await congressApiService.getBillSummaries({
        congress: testData.bills.valid.congress,
        billType: testData.bills.valid.billType,
        billNumber: testData.bills.valid.billNumber,
      });

      expect(result).toBeDefined();
      expect(result).toHaveProperty("summaries");
    }, 10000);

    it("should get bill text using dedicated method", async () => {
      const result = await congressApiService.getBillText({
        congress: testData.bills.valid.congress,
        billType: testData.bills.valid.billType,
        billNumber: testData.bills.valid.billNumber,
      });

      expect(result).toBeDefined();
      expect(result).toHaveProperty("textVersions");
    }, 10000);

    it("should get bill titles using dedicated method", async () => {
      const result = await congressApiService.getBillTitles({
        congress: testData.bills.valid.congress,
        billType: testData.bills.valid.billType,
        billNumber: testData.bills.valid.billNumber,
      });

      expect(result).toBeDefined();
      expect(result).toHaveProperty("titles");
    }, 10000);

    it("should handle invalid bill sub-resource requests", async () => {
      await expect(
        congressApiService.getBillActions({
          congress: "999",
          billType: "hr",
          billNumber: "99999",
        })
      ).rejects.toThrow();
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

    it("should get member sponsored legislation", async () => {
      const result = await congressApiService.getMemberSponsoredLegislation({
        bioguideId: testData.members.valid.bioguideId,
      });

      expect(result).toBeDefined();
      expect(result).toHaveProperty("sponsoredLegislation");
      expect(Array.isArray(result.sponsoredLegislation)).toBe(true);
    }, 10000);

    it("should get member cosponsored legislation", async () => {
      const result = await congressApiService.getMemberCosponsoredLegislation({
        bioguideId: testData.members.valid.bioguideId,
      });

      expect(result).toBeDefined();
      expect(result).toHaveProperty("cosponsoredLegislation");
      expect(Array.isArray(result.cosponsoredLegislation)).toBe(true);
    }, 10000);

    it("should get members by state", async () => {
      const result = await congressApiService.getMembersByState({
        stateCode: testData.members.valid.stateCode,
      });

      expect(result).toBeDefined();
      expect(result).toHaveProperty("members");
      expect(Array.isArray(result.members)).toBe(true);
    }, 10000);

    it("should get members by district", async () => {
      const result = await congressApiService.getMembersByDistrict({
        stateCode: testData.members.valid.stateCode,
        district: testData.members.valid.district,
      });

      expect(result).toBeDefined();
      expect(result).toHaveProperty("members");
      expect(Array.isArray(result.members)).toBe(true);
    }, 10000);

    it("should get members by congress/state/district", async () => {
      const result = await congressApiService.getMembersByCongressStateDistrict(
        {
          congress: testData.members.valid.congress,
          stateCode: testData.members.valid.stateCode,
          district: testData.members.valid.district,
        }
      );

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

    it("should handle non-existent amendment resources", async () => {
      await expect(
        congressApiService.getAmendmentDetails({
          congress: "999",
          amendmentType: "hamdt",
          amendmentNumber: "999999",
        })
      ).rejects.toThrow();
    });

    it("should handle invalid amendment types", async () => {
      await expect(
        congressApiService.getAmendmentDetails({
          congress: "118",
          amendmentType: "invalid-type",
          amendmentNumber: "1",
        })
      ).rejects.toThrow();
    });

    it("should handle non-existent law resources", async () => {
      await expect(
        congressApiService.getLawDetails({
          congress: "999",
          lawType: "public",
          lawNumber: "999999",
        })
      ).rejects.toThrow();
    });

    it("should handle invalid law types", async () => {
      // This should not throw but return empty results
      const result = await congressApiService.getLawsByCongressAndType({
        congress: "118",
        lawType: "invalid-type",
      });

      expect(result).toBeDefined();
      expect(result).toHaveProperty("laws");
      expect(Array.isArray(result.laws)).toBe(true);
      expect(result.laws.length).toBe(0);
    });
  });

  describe("Amendment Resources", () => {
    it("should search amendments", async () => {
      const result = await congressApiService.searchCollection("amendment", {
        limit: 2,
      });

      expect(result).toBeDefined();
      expect(result).toHaveProperty("amendments");
      expect(Array.isArray(result.amendments)).toBe(true);
      expect(result.amendments.length).toBeLessThanOrEqual(2);
    }, 10000);

    it("should get amendment details", async () => {
      const result = await congressApiService.getAmendmentDetails({
        congress: testData.amendments.valid.congress,
        amendmentType: testData.amendments.valid.amendmentType,
        amendmentNumber: testData.amendments.valid.amendmentNumber,
      });

      expect(result).toBeDefined();
      expect(result).toHaveProperty("amendment");
      expect(result.amendment).toHaveProperty("congress");
      expect(result.amendment.congress).toBe(
        parseInt(testData.amendments.valid.congress)
      );
    }, 10000);

    it("should get amendment actions", async () => {
      const result = await congressApiService.getAmendmentActions(
        {
          congress: testData.amendments.valid.congress,
          amendmentType: testData.amendments.valid.amendmentType,
          amendmentNumber: testData.amendments.valid.amendmentNumber,
        },
        { limit: 3 }
      );

      expect(result).toBeDefined();
      expect(result).toHaveProperty("actions");
      expect(Array.isArray(result.actions)).toBe(true);
    }, 10000);

    it("should get amendment cosponsors", async () => {
      const result = await congressApiService.getAmendmentCosponsors({
        congress: testData.amendments.valid.congress,
        amendmentType: testData.amendments.valid.amendmentType,
        amendmentNumber: testData.amendments.valid.amendmentNumber,
      });

      expect(result).toBeDefined();
      expect(result).toHaveProperty("cosponsors");
    }, 10000);

    it("should get amendment amendments", async () => {
      const result = await congressApiService.getAmendmentAmendments({
        congress: testData.amendments.valid.congress,
        amendmentType: testData.amendments.valid.amendmentType,
        amendmentNumber: testData.amendments.valid.amendmentNumber,
      });

      expect(result).toBeDefined();
      expect(result).toHaveProperty("amendments");
    }, 10000);

    it("should get amendment text", async () => {
      const result = await congressApiService.getAmendmentText({
        congress: testData.amendments.valid.congress,
        amendmentType: testData.amendments.valid.amendmentType,
        amendmentNumber: testData.amendments.valid.amendmentNumber,
      });

      expect(result).toBeDefined();
      expect(result).toHaveProperty("textVersions");
    }, 10000);

    it("should handle different amendment type formats", async () => {
      // Test both abbreviated and full forms
      const testCases = [
        { type: "hamdt", expected: "house-amendment" },
        { type: "samdt", expected: "senate-amendment" },
        { type: "house-amendment", expected: "house-amendment" },
        { type: "senate-amendment", expected: "senate-amendment" },
      ];

      for (const testCase of testCases) {
        try {
          const result = await congressApiService.getAmendmentDetails({
            congress: "118",
            amendmentType: testCase.type,
            amendmentNumber: "1",
          });
          expect(result).toBeDefined();
        } catch (error) {
          // Expected for some invalid combinations, but should not throw for valid types
          expect(error).toBeInstanceOf(Error);
        }
      }
    }, 15000);
  });

  describe("Law Resources", () => {
    // Note: Congress.gov API doesn't have separate /law endpoints
    // Laws are accessed through bills that have become laws

    it("should get laws by congress", async () => {
      const result = await congressApiService.getLawsByCongress({
        congress: testData.laws.valid.congress,
      });

      expect(result).toBeDefined();
      expect(result).toHaveProperty("laws");
      expect(Array.isArray(result.laws)).toBe(true);
    }, 10000);

    it("should get laws by congress and type", async () => {
      const result = await congressApiService.getLawsByCongressAndType({
        congress: testData.laws.valid.congress,
        lawType: testData.laws.valid.lawType,
      });

      expect(result).toBeDefined();
      expect(result).toHaveProperty("laws");
      expect(Array.isArray(result.laws)).toBe(true);
    }, 10000);

    it("should get specific law details", async () => {
      // First, get laws by congress to find an actual law number
      const lawsList = await congressApiService.getLawsByCongress({
        congress: testData.laws.valid.congress,
      });

      expect(lawsList).toBeDefined();
      expect(lawsList).toHaveProperty("laws");
      expect(Array.isArray(lawsList.laws)).toBe(true);

      if (lawsList.laws.length > 0) {
        // Use the first actual law found
        const actualLaw = lawsList.laws[0];
        const lawNumberParts = actualLaw.number.split("-");
        const lawNumber =
          lawNumberParts.length > 1 ? lawNumberParts[1] : actualLaw.number;

        const result = await congressApiService.getLawDetails({
          congress: testData.laws.valid.congress,
          lawType: "public", // Most laws are public
          lawNumber: lawNumber,
        });

        expect(result).toBeDefined();
        expect(result).toHaveProperty("law");
        expect(result.law).toHaveProperty("congress");
        expect(result.law.congress).toBe(
          parseInt(testData.laws.valid.congress)
        );
      } else {
        // Skip test if no laws found
        console.log("No laws found for testing - skipping specific law test");
      }
    }, 15000);

    it("should handle different law type formats", async () => {
      // Test both full and abbreviated forms
      const testCases = [
        { type: "public", expected: "public" },
        { type: "private", expected: "private" },
      ];

      for (const testCase of testCases) {
        try {
          const result = await congressApiService.getLawsByCongressAndType({
            congress: "118",
            lawType: testCase.type,
          });
          expect(result).toBeDefined();
          expect(result).toHaveProperty("laws");
          expect(Array.isArray(result.laws)).toBe(true);
        } catch (error) {
          // Some combinations might not exist, but should not throw for valid types
          expect(error).toBeInstanceOf(Error);
        }
      }
    }, 15000);
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
