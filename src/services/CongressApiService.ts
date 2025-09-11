import axios, { AxiosInstance, AxiosError, AxiosResponse } from "axios";
import { logger } from "../utils/index.js";
import { ConfigurationManager } from "../config/ConfigurationManager.js";
import { CongressGovConfig } from "../types/configTypes.js";
import {
  BillResourceParams,
  MemberResourceParams,
  CongressResourceParams,
  CommitteeResourceParams,
  AmendmentResourceParams, // Assuming these exist or will be created
  LawResourceParams,
  LawListParams,
  LawCongressParams,
  PaginationParams,
  SearchParams, // Define these types
  // Add other specific param types as needed: NominationResourceParams, TreatyResourceParams, etc.
} from "../types/index.js"; // Import needed param types
import {
  ApiError,
  RateLimitError,
  NotFoundError,
  InvalidParameterError,
} from "../utils/errors.js"; // Import custom errors
import { RateLimitService } from "./RateLimitService.js"; // Import RateLimitService

// Define supported query parameters for LIST endpoints (RFC-003)
// Based on https://github.com/LibraryOfCongress/api.congress.gov/blob/main/Documentation/Parameters.md
// And testing/Swagger review. NOTE: 'congress' and 'type' often part of PATH, not query params for lists.
const SUPPORTED_QUERY_PARAMS: Record<string, string[]> = {
  bill: ["fromDateTime", "toDateTime", "sort"],
  amendment: ["fromDateTime", "toDateTime", "sort"],
  "committee-report": ["fromDateTime", "toDateTime", "sort"],
  committee: ["fromDateTime", "toDateTime"], // No sort documented
  "committee-print": ["fromDateTime", "toDateTime", "sort"],
  "congressional-record": ["fromDateTime", "toDateTime"], // No sort documented
  "daily-congressional-record": ["fromDateTime", "toDateTime"], // No sort documented
  "bound-congressional-record": ["fromDateTime", "toDateTime"], // No sort documented
  "house-communication": ["fromDateTime", "toDateTime", "sort"],
  "senate-communication": ["fromDateTime", "toDateTime", "sort"],
  nomination: ["fromDateTime", "toDateTime", "sort"],
  treaty: ["fromDateTime", "toDateTime", "sort"],
  member: ["fromDateTime", "toDateTime", "currentMember"], // No sort documented
  // Add others like 'summaries', 'committee-meeting' if needed
};

// Define collections that support a general 'q=' query parameter (based on docs/testing)
const QUERY_SUPPORTED_COLLECTIONS: string[] = [
  // Primarily seems to be for full-text search collections, not basic lists
  // Example: 'crs-report' (if added), potentially others. Check API docs.
  // Most list endpoints rely on specific filters, not a general 'q'.
];

/**
 * Service responsible for handling communication with the Congress.gov API.
 * It configures Axios with the base URL and API key, integrates rate limiting,
 * provides methods for specific API endpoints and sub-resources, handles dynamic
 * query parameter construction for searches, and throws custom errors.
 */
export class CongressApiService {
  private readonly axiosInstance: AxiosInstance;
  private readonly config: Required<CongressGovConfig>;
  private readonly rateLimitService: RateLimitService;

