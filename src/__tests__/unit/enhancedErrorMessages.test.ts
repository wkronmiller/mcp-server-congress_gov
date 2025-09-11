import { CongressApiService } from "../../services/CongressApiService.js";
import { InvalidParameterError } from "../../utils/errors.js";
import { SearchParams } from "../../types/index.js";
import { RateLimitService } from "../../services/RateLimitService.js";

// Mock the rate limit service to avoid dependencies
jest.mock("../../services/RateLimitService.js");

describe("Enhanced Error Messages for Congress Filter", () => {
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

  describe("Congress filter error messages", () => {
    it("should provide enhanced error message for congress filter attempt", async () => {
      // Bypass TypeScript types to simulate a congress filter attempt
      const searchParamsWithCongress: SearchParams = {
        query: "climate", 
        filters: {
          ...({ congress: "117" } as any),
        },
        limit: 10,
      };

      try {
        await congressApiService.searchCollection("bill", searchParamsWithCongress);
        fail("Expected InvalidParameterError to be thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(InvalidParameterError);
        const errorMessage = (error as InvalidParameterError).message;
        
        // Check that the error message mentions congress
        expect(errorMessage).toContain("congress");
        expect(errorMessage).toContain("not supported");
      }
    });

    it("should provide standard error message for other unsupported filters", async () => {
      // Test with a different unsupported filter
      const searchParamsWithUnsupportedFilter: SearchParams = {
        query: "climate", 
        filters: {
          ...({ randomFilter: "value" } as any),
        },
        limit: 10,
      };

      try {
        await congressApiService.searchCollection("bill", searchParamsWithUnsupportedFilter);
        fail("Expected InvalidParameterError to be thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(InvalidParameterError);
        const errorMessage = (error as InvalidParameterError).message;
        
        // Check that we get the standard error message
        expect(errorMessage).toContain("randomFilter");
        expect(errorMessage).toContain("not supported");
        // Should not contain the enhanced congress-specific guidance
        expect(errorMessage).not.toContain("CRITICAL API LIMITATION");
      }
    });
  });
});