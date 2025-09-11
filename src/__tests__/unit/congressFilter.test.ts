import { CongressApiService } from "../../services/CongressApiService.js";
import { InvalidParameterError } from "../../utils/errors.js";
import { SearchParams } from "../../types/index.js";
import { RateLimitService } from "../../services/RateLimitService.js";

// Mock the rate limit service to avoid dependencies
jest.mock("../../services/RateLimitService.js");

describe("Congress Filter Limitation Tests", () => {
  let congressApiService: CongressApiService;
  let mockRateLimitService: jest.Mocked<RateLimitService>;

  beforeEach(() => {
    // Create mock rate limit service
    mockRateLimitService = new RateLimitService() as jest.Mocked<RateLimitService>;
    mockRateLimitService.canMakeRequest = jest.fn().mockReturnValue(true);
    mockRateLimitService.recordRequest = jest.fn();

    // Mock the API key for testing (no actual API calls will be made)
    const mockConfig = {
      apiKey: "test-key",
      baseUrl: "https://api.congress.gov/v3",
      timeout: 10000,
    };
    congressApiService = new CongressApiService(mockConfig, mockRateLimitService);
  });

  describe("Congress filter is prevented by type system", () => {
    it("should demonstrate that congress filter is not allowed by TypeScript types", () => {
      // This test demonstrates that the TypeScript type system prevents 'congress' filters
      const validSearchParams: SearchParams = {
        query: "climate",
        filters: {
          type: "hr", // This is allowed
          fromDateTime: "2023-01-01T00:00:00Z", // This is allowed
        },
        limit: 10,
      };
      
      expect(validSearchParams).toBeDefined();
      expect(validSearchParams.filters?.type).toBe("hr");
      
      // The following would cause a TypeScript compilation error (commented out):
      // const invalidSearchParams: SearchParams = {
      //   query: "climate",
      //   filters: {
      //     congress: "117", // TypeScript error: Object literal may only specify known properties
      //   },
      //   limit: 10,
      // };
    });
  });

  describe("Runtime filter validation", () => {
    it("should reject unsupported filters at runtime", async () => {
      // Test with dynamic/unknown filter to simulate runtime validation
      const searchParamsWithUnsupportedFilter: SearchParams = {
        query: "climate",
        filters: {
          // Bypass TypeScript using type assertion to test runtime validation
          ...({ unsupportedFilter: "value" } as any),
        },
        limit: 10,
      };

      await expect(
        congressApiService.searchCollection("bill", searchParamsWithUnsupportedFilter)
      ).rejects.toThrow(InvalidParameterError);

      await expect(
        congressApiService.searchCollection("bill", searchParamsWithUnsupportedFilter)
      ).rejects.toThrow("Filter 'unsupportedFilter' is not supported for collection 'bill'");
    });
    
    it("should reject congress filter if bypassed through type assertions", async () => {
      // Simulate what would happen if someone bypassed TypeScript types
      const searchParamsWithCongress: SearchParams = {
        query: "climate", 
        filters: {
          // Force congress filter despite TypeScript restrictions
          ...({ congress: "117" } as any),
        },
        limit: 10,
      };

      await expect(
        congressApiService.searchCollection("bill", searchParamsWithCongress)
      ).rejects.toThrow(InvalidParameterError);

      await expect(
        congressApiService.searchCollection("bill", searchParamsWithCongress) 
      ).rejects.toThrow("Filter 'congress' is not supported for collection 'bill'");
    });
  });
});