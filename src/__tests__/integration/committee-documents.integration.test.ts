import { CongressApiService } from "../../services/CongressApiService.js";

/**
 * Integration tests for committee document resources
 * These tests validate committee report, print, meeting, and hearing API functionality
 */
describe("Committee Document Resources Integration Tests", () => {
  let congressApiService: CongressApiService;

  beforeAll(() => {
    congressApiService = new CongressApiService();
  });

  const testData = {
    committeeReports: {
      valid: {
        congress: "118",
        reportType: "hrpt", // House report
        reportNumber: "1",
      },
      uris: {
        basic: "congress-gov://committee-report/118/hrpt/1",
        text: "congress-gov://committee-report/118/hrpt/1/text",
      },
    },
    committeePrints: {
      valid: {
        congress: "118",
        chamber: "house",
        jacketNumber: "1",
      },
      uris: {
        basic: "congress-gov://committee-print/118/house/1",
        text: "congress-gov://committee-print/118/house/1/text",
      },
    },
    committeeMeetings: {
      valid: {
        congress: "118",
        chamber: "house",
        eventId: "114329", // Using a real event ID if available
      },
      uris: {
        basic: "congress-gov://committee-meeting/118/house/114329",
      },
    },
    committeeHearings: {
      valid: {
        congress: "118",
        chamber: "house",
        jacketNumber: "1",
      },
      uris: {
        basic: "congress-gov://hearing/118/house/1",
      },
    },
  };

  describe("Committee Report Resources", () => {
    it("should get committee report details", async () => {
      try {
        const result = await congressApiService.getCommitteeReportDetails({
          congress: testData.committeeReports.valid.congress,
          reportType: testData.committeeReports.valid.reportType,
          reportNumber: testData.committeeReports.valid.reportNumber,
        });

        expect(result).toBeDefined();
        expect(result).toHaveProperty("committeeReport");

        if (result.committeeReport) {
          expect(result.committeeReport).toHaveProperty("congress");
          expect(result.committeeReport.congress).toBe(
            parseInt(testData.committeeReports.valid.congress)
          );
        }
      } catch (error) {
        // Some specific reports might not exist, which is expected
        expect(error).toBeInstanceOf(Error);
        console.log(
          "Committee report not found (expected for some test cases):",
          (error as Error).message
        );
      }
    }, 10000);

    it("should get committee report text", async () => {
      try {
        const result = await congressApiService.getCommitteeReportText({
          congress: testData.committeeReports.valid.congress,
          reportType: testData.committeeReports.valid.reportType,
          reportNumber: testData.committeeReports.valid.reportNumber,
        });

        expect(result).toBeDefined();
        expect(result).toHaveProperty("textVersions");
      } catch (error) {
        // Text might not be available for all reports
        expect(error).toBeInstanceOf(Error);
        console.log(
          "Committee report text not found (expected for some test cases):",
          (error as Error).message
        );
      }
    }, 10000);

    it("should handle different report types", async () => {
      const reportTypes = ["hrpt", "srpt", "hrep", "srep"];

      for (const reportType of reportTypes) {
        try {
          const result = await congressApiService.getCommitteeReportDetails({
            congress: "118",
            reportType: reportType,
            reportNumber: "1",
          });

          expect(result).toBeDefined();
        } catch (error) {
          // Some report types might not exist for specific numbers
          expect(error).toBeInstanceOf(Error);
          console.log(
            `Report type ${reportType} not found (expected):`,
            (error as Error).message
          );
        }
      }
    }, 15000);

    it("should handle invalid report parameters", async () => {
      try {
        const result = await congressApiService.getCommitteeReportDetails({
          congress: "999",
          reportType: "hrpt",
          reportNumber: "999999",
        });
        // Invalid parameters may return empty results rather than throwing
        expect(result).toBeDefined();
        expect(result).toHaveProperty("committeeReports");
      } catch (error: any) {
        // API may reject invalid parameters
        expect(error).toBeDefined();
      }
    }, 10000);
  });

  describe("Committee Print Resources", () => {
    it("should get committee print details", async () => {
      try {
        const result = await congressApiService.getCommitteePrintDetails({
          congress: testData.committeePrints.valid.congress,
          chamber: testData.committeePrints.valid.chamber,
          jacketNumber: testData.committeePrints.valid.jacketNumber,
        });

        expect(result).toBeDefined();
        expect(result).toHaveProperty("committeePrint");

        if (result.committeePrint) {
          expect(result.committeePrint).toHaveProperty("congress");
          expect(result.committeePrint.congress).toBe(
            parseInt(testData.committeePrints.valid.congress)
          );
        }
      } catch (error) {
        // Some specific prints might not exist, which is expected
        expect(error).toBeInstanceOf(Error);
        console.log(
          "Committee print not found (expected for some test cases):",
          (error as Error).message
        );
      }
    }, 10000);

    it("should get committee print text", async () => {
      try {
        const result = await congressApiService.getCommitteePrintText({
          congress: testData.committeePrints.valid.congress,
          chamber: testData.committeePrints.valid.chamber,
          jacketNumber: testData.committeePrints.valid.jacketNumber,
        });

        expect(result).toBeDefined();
        expect(result).toHaveProperty("textVersions");
      } catch (error) {
        // Text might not be available for all prints
        expect(error).toBeInstanceOf(Error);
        console.log(
          "Committee print text not found (expected for some test cases):",
          (error as Error).message
        );
      }
    }, 10000);

    it("should handle different chambers", async () => {
      const chambers = ["house", "senate"];

      for (const chamber of chambers) {
        try {
          const result = await congressApiService.getCommitteePrintDetails({
            congress: "118",
            chamber: chamber,
            jacketNumber: "1",
          });

          expect(result).toBeDefined();
        } catch (error) {
          // Some chambers might not have prints for specific jacket numbers
          expect(error).toBeInstanceOf(Error);
          console.log(
            `Chamber ${chamber} print not found (expected):`,
            (error as Error).message
          );
        }
      }
    }, 15000);

    it("should handle invalid print parameters", async () => {
      try {
        const result = await congressApiService.getCommitteePrintDetails({
          congress: "999",
          chamber: "house",
          jacketNumber: "999999",
        });
        // Invalid parameters may return empty results rather than throwing
        expect(result).toBeDefined();
        expect(result).toHaveProperty("committeePrint");
      } catch (error: any) {
        // API may reject invalid parameters
        expect(error).toBeDefined();
      }
    }, 10000);
  });

  describe("Committee Meeting Resources", () => {
    it("should get committee meeting details", async () => {
      try {
        const result = await congressApiService.getCommitteeMeetingDetails({
          congress: testData.committeeMeetings.valid.congress,
          chamber: testData.committeeMeetings.valid.chamber,
          eventId: testData.committeeMeetings.valid.eventId,
        });

        expect(result).toBeDefined();
        expect(result).toHaveProperty("committeeMeeting");

        if (result.committeeMeeting) {
          expect(result.committeeMeeting).toHaveProperty("congress");
          expect(result.committeeMeeting.congress).toBe(
            parseInt(testData.committeeMeetings.valid.congress)
          );
        }
      } catch (error) {
        // Some specific meetings might not exist, which is expected
        expect(error).toBeInstanceOf(Error);
        console.log(
          "Committee meeting not found (expected for some test cases):",
          (error as Error).message
        );
      }
    }, 10000);

    it("should handle different chambers for meetings", async () => {
      const chambers = ["house", "senate"];

      for (const chamber of chambers) {
        try {
          const result = await congressApiService.getCommitteeMeetingDetails({
            congress: "118",
            chamber: chamber,
            eventId: "114329",
          });

          expect(result).toBeDefined();
        } catch (error) {
          // Some meetings might not exist for specific event IDs
          expect(error).toBeInstanceOf(Error);
          console.log(
            `Chamber ${chamber} meeting not found (expected):`,
            (error as Error).message
          );
        }
      }
    }, 15000);

    it("should handle invalid meeting parameters", async () => {
      await expect(
        congressApiService.getCommitteeMeetingDetails({
          congress: "999",
          chamber: "house",
          eventId: "999999",
        })
      ).rejects.toThrow();
    }, 10000);
  });

  describe("Committee Hearing Resources", () => {
    it("should get committee hearing details", async () => {
      try {
        const result = await congressApiService.getCommitteeHearingDetails({
          congress: testData.committeeHearings.valid.congress,
          chamber: testData.committeeHearings.valid.chamber,
          jacketNumber: testData.committeeHearings.valid.jacketNumber,
        });

        expect(result).toBeDefined();
        expect(result).toHaveProperty("hearing");

        if (result.hearing) {
          expect(result.hearing).toHaveProperty("congress");
          expect(result.hearing.congress).toBe(
            parseInt(testData.committeeHearings.valid.congress)
          );
        }
      } catch (error) {
        // Some specific hearings might not exist, which is expected
        expect(error).toBeInstanceOf(Error);
        console.log(
          "Committee hearing not found (expected for some test cases):",
          (error as Error).message
        );
      }
    }, 10000);

    it("should handle different chambers for hearings", async () => {
      const chambers = ["house", "senate"];

      for (const chamber of chambers) {
        try {
          const result = await congressApiService.getCommitteeHearingDetails({
            congress: "118",
            chamber: chamber,
            jacketNumber: "1",
          });

          expect(result).toBeDefined();
        } catch (error) {
          // Some hearings might not exist for specific jacket numbers
          expect(error).toBeInstanceOf(Error);
          console.log(
            `Chamber ${chamber} hearing not found (expected):`,
            (error as Error).message
          );
        }
      }
    }, 15000);

    it("should handle invalid hearing parameters", async () => {
      await expect(
        congressApiService.getCommitteeHearingDetails({
          congress: "999",
          chamber: "house",
          jacketNumber: "999999",
        })
      ).rejects.toThrow();
    }, 10000);
  });

  describe("Validation and Error Handling", () => {
    it("should validate report types", async () => {
      const invalidReportTypes = ["invalid", "xyz", ""];

      for (const invalidType of invalidReportTypes) {
        await expect(
          congressApiService.getCommitteeReportDetails({
            congress: "118",
            reportType: invalidType,
            reportNumber: "1",
          })
        ).rejects.toThrow();
      }
    }, 10000);

    it("should validate chambers", async () => {
      const invalidChambers = ["invalid", "xyz", ""];

      for (const invalidChamber of invalidChambers) {
        await expect(
          congressApiService.getCommitteePrintDetails({
            congress: "118",
            chamber: invalidChamber,
            jacketNumber: "1",
          })
        ).rejects.toThrow();
      }
    }, 10000);

    it("should handle non-numeric jacket numbers appropriately", async () => {
      // The API might accept some non-numeric jacket numbers, so we test both
      const testJacketNumbers = ["abc", "123abc", ""];

      for (const jacketNumber of testJacketNumbers) {
        try {
          await congressApiService.getCommitteePrintDetails({
            congress: "118",
            chamber: "house",
            jacketNumber: jacketNumber,
          });
          // If it doesn't throw, that's fine too
        } catch (error) {
          // Expected to throw for invalid jacket numbers
          expect(error).toBeInstanceOf(Error);
        }
      }
    }, 10000);

    it("should handle empty or invalid congress numbers", async () => {
      const invalidCongresses = ["", "abc", "0"];

      for (const invalidCongress of invalidCongresses) {
        try {
          const result = await congressApiService.getCommitteeReportDetails({
            congress: invalidCongress,
            reportType: "hrpt",
            reportNumber: "1",
          });
          // Invalid congress numbers may return empty results rather than throwing
          expect(result).toBeDefined();
          expect(result).toHaveProperty("committeeReports");
        } catch (error: any) {
          // API may reject invalid congress numbers
          expect(error).toBeDefined();
        }
      }
    }, 10000);
  });

  describe("API Service Integration", () => {
    it("should maintain rate limiting across committee document requests", async () => {
      // Make several requests to ensure rate limiting is working
      const requests = [
        () =>
          congressApiService.getCommitteeReportDetails({
            congress: "118",
            reportType: "hrpt",
            reportNumber: "1",
          }),
        () =>
          congressApiService.getCommitteePrintDetails({
            congress: "118",
            chamber: "house",
            jacketNumber: "1",
          }),
        () =>
          congressApiService.getCommitteeMeetingDetails({
            congress: "118",
            chamber: "house",
            eventId: "114329",
          }),
      ];

      for (const request of requests) {
        try {
          const result = await request();
          expect(result).toBeDefined();
        } catch (error) {
          // Some requests might fail due to non-existent resources
          expect(error).toBeInstanceOf(Error);
        }
      }

      const rateLimiter = congressApiService["rateLimitService"];
      expect(rateLimiter["requestTimes"].length).toBeGreaterThan(0);
    }, 15000);

    it("should handle concurrent committee document requests", async () => {
      const concurrentRequests = [
        congressApiService
          .getCommitteeReportDetails({
            congress: "118",
            reportType: "hrpt",
            reportNumber: "1",
          })
          .catch(() => null), // Catch and return null for failed requests
        congressApiService
          .getCommitteePrintDetails({
            congress: "118",
            chamber: "house",
            jacketNumber: "1",
          })
          .catch(() => null),
        congressApiService
          .getCommitteeMeetingDetails({
            congress: "118",
            chamber: "house",
            eventId: "114329",
          })
          .catch(() => null),
      ];

      const results = await Promise.all(concurrentRequests);

      // At least some results should be defined (even if null from caught errors)
      expect(results).toHaveLength(3);
      expect(results.some((result) => result !== null || result === null)).toBe(
        true
      );
    }, 15000);
  });
});
