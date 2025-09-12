import { CongressApiService } from "../../services/CongressApiService.js";
import {
  handleCongressionalRecordResource,
  handleDailyCongressionalRecordResource,
  handleDailyCongressionalRecordArticlesResource,
  handleBoundCongressionalRecordResource,
} from "../../resourceHandlers.js";
import { testData } from "../utils/testServer.js";

/**
 * Integration tests for Congressional Record resource handlers and API functionality
 * These tests validate Congressional Record API service methods with real Congress.gov API calls
 */
describe("Congressional Record Resources Integration Tests", () => {
  let congressApiService: CongressApiService;

  beforeAll(() => {
    congressApiService = new CongressApiService();
  });

  describe("Congressional Record API Service Methods", () => {
    it("should get general congressional record list", async () => {
      const result = await congressApiService.getCongressionalRecord({
        limit: 5,
      });

      expect(result).toBeDefined();
      expect(result).toHaveProperty("Results");
      expect(result.Results).toHaveProperty("Issues");
      expect(Array.isArray(result.Results.Issues)).toBe(true);
      expect(result.Results.Issues.length).toBeLessThanOrEqual(5);

      // Validate structure of first record if present
      if (result.Results.Issues.length > 0) {
        const record = result.Results.Issues[0];
        expect(record).toHaveProperty("Congress");
        expect(record).toHaveProperty("Issue");
        expect(record).toHaveProperty("PublishDate");
        expect(record).toHaveProperty("Volume");
        expect(record).toHaveProperty("Links");
      }
    }, 15000);

    it("should get daily congressional record details", async () => {
      const result = await congressApiService.getDailyCongressionalRecord({
        volumeNumber: testData.congressionalRecord.valid.volumeNumber,
        issueNumber: testData.congressionalRecord.valid.issueNumber,
      });

      expect(result).toBeDefined();
      expect(result).toHaveProperty("issue");

      const record = result.issue;
      expect(record).toHaveProperty("congress");
      expect(record).toHaveProperty("issueDate");
      expect(record).toHaveProperty("issueNumber");
      expect(record).toHaveProperty("volumeNumber");
      expect(record).toHaveProperty("sessionNumber");
      expect(record).toHaveProperty("url");
      expect(record).toHaveProperty("fullIssue");
      expect(record.issueNumber).toBe(
        testData.congressionalRecord.valid.issueNumber
      );
      expect(record.volumeNumber).toBe(
        parseInt(testData.congressionalRecord.valid.volumeNumber)
      );
    }, 15000);

    it("should get daily congressional record articles", async () => {
      const result =
        await congressApiService.getDailyCongressionalRecordArticles(
          {
            volumeNumber: testData.congressionalRecord.valid.volumeNumber,
            issueNumber: testData.congressionalRecord.valid.issueNumber,
          },
          {
            limit: 3,
          }
        );

      expect(result).toBeDefined();
      expect(result).toHaveProperty("articles");
      expect(Array.isArray(result.articles)).toBe(true);
      expect(result.articles.length).toBeGreaterThan(0);

      // Validate structure of first article if present
      if (result.articles.length > 0) {
        const article = result.articles[0];
        expect(article).toHaveProperty("name");
        expect(article).toHaveProperty("sectionArticles");
        expect(Array.isArray(article.sectionArticles)).toBe(true);

        // Validate structure of first section article if present
        if (article.sectionArticles.length > 0) {
          const sectionArticle = article.sectionArticles[0];
          expect(sectionArticle).toHaveProperty("title");
          expect(sectionArticle).toHaveProperty("startPage");
          expect(sectionArticle).toHaveProperty("endPage");
          expect(sectionArticle).toHaveProperty("text");
        }
      }
    }, 15000);

    it("should get bound congressional record by date", async () => {
      const result = await congressApiService.getBoundCongressionalRecord({
        year: testData.congressionalRecord.valid.year,
        month: testData.congressionalRecord.valid.month,
        day: testData.congressionalRecord.valid.day,
      });

      expect(result).toBeDefined();

      // The Bound Congressional Record API might return empty data
      if (Array.isArray(result)) {
        // API returned array directly - acceptable whether empty or not
        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);
      } else if (
        result &&
        typeof result === "object" &&
        "boundCongressionalRecord" in result
      ) {
        // API returned structured response
        expect(result).toHaveProperty("boundCongressionalRecord");
        expect(result).toHaveProperty("pagination");
        expect(result).toHaveProperty("request");

        // The boundCongressionalRecord might be an empty array if no data exists
        if (
          Array.isArray(result.boundCongressionalRecord) &&
          result.boundCongressionalRecord.length === 0
        ) {
          // No bound record data for this date - acceptable
          expect(result.boundCongressionalRecord).toEqual([]);
          expect(result.pagination.count).toBe(0);
        } else if (
          result.boundCongressionalRecord &&
          typeof result.boundCongressionalRecord === "object"
        ) {
          // Has bound record data
          const record = result.boundCongressionalRecord;
          expect(record).toHaveProperty("congress");
          expect(record).toHaveProperty("date");
          expect(record).toHaveProperty("url");
        }
      } else {
        // API returned some other structure - just ensure it's defined
        expect(result).toBeDefined();
      }
    }, 15000);
  });

  describe("Congressional Record Resource Handlers", () => {
    it("should handle general congressional record resource", async () => {
      const result = await handleCongressionalRecordResource(
        testData.congressionalRecord.uris.general,
        congressApiService
      );

      expect(result).toBeDefined();
      expect(result).toHaveProperty("contents");
      expect(Array.isArray(result.contents)).toBe(true);
      expect(result.contents.length).toBe(1);

      const content = result.contents[0];
      expect(content).toHaveProperty("uri");
      expect(content).toHaveProperty("mimeType", "application/json");
      expect(content).toHaveProperty("text");
      expect(content.uri).toBe(testData.congressionalRecord.uris.general);

      // Parse and validate JSON response
      const parsedData = JSON.parse(content.text);
      expect(parsedData).toHaveProperty("Results");
    }, 15000);

    it("should handle daily congressional record resource", async () => {
      const result = await handleDailyCongressionalRecordResource(
        testData.congressionalRecord.uris.daily,
        congressApiService
      );

      expect(result).toBeDefined();
      expect(result).toHaveProperty("contents");
      expect(Array.isArray(result.contents)).toBe(true);
      expect(result.contents.length).toBe(1);

      const content = result.contents[0];
      expect(content).toHaveProperty("uri");
      expect(content).toHaveProperty("mimeType", "application/json");
      expect(content).toHaveProperty("text");
      expect(content.uri).toBe(testData.congressionalRecord.uris.daily);

      // Parse and validate JSON response
      const parsedData = JSON.parse(content.text);
      expect(parsedData).toHaveProperty("issue");
    }, 15000);

    it("should handle daily congressional record articles resource", async () => {
      const result = await handleDailyCongressionalRecordArticlesResource(
        testData.congressionalRecord.uris.dailyArticles,
        congressApiService
      );

      expect(result).toBeDefined();
      expect(result).toHaveProperty("contents");
      expect(Array.isArray(result.contents)).toBe(true);
      expect(result.contents.length).toBe(1);

      const content = result.contents[0];
      expect(content).toHaveProperty("uri");
      expect(content).toHaveProperty("mimeType", "application/json");
      expect(content).toHaveProperty("text");
      expect(content.uri).toBe(testData.congressionalRecord.uris.dailyArticles);

      // Parse and validate JSON response
      const parsedData = JSON.parse(content.text);
      expect(parsedData).toHaveProperty("articles");
    }, 15000);

    it("should handle bound congressional record resource", async () => {
      const result = await handleBoundCongressionalRecordResource(
        testData.congressionalRecord.uris.bound,
        congressApiService
      );

      expect(result).toBeDefined();
      expect(result).toHaveProperty("contents");
      expect(Array.isArray(result.contents)).toBe(true);
      expect(result.contents.length).toBe(1);

      const content = result.contents[0];
      expect(content).toHaveProperty("uri");
      expect(content).toHaveProperty("mimeType", "application/json");
      expect(content).toHaveProperty("text");
      expect(content.uri).toBe(testData.congressionalRecord.uris.bound);

      // Parse and validate JSON response
      const parsedData = JSON.parse(content.text);
      expect(parsedData).toBeDefined();

      // The Bound Congressional Record API might return different structures
      if (Array.isArray(parsedData)) {
        expect(parsedData).toEqual([]);
      } else {
        expect(parsedData).toHaveProperty("boundCongressionalRecord");
      }
    }, 15000);
  });

  describe("URI Validation", () => {
    it("should reject invalid daily congressional record URIs", async () => {
      await expect(
        handleDailyCongressionalRecordResource(
          "congress-gov://daily-congressional-record/invalid/format",
          congressApiService
        )
      ).rejects.toThrow();
    });

    it("should reject invalid bound congressional record URIs", async () => {
      await expect(
        handleBoundCongressionalRecordResource(
          "congress-gov://bound-congressional-record/2023/13/01", // invalid month
          congressApiService
        )
      ).rejects.toThrow();

      await expect(
        handleBoundCongressionalRecordResource(
          "congress-gov://bound-congressional-record/2023/01/32", // invalid day
          congressApiService
        )
      ).rejects.toThrow();

      await expect(
        handleBoundCongressionalRecordResource(
          "congress-gov://bound-congressional-record/1800/01/01", // invalid year
          congressApiService
        )
      ).rejects.toThrow();
    });

    it("should reject malformed daily congressional record articles URIs", async () => {
      await expect(
        handleDailyCongressionalRecordArticlesResource(
          "congress-gov://daily-congressional-record/169/articles", // missing issue number
          congressApiService
        )
      ).rejects.toThrow();
    });
  });
});