  // Make constructor accept config and rate limiter for testability, but default to singletons
  constructor(
    config?: Partial<CongressGovConfig>,
    rateLimitService?: RateLimitService
  ) {
    const configManager = ConfigurationManager.getInstance();
    this.config = { ...configManager.getCongressGovConfig(), ...config };

    if (!this.config.apiKey) {
      const errorMsg = `FATAL: Missing required Congress.gov API key. Set CONGRESS_GOV_API_KEY environment variable.`;
      logger.error(errorMsg);
      // Throwing here will prevent the server from starting, which is desired.
      throw new Error(errorMsg); // Use standard Error for startup failure
    }

    this.rateLimitService = rateLimitService ?? new RateLimitService(); // Use injected or create new

    this.axiosInstance = axios.create({
      baseURL: this.config.baseUrl,
      params: {
        api_key: this.config.apiKey,
        format: "json", // Default to JSON format
      },
      timeout: this.config.timeout,
    });

    // Simplified interceptor: just log, throw custom errors from executeRequest
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error: AxiosError) => {
        // Log the raw error here if needed, but executeRequest handles specific error throwing
        const redactedUrl = error.config?.url?.replace(
          this.config.apiKey,
          "[REDACTED]"
        );
        logger.error(`Raw Congress API Error: ${error.message}`, {
          url: redactedUrl,
          status: error.response?.status,
          // data: error.response?.data, // Avoid logging potentially large/sensitive data by default
        });
        // Let executeRequest handle throwing specific custom errors based on response
        return Promise.reject(error);
      }
    );

    logger.info("CongressApiService initialized", {
      baseUrl: this.config.baseUrl,
      timeout: this.config.timeout,
    });
  }

  // --- Internal Helper Methods ---

  /** Checks if a filter query parameter is supported for a given collection's LIST endpoint */
  private isFilterSupported(collection: string, filterName: string): boolean {
    return SUPPORTED_QUERY_PARAMS[collection]?.includes(filterName) ?? false;
  }

  /** Checks if the 'sort' query parameter is supported for a given collection's LIST endpoint */
  private isSortSupported(collection: string): boolean {
    // Assumes 'sort' is listed in SUPPORTED_QUERY_PARAMS if supported
    return this.isFilterSupported(collection, "sort");
  }

  /** Checks if a general 'q=' query parameter is supported for a given collection's LIST endpoint */
  private isQuerySupported(collection: string): boolean {
    return QUERY_SUPPORTED_COLLECTIONS.includes(collection);
  }

  /**
   * Executes a request to the Congress.gov API, handling rate limits and errors.
   *
   * @param endpoint - API endpoint path (without base URL)
   * @param params - Optional query parameters
   * @returns Response data as JSON
   * @throws {ApiError} If the API request fails for non-404 reasons.
   * @throws {NotFoundError} If the API returns a 404 status.
   * @throws {RateLimitError} If rate limits are exceeded before making the call.
   */
  private async executeRequest(
    endpoint: string,
    params: Record<string, string | number | boolean> = {}
  ): Promise<any> {
    // Check rate limits before making the call
    if (!this.rateLimitService.canMakeRequest()) {
      logger.warn(`Rate limit pre-check failed for endpoint: ${endpoint}`);
      throw new RateLimitError(
        "Congress.gov API rate limit exceeded (pre-check)"
      );
    }

    // Add context to debug log
    logger.debug(`Executing API request`, { endpoint, params });

    try {
      // Use internal axios instance with pre-configured base URL, key, timeout
      const response = await this.axiosInstance.get(endpoint, { params });
      this.rateLimitService.recordRequest(); // Record successful request
      return response.data;
    } catch (error) {
      // Error handling logic moved here from interceptor for better context
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const responseData = error.response?.data as any;
        const errorMessage =
          responseData?.message ||
          responseData?.error?.message ||
          error.message ||
          "Unknown API error";

        if (status === 404) {
          throw new NotFoundError(
            `Resource not found at API endpoint: ${endpoint}`
          );
        }
        if (
          status === 500 &&
          errorMessage.toLowerCase().includes("not found")
        ) {
          logger.warn(`API returned 500 but message indicates 'not found'`, {
            endpoint,
            status,
          });
          throw new NotFoundError(
            `Resource not found at API endpoint (reported as 500): ${endpoint}`
          );
        }
        if (status === 429) {
          throw new RateLimitError(
            `Congress.gov API rate limit hit (status 429)`
          );
        }
        // Throw generic ApiError for other client/server errors from API
        // Provide a default status code (e.g., 0 or 500) if status is undefined
        throw new ApiError(
          `Congress API request failed with status ${status ?? "N/A"}: ${errorMessage}`,
          status ?? 0,
          responseData
        );
      }
      // Rethrow unexpected errors as generic ApiError
      throw new ApiError(
        `Congress API request failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        0,
        error
      );
    }
  }

  // --- Specific Item Retrieval Methods (RFC-002) ---

  public async getBillDetails(params: BillResourceParams): Promise<any> {
    // Validate numeric parts if needed, assuming they come as strings from URI parsing
    const endpoint = `/bill/${params.congress}/${params.billType}/${params.billNumber}`;
    return this.executeRequest(endpoint);
  }

  public async getMemberDetails(params: MemberResourceParams): Promise<any> {
    const endpoint = `/member/${params.memberId}`;
    return this.executeRequest(endpoint);
  }

  public async getCongressDetails(
    params: CongressResourceParams
  ): Promise<any> {
    const endpoint = `/congress/${params.congress}`;
    return this.executeRequest(endpoint);
  }

  public async getCommitteeDetails(
    params: CommitteeResourceParams
  ): Promise<any> {
    // API path seems to be /committee/{chamber}/{code}?congress={congress}
    const endpoint = `/committee/${params.chamber}/${params.committeeCode}`;
    const queryParams: Record<string, string | number> = {};
    if (params.congress) {
      queryParams.congress = params.congress;
    }
    return this.executeRequest(endpoint, queryParams);
  }

  public async getAmendmentDetails(
    params: AmendmentResourceParams
  ): Promise<any> {
    const endpoint = `/amendment/${params.congress}/${params.amendmentType}/${params.amendmentNumber}`;
    return this.executeRequest(endpoint);
  }

  public async getAmendmentActions(
    params: AmendmentResourceParams,
    pagination?: PaginationParams
  ): Promise<any> {
    const endpoint = `/amendment/${params.congress}/${params.amendmentType}/${params.amendmentNumber}/actions`;
    const queryParams: Record<string, string | number> = {};
    if (pagination?.limit !== undefined) {
      queryParams["limit"] = pagination.limit;
    }
    if (pagination?.offset !== undefined) {
      queryParams["offset"] = pagination.offset;
    }
    return this.executeRequest(endpoint, queryParams);
  }

  public async getAmendmentCosponsors(
    params: AmendmentResourceParams,
    pagination?: PaginationParams
  ): Promise<any> {
    const endpoint = `/amendment/${params.congress}/${params.amendmentType}/${params.amendmentNumber}/cosponsors`;
    const queryParams: Record<string, string | number> = {};
    if (pagination?.limit !== undefined) {
      queryParams["limit"] = pagination.limit;
    }
    if (pagination?.offset !== undefined) {
      queryParams["offset"] = pagination.offset;
    }
    return this.executeRequest(endpoint, queryParams);
  }

  public async getAmendmentAmendments(
    params: AmendmentResourceParams,
    pagination?: PaginationParams
  ): Promise<any> {
    const endpoint = `/amendment/${params.congress}/${params.amendmentType}/${params.amendmentNumber}/amendments`;
    const queryParams: Record<string, string | number> = {};
    if (pagination?.limit !== undefined) {
      queryParams["limit"] = pagination.limit;
    }
    if (pagination?.offset !== undefined) {
      queryParams["offset"] = pagination.offset;
    }
    return this.executeRequest(endpoint, queryParams);
  }

  public async getAmendmentText(
    params: AmendmentResourceParams,
    pagination?: PaginationParams
  ): Promise<any> {
    const endpoint = `/amendment/${params.congress}/${params.amendmentType}/${params.amendmentNumber}/text`;
    const queryParams: Record<string, string | number> = {};
    if (pagination?.limit !== undefined) {
      queryParams["limit"] = pagination.limit;
    }
    if (pagination?.offset !== undefined) {
      queryParams["offset"] = pagination.offset;
    }
    return this.executeRequest(endpoint, queryParams);
  }

  // --- Law Service Methods ---
  // Note: Based on API testing, Congress.gov doesn't have separate /law endpoints
  // Instead, laws are accessed through bills that have become laws
  // We need to search for bills with laws attached to them

  public async getLawDetails(params: LawResourceParams): Promise<any> {
    // Search for bills that became this law (since direct law endpoints don't exist)
    const searchEndpoint = `/bill/${params.congress}`;
    const queryParams: Record<string, string | number> = {
      limit: 250, // Get more results to find the specific law
    };

    const results = await this.executeRequest(searchEndpoint, queryParams);

    // Filter results to find bills that became the specific law
    if (results && results.bills) {
      const lawNumberStr = `${params.congress}-${params.lawNumber}`;
      const matchingBills = results.bills.filter(
        (bill: any) =>
          bill.laws &&
          bill.laws.some(
            (law: any) =>
              law.number === lawNumberStr &&
              law.type.toLowerCase().includes(params.lawType.toLowerCase())
          )
      );

      if (matchingBills.length > 0) {
        const matchingLaw = matchingBills[0].laws.find(
          (law: any) =>
            law.number === lawNumberStr &&
            law.type.toLowerCase().includes(params.lawType.toLowerCase())
        );

        return {
          law: {
            congress: parseInt(params.congress),
            number: params.lawNumber,
            type: params.lawType,
            title: matchingBills[0].title,
            originChamber: matchingBills[0].originChamber,
            updateDate: matchingBills[0].updateDate,
            url: matchingLaw ? matchingLaw.url : undefined,
            bill: matchingBills[0],
          },
        };
      }
    }

    // If no matching law found, throw NotFoundError
    throw new NotFoundError(
      `Law ${params.congress}-${params.lawNumber} (${params.lawType}) not found`
    );
  }

  public async getLawsByCongressAndType(params: LawListParams): Promise<any> {
    // Search bills that have become laws of the specified type
    const endpoint = `/bill/${params.congress}`;
    const queryParams: Record<string, string | number> = {
      limit: 250, // Get more results to find laws
    };

    const results = await this.executeRequest(endpoint, queryParams);

    if (results && results.bills) {
      // Filter to only bills that have become laws of the specified type
      const lawBills = results.bills.filter(
        (bill: any) =>
          bill.laws &&
          bill.laws.some((law: any) =>
            law.type.toLowerCase().includes(params.lawType.toLowerCase())
          )
      );

      // Transform to law format
      const laws = lawBills.map((bill: any) => {
        const matchingLaw = bill.laws.find((law: any) =>
          law.type.toLowerCase().includes(params.lawType.toLowerCase())
        );
        return {
          congress: bill.congress,
          number: matchingLaw.number.split("-")[1], // Extract number from "118-123" format
          type: params.lawType,
          title: bill.title,
          originChamber: bill.originChamber,
          updateDate: bill.updateDate,
          bill: bill,
        };
      });

      return {
        laws: laws,
        pagination: results.pagination,
        request: results.request,
      };
    }

    return { laws: [] };
  }

  public async getLawsByCongress(params: LawCongressParams): Promise<any> {
    // Get all bills that have become laws in the congress
    const endpoint = `/bill/${params.congress}`;
    const queryParams: Record<string, string | number> = {
      limit: 250, // Get more results
    };

    const results = await this.executeRequest(endpoint, queryParams);

    if (results && results.bills) {
      // Filter to only bills that have become laws
      const lawBills = results.bills.filter(
        (bill: any) => bill.laws && bill.laws.length > 0
      );

      // Transform to law format
      const laws = lawBills.map((bill: any) => ({
        congress: bill.congress,
        number: bill.laws[0].number,
        type: bill.laws[0].type,
        title: bill.title,
        originChamber: bill.originChamber,
        updateDate: bill.updateDate,
        bill: bill,
      }));

      return {
        laws: laws,
        pagination: results.pagination,
        request: results.request,
      };
    }

    return { laws: [] };
  }

  // Add methods for other specific types as needed, mapping params to endpoint structure
  // public async getNominationDetails(params: NominationResourceParams): Promise<any> { ... }
  // public async getTreatyDetails(params: TreatyResourceParams): Promise<any> { ... }
  // public async getCommunicationDetails(params: CommunicationResourceParams): Promise<any> { ... }
  // public async getCommitteeReportDetails(params: CommitteeReportResourceParams): Promise<any> { ... }
  // public async getCongressionalRecordDetails(params: CongressionalRecordResourceParams): Promise<any> { ... }

  // --- List/Search Method (RFC-003) ---

  public async searchCollection(
    collection: string,
    params: SearchParams
  ): Promise<any> {
    const basePath = `/${collection}`; // e.g., /bill, /member
    const queryParams: Record<string, string | number | boolean> = {};

    // 1. Add Search Query (if applicable and supported)
    if (params.query) {
      if (this.isQuerySupported(collection)) {
        queryParams["q"] = params.query; // Assuming 'q' is the parameter name
      } else {
        logger.warn(
          `Query parameter '${params.query}' provided but general keyword search ('q') is likely not supported by /${collection} list endpoint. Ignoring query.`
        );
        // Do not add 'q' if not supported
      }
    }

    // 2. Add Filters (Dynamically check if filter is valid for the collection)
    if (params.filters) {
      for (const [filterKey, filterValue] of Object.entries(params.filters)) {
        // Ensure value is not undefined/null/empty string before checking support
        if (
          filterValue !== undefined &&
          filterValue !== null &&
          filterValue !== ""
        ) {
          if (this.isFilterSupported(collection, filterKey)) {
            // Convert boolean to string if necessary for API query params
            queryParams[filterKey] =
              typeof filterValue === "boolean"
                ? String(filterValue)
                : filterValue;
          } else {
            // Throw error for unsupported filter as per plan
            throw new InvalidParameterError(
              `Filter '${filterKey}' is not supported for collection '${collection}'.`
            );
          }
        }
      }
    }

    // 3. Add Sorting (if applicable and supported)
    if (params.sort) {
      if (this.isSortSupported(collection)) {
        queryParams["sort"] = params.sort;
      } else {
        // Throw error for unsupported sort
        throw new InvalidParameterError(
          `Sorting by 'updateDate' is not supported for collection '${collection}'.`
        );
      }
    }

    // 4. Add Pagination (LAST)
    if (params.limit !== undefined) {
      queryParams["limit"] = params.limit;
    }
    if (params.offset !== undefined) {
      queryParams["offset"] = params.offset;
    }

    // Execute request using internal method
    return this.executeRequest(basePath, queryParams);
  }

  // --- Sub-Resource Retrieval Methods (RFC-002) ---

  private getSubResourcePath(parentUri: string, subResource: string): string {
    // Basic parsing, needs robust error handling and validation
    const url = new URL(parentUri);
    if (url.protocol !== "congress-gov:") {
      throw new InvalidParameterError(
        `Invalid parentUri protocol: ${parentUri}`
      );
    }
    const collection = url.hostname; // e.g., 'bill', 'member'
    const pathSegments = url.pathname.split("/").filter((p) => p); // e.g., ['117', 'hr', '3076'] or ['K000393']

    if (!collection) {
      throw new InvalidParameterError(
        `Missing collection type (hostname) in parentUri: ${parentUri}`
      );
    }
    if (pathSegments.length === 0) {
      throw new InvalidParameterError(
        `Missing identifier path segments in parentUri: ${parentUri}`
      );
    }

    // Construct the correct API path: /collection/segment1/segment2/.../subResource
    const basePath = `/${collection}/${pathSegments.join("/")}`;
    return `${basePath}/${subResource}`;
  }

  public async getSubResource(
    parentUri: string,
    subResource: string,
    pagination?: PaginationParams
  ): Promise<any> {
    const endpoint = this.getSubResourcePath(parentUri, subResource);
    const queryParams: Record<string, string | number> = {};
    if (pagination?.limit !== undefined) {
      queryParams["limit"] = pagination.limit;
    }
    if (pagination?.offset !== undefined) {
      queryParams["offset"] = pagination.offset;
    }
    return this.executeRequest(endpoint, queryParams);
  }

  // --- Bill Sub-Resource Methods ---

  public async getBillActions(
    params: BillResourceParams,
    pagination?: PaginationParams
  ): Promise<any> {
    const endpoint = `/bill/${params.congress}/${params.billType}/${params.billNumber}/actions`;
    const queryParams: Record<string, string | number> = {};
    if (pagination?.limit !== undefined) {
      queryParams["limit"] = pagination.limit;
    }
    if (pagination?.offset !== undefined) {
      queryParams["offset"] = pagination.offset;
    }
    return this.executeRequest(endpoint, queryParams);
  }

  public async getBillAmendments(
    params: BillResourceParams,
    pagination?: PaginationParams
  ): Promise<any> {
    const endpoint = `/bill/${params.congress}/${params.billType}/${params.billNumber}/amendments`;
    const queryParams: Record<string, string | number> = {};
    if (pagination?.limit !== undefined) {
      queryParams["limit"] = pagination.limit;
    }
    if (pagination?.offset !== undefined) {
      queryParams["offset"] = pagination.offset;
    }
    return this.executeRequest(endpoint, queryParams);
  }

  public async getBillCommittees(
    params: BillResourceParams,
    pagination?: PaginationParams
  ): Promise<any> {
    const endpoint = `/bill/${params.congress}/${params.billType}/${params.billNumber}/committees`;
    const queryParams: Record<string, string | number> = {};
    if (pagination?.limit !== undefined) {
      queryParams["limit"] = pagination.limit;
    }
    if (pagination?.offset !== undefined) {
      queryParams["offset"] = pagination.offset;
    }
    return this.executeRequest(endpoint, queryParams);
  }

  public async getBillCosponsors(
    params: BillResourceParams,
    pagination?: PaginationParams
  ): Promise<any> {
    const endpoint = `/bill/${params.congress}/${params.billType}/${params.billNumber}/cosponsors`;
    const queryParams: Record<string, string | number> = {};
    if (pagination?.limit !== undefined) {
      queryParams["limit"] = pagination.limit;
    }
    if (pagination?.offset !== undefined) {
      queryParams["offset"] = pagination.offset;
    }
    return this.executeRequest(endpoint, queryParams);
  }

  public async getBillRelatedBills(
    params: BillResourceParams,
    pagination?: PaginationParams
  ): Promise<any> {
    const endpoint = `/bill/${params.congress}/${params.billType}/${params.billNumber}/relatedbills`;
    const queryParams: Record<string, string | number> = {};
    if (pagination?.limit !== undefined) {
      queryParams["limit"] = pagination.limit;
    }
    if (pagination?.offset !== undefined) {
      queryParams["offset"] = pagination.offset;
    }
    return this.executeRequest(endpoint, queryParams);
  }

  public async getBillSubjects(
    params: BillResourceParams,
    pagination?: PaginationParams
  ): Promise<any> {
    const endpoint = `/bill/${params.congress}/${params.billType}/${params.billNumber}/subjects`;
    const queryParams: Record<string, string | number> = {};
    if (pagination?.limit !== undefined) {
      queryParams["limit"] = pagination.limit;
    }
    if (pagination?.offset !== undefined) {
      queryParams["offset"] = pagination.offset;
    }
    return this.executeRequest(endpoint, queryParams);
  }

  public async getBillSummaries(
    params: BillResourceParams,
    pagination?: PaginationParams
  ): Promise<any> {
    const endpoint = `/bill/${params.congress}/${params.billType}/${params.billNumber}/summaries`;
    const queryParams: Record<string, string | number> = {};
    if (pagination?.limit !== undefined) {
      queryParams["limit"] = pagination.limit;
    }
    if (pagination?.offset !== undefined) {
      queryParams["offset"] = pagination.offset;
    }
    return this.executeRequest(endpoint, queryParams);
  }

  public async getBillText(
    params: BillResourceParams,
    pagination?: PaginationParams
  ): Promise<any> {
    const endpoint = `/bill/${params.congress}/${params.billType}/${params.billNumber}/text`;
    const queryParams: Record<string, string | number> = {};
    if (pagination?.limit !== undefined) {
      queryParams["limit"] = pagination.limit;
    }
    if (pagination?.offset !== undefined) {
      queryParams["offset"] = pagination.offset;
    }
    return this.executeRequest(endpoint, queryParams);
  }

  public async getBillTitles(
    params: BillResourceParams,
    pagination?: PaginationParams
  ): Promise<any> {
    const endpoint = `/bill/${params.congress}/${params.billType}/${params.billNumber}/titles`;
    const queryParams: Record<string, string | number> = {};
    if (pagination?.limit !== undefined) {
      queryParams["limit"] = pagination.limit;
    }
    if (pagination?.offset !== undefined) {
      queryParams["offset"] = pagination.offset;
    }
    return this.executeRequest(endpoint, queryParams);
  }

  // --- Add specific wrappers for getSubResource if needed for clarity or type safety ---
  // Example:
  // public async getMemberSponsoredLegislation(params: MemberResourceParams, pagination?: PaginationParams): Promise<any> {
  //     const parentUri = `congress-gov://member/${params.memberId}`;
  //     return this.getSubResource(parentUri, 'sponsored-legislation', pagination);
  // }
  // ... etc.
}

// Note: Removed default singleton export. Instantiation should be handled by the caller (e.g., in createServer.ts)
// This improves testability and allows configuration injection.
