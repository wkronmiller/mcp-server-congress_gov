import axios, { AxiosInstance, AxiosError, AxiosResponse } from "axios";
import { logger } from "../utils/index.js";
import { ConfigurationManager } from "../config/ConfigurationManager.js";
import { CongressGovConfig } from "../types/configTypes.js";
import {
  BillResourceParams,
  MemberResourceParams,
  MemberSubResourceParams,
  MembersByStateParams,
  MembersByDistrictParams,
  MembersByCongressStateDistrictParams,
  CongressResourceParams,
  CommitteeResourceParams,
  CommitteeSubResourceParams,
  AmendmentResourceParams, // Assuming these exist or will be created
  LawResourceParams,
  LawListParams,
  LawCongressParams,
  CommitteeReportResourceParams,
  CommitteeReportTextParams,
  CommitteePrintResourceParams,
  CommitteePrintTextParams,
  CommitteeMeetingResourceParams,
  CommitteeHearingResourceParams,
  NominationResourceParams,
  NominationNomineeParams,
  NominationSubResourceParams,
  CongressionalRecordResourceParams,
  DailyCongressionalRecordResourceParams,
  DailyCongressionalRecordArticlesResourceParams,
  BoundCongressionalRecordResourceParams,
  HouseCommunicationResourceParams,
  SenateCommunicationResourceParams,
  HouseRequirementResourceParams,
  HouseRequirementMatchingCommunicationsParams,
  PaginationParams,
  SearchParams,
  TreatyResourceParams,
  TreatyPartitionResourceParams,
  TreatySubResourceParams,
  CRSReportResourceParams,
  SummariesResourceParams,
  HouseVoteResourceParams,
  HouseVoteMembersResourceParams,
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

  /**
   * Get details for a specific bill
   * @param params Bill parameters including congress, billType, and billNumber
   * @returns Bill details from the API
   * @example
   * // Get details for H.R. 21 from the 117th Congress
   * await getBillDetails({ congress: "117", billType: "hr", billNumber: "21" })
   * // API endpoint: /bill/117/hr/21
   *
   * Valid bill types:
   * - hr: House Bill
   * - s: Senate Bill
   * - hjres: House Joint Resolution
   * - sjres: Senate Joint Resolution
   * - hconres: House Concurrent Resolution
   * - sconres: Senate Concurrent Resolution
   * - hres: House Simple Resolution
   * - sres: Senate Simple Resolution
   */
  public async getBillDetails(params: BillResourceParams): Promise<any> {
    const endpoint = `/bill/${params.congress}/${params.billType}/${params.billNumber}`;
    return this.executeRequest(endpoint);
  }

  public async getMemberDetails(params: MemberResourceParams): Promise<any> {
    const endpoint = `/member/${params.memberId}`;
    return this.executeRequest(endpoint);
  }

  // --- Member Sub-Resource Methods ---

  public async getMemberSponsoredLegislation(
    params: MemberSubResourceParams,
    pagination?: PaginationParams
  ): Promise<any> {
    const endpoint = `/member/${params.bioguideId}/sponsored-legislation`;
    const queryParams: Record<string, string | number> = {};
    if (pagination?.limit !== undefined) {
      queryParams["limit"] = pagination.limit;
    }
    if (pagination?.offset !== undefined) {
      queryParams["offset"] = pagination.offset;
    }
    return this.executeRequest(endpoint, queryParams);
  }

  public async getMemberCosponsoredLegislation(
    params: MemberSubResourceParams,
    pagination?: PaginationParams
  ): Promise<any> {
    const endpoint = `/member/${params.bioguideId}/cosponsored-legislation`;
    const queryParams: Record<string, string | number> = {};
    if (pagination?.limit !== undefined) {
      queryParams["limit"] = pagination.limit;
    }
    if (pagination?.offset !== undefined) {
      queryParams["offset"] = pagination.offset;
    }
    return this.executeRequest(endpoint, queryParams);
  }

  public async getMembersByState(
    params: MembersByStateParams,
    pagination?: PaginationParams
  ): Promise<any> {
    const endpoint = `/member`;
    const queryParams: Record<string, string | number> = {
      stateCode: params.stateCode,
    };
    if (pagination?.limit !== undefined) {
      queryParams["limit"] = pagination.limit;
    }
    if (pagination?.offset !== undefined) {
      queryParams["offset"] = pagination.offset;
    }
    return this.executeRequest(endpoint, queryParams);
  }

  public async getMembersByDistrict(
    params: MembersByDistrictParams,
    pagination?: PaginationParams
  ): Promise<any> {
    const endpoint = `/member`;
    const queryParams: Record<string, string | number> = {
      stateCode: params.stateCode,
      district: params.district,
    };
    if (pagination?.limit !== undefined) {
      queryParams["limit"] = pagination.limit;
    }
    if (pagination?.offset !== undefined) {
      queryParams["offset"] = pagination.offset;
    }
    return this.executeRequest(endpoint, queryParams);
  }

  public async getMembersByCongressStateDistrict(
    params: MembersByCongressStateDistrictParams,
    pagination?: PaginationParams
  ): Promise<any> {
    const endpoint = `/member`;
    const queryParams: Record<string, string | number> = {
      congress: params.congress,
      stateCode: params.stateCode,
      district: params.district,
    };
    if (pagination?.limit !== undefined) {
      queryParams["limit"] = pagination.limit;
    }
    if (pagination?.offset !== undefined) {
      queryParams["offset"] = pagination.offset;
    }
    return this.executeRequest(endpoint, queryParams);
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

  // --- Committee Sub-Resource Methods ---

  public async getCommitteeBills(
    params: CommitteeSubResourceParams,
    pagination?: PaginationParams
  ): Promise<any> {
    const endpoint = `/committee/${params.chamber}/${params.committeeCode}/bills`;
    const queryParams: Record<string, string | number> = {};
    if (params.congress) {
      queryParams.congress = params.congress;
    }
    if (pagination?.limit !== undefined) {
      queryParams["limit"] = pagination.limit;
    }
    if (pagination?.offset !== undefined) {
      queryParams["offset"] = pagination.offset;
    }
    return this.executeRequest(endpoint, queryParams);
  }

  public async getCommitteeReports(
    params: CommitteeSubResourceParams,
    pagination?: PaginationParams
  ): Promise<any> {
    const endpoint = `/committee/${params.chamber}/${params.committeeCode}/reports`;
    const queryParams: Record<string, string | number> = {};
    if (params.congress) {
      queryParams.congress = params.congress;
    }
    if (pagination?.limit !== undefined) {
      queryParams["limit"] = pagination.limit;
    }
    if (pagination?.offset !== undefined) {
      queryParams["offset"] = pagination.offset;
    }
    return this.executeRequest(endpoint, queryParams);
  }

  public async getCommitteeNominations(
    params: CommitteeSubResourceParams,
    pagination?: PaginationParams
  ): Promise<any> {
    const endpoint = `/committee/${params.chamber}/${params.committeeCode}/nominations`;
    const queryParams: Record<string, string | number> = {};
    if (params.congress) {
      queryParams.congress = params.congress;
    }
    if (pagination?.limit !== undefined) {
      queryParams["limit"] = pagination.limit;
    }
    if (pagination?.offset !== undefined) {
      queryParams["offset"] = pagination.offset;
    }
    return this.executeRequest(endpoint, queryParams);
  }

  public async getCommitteeHouseCommunications(
    params: CommitteeSubResourceParams,
    pagination?: PaginationParams
  ): Promise<any> {
    if (params.chamber !== "house") {
      throw new InvalidParameterError(
        `House communications are only available for House committees. Chamber provided: ${params.chamber}`
      );
    }
    const endpoint = `/committee/${params.chamber}/${params.committeeCode}/house-communication`;
    const queryParams: Record<string, string | number> = {};
    if (params.congress) {
      queryParams.congress = params.congress;
    }
    if (pagination?.limit !== undefined) {
      queryParams["limit"] = pagination.limit;
    }
    if (pagination?.offset !== undefined) {
      queryParams["offset"] = pagination.offset;
    }
    return this.executeRequest(endpoint, queryParams);
  }

  public async getCommitteeSenateCommunications(
    params: CommitteeSubResourceParams,
    pagination?: PaginationParams
  ): Promise<any> {
    if (params.chamber !== "senate") {
      throw new InvalidParameterError(
        `Senate communications are only available for Senate committees. Chamber provided: ${params.chamber}`
      );
    }
    const endpoint = `/committee/${params.chamber}/${params.committeeCode}/senate-communication`;
    const queryParams: Record<string, string | number> = {};
    if (params.congress) {
      queryParams.congress = params.congress;
    }
    if (pagination?.limit !== undefined) {
      queryParams["limit"] = pagination.limit;
    }
    if (pagination?.offset !== undefined) {
      queryParams["offset"] = pagination.offset;
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

  // --- Committee Document Methods ---

  public async getCommitteeReportDetails(
    params: CommitteeReportResourceParams
  ): Promise<any> {
    const endpoint = `/committee-report/${params.congress}/${params.reportType}/${params.reportNumber}`;
    return this.executeRequest(endpoint);
  }

  public async getCommitteeReportText(
    params: CommitteeReportTextParams
  ): Promise<any> {
    const endpoint = `/committee-report/${params.congress}/${params.reportType}/${params.reportNumber}/text`;
    return this.executeRequest(endpoint);
  }

  public async getCommitteePrintDetails(
    params: CommitteePrintResourceParams
  ): Promise<any> {
    const endpoint = `/committee-print/${params.congress}/${params.chamber}/${params.jacketNumber}`;
    return this.executeRequest(endpoint);
  }

  public async getCommitteePrintText(
    params: CommitteePrintTextParams
  ): Promise<any> {
    const endpoint = `/committee-print/${params.congress}/${params.chamber}/${params.jacketNumber}/text`;
    return this.executeRequest(endpoint);
  }

  public async getCommitteeMeetingDetails(
    params: CommitteeMeetingResourceParams
  ): Promise<any> {
    const endpoint = `/committee-meeting/${params.congress}/${params.chamber}/${params.eventId}`;
    return this.executeRequest(endpoint);
  }

  public async getCommitteeHearingDetails(
    params: CommitteeHearingResourceParams
  ): Promise<any> {
    const endpoint = `/hearing/${params.congress}/${params.chamber}/${params.jacketNumber}`;
    return this.executeRequest(endpoint);
  }

  // Add methods for other specific types as needed, mapping params to endpoint structure
  // public async getNominationDetails(params: NominationResourceParams): Promise<any> { ... }
  // public async getTreatyDetails(params: TreatyResourceParams): Promise<any> { ... }
  // public async getCommunicationDetails(params: CommunicationResourceParams): Promise<any> { ... }
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

  /**
   * Get actions for a specific bill
   * @param params Bill parameters including congress, billType, and billNumber
   * @param pagination Optional pagination parameters
   * @returns List of actions taken on the bill
   * @example
   * // Get actions for H.R. 21 from the 117th Congress
   * await getBillActions({ congress: "117", billType: "hr", billNumber: "21" })
   * // API endpoint: /bill/117/hr/21/actions
   */
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

  // --- Nomination Resource Methods ---

  /**
   * Get details about a specific nomination.
   */
  public async getNominationDetails(
    params: NominationResourceParams
  ): Promise<any> {
    const endpoint = `/nomination/${params.congress}/${params.nominationNumber}`;
    return this.executeRequest(endpoint);
  }

  /**
   * Get details about a specific nominee within a nomination.
   */
  public async getNominationNominee(
    params: NominationNomineeParams
  ): Promise<any> {
    const endpoint = `/nomination/${params.congress}/${params.nominationNumber}/${params.ordinal}`;
    return this.executeRequest(endpoint);
  }

  /**
   * Get actions for a specific nomination.
   */
  public async getNominationActions(
    params: NominationSubResourceParams,
    pagination?: PaginationParams
  ): Promise<any> {
    const endpoint = `/nomination/${params.congress}/${params.nominationNumber}/actions`;
    const queryParams: Record<string, string | number> = {};
    if (pagination?.limit !== undefined) {
      queryParams["limit"] = pagination.limit;
    }
    if (pagination?.offset !== undefined) {
      queryParams["offset"] = pagination.offset;
    }
    return this.executeRequest(endpoint, queryParams);
  }

  /**
   * Get committees associated with a specific nomination.
   */
  public async getNominationCommittees(
    params: NominationSubResourceParams,
    pagination?: PaginationParams
  ): Promise<any> {
    const endpoint = `/nomination/${params.congress}/${params.nominationNumber}/committees`;
    const queryParams: Record<string, string | number> = {};
    if (pagination?.limit !== undefined) {
      queryParams["limit"] = pagination.limit;
    }
    if (pagination?.offset !== undefined) {
      queryParams["offset"] = pagination.offset;
    }
    return this.executeRequest(endpoint, queryParams);
  }

  /**
   * Get hearings related to a specific nomination.
   */
  public async getNominationHearings(
    params: NominationSubResourceParams,
    pagination?: PaginationParams
  ): Promise<any> {
    const endpoint = `/nomination/${params.congress}/${params.nominationNumber}/hearings`;
    const queryParams: Record<string, string | number> = {};
    if (pagination?.limit !== undefined) {
      queryParams["limit"] = pagination.limit;
    }
    if (pagination?.offset !== undefined) {
      queryParams["offset"] = pagination.offset;
    }
    return this.executeRequest(endpoint, queryParams);
  }

  // --- Congressional Record Methods ---

  /**
   * Get general Congressional Record list.
   */
  public async getCongressionalRecord(
    pagination?: PaginationParams
  ): Promise<any> {
    const endpoint = "/congressional-record";
    const queryParams: Record<string, string | number> = {};
    if (pagination?.limit !== undefined) {
      queryParams["limit"] = pagination.limit;
    }
    if (pagination?.offset !== undefined) {
      queryParams["offset"] = pagination.offset;
    }
    return this.executeRequest(endpoint, queryParams);
  }

  /**
   * Get Daily Congressional Record details by volume and issue number.
   */
  public async getDailyCongressionalRecord(
    params: DailyCongressionalRecordResourceParams
  ): Promise<any> {
    const endpoint = `/daily-congressional-record/${params.volumeNumber}/${params.issueNumber}`;
    return this.executeRequest(endpoint);
  }

  /**
   * Get Daily Congressional Record articles by volume and issue number.
   */
  public async getDailyCongressionalRecordArticles(
    params: DailyCongressionalRecordArticlesResourceParams,
    pagination?: PaginationParams
  ): Promise<any> {
    const endpoint = `/daily-congressional-record/${params.volumeNumber}/${params.issueNumber}/articles`;
    const queryParams: Record<string, string | number> = {};
    if (pagination?.limit !== undefined) {
      queryParams["limit"] = pagination.limit;
    }
    if (pagination?.offset !== undefined) {
      queryParams["offset"] = pagination.offset;
    }
    return this.executeRequest(endpoint, queryParams);
  }

  /**
   * Get Bound Congressional Record by date.
   */
  public async getBoundCongressionalRecord(
    params: BoundCongressionalRecordResourceParams
  ): Promise<any> {
    const endpoint = `/bound-congressional-record/${params.year}/${params.month}/${params.day}`;
    return this.executeRequest(endpoint);
  }

  // --- Communication Resource Methods ---

  /**
   * Get details about a specific House Communication.
   */
  public async getHouseCommunicationDetails(
    params: HouseCommunicationResourceParams
  ): Promise<any> {
    const endpoint = `/house-communication/${params.congress}/${params.communicationType}/${params.communicationNumber}`;
    return this.executeRequest(endpoint);
  }

  /**
   * Get details about a specific Senate Communication.
   */
  public async getSenateCommunicationDetails(
    params: SenateCommunicationResourceParams
  ): Promise<any> {
    const endpoint = `/senate-communication/${params.congress}/${params.communicationType}/${params.communicationNumber}`;
    return this.executeRequest(endpoint);
  }

  /**
   * Get details about a specific House Requirement.
   */
  public async getHouseRequirementDetails(
    params: HouseRequirementResourceParams
  ): Promise<any> {
    const endpoint = `/house-requirement/${params.requirementNumber}`;
    return this.executeRequest(endpoint);
  }

  /**
   * Get matching communications for a specific House Requirement.
   */
  public async getHouseRequirementMatchingCommunications(
    params: HouseRequirementMatchingCommunicationsParams,
    pagination?: PaginationParams
  ): Promise<any> {
    const endpoint = `/house-requirement/${params.requirementNumber}/matching-communications`;
    const queryParams: Record<string, string | number> = {};
    if (pagination?.limit !== undefined) {
      queryParams["limit"] = pagination.limit;
    }
    if (pagination?.offset !== undefined) {
      queryParams["offset"] = pagination.offset;
    }
    return this.executeRequest(endpoint, queryParams);
  }

  // --- Treaty Resource Methods ---

  /**
   * Get details about a specific treaty.
   */
  public async getTreatyDetails(params: TreatyResourceParams): Promise<any> {
    const endpoint = `/treaty/${params.congress}/${params.treatyNumber}`;
    return this.executeRequest(endpoint);
  }

  /**
   * Get details about a partitioned treaty.
   */
  public async getTreatyPartitionDetails(
    params: TreatyPartitionResourceParams
  ): Promise<any> {
    const endpoint = `/treaty/${params.congress}/${params.treatyNumber}/${params.treatySuffix}`;
    return this.executeRequest(endpoint);
  }

  /**
   * Get actions for a specific treaty.
   */
  public async getTreatyActions(
    params: TreatySubResourceParams,
    pagination?: PaginationParams
  ): Promise<any> {
    const endpoint = `/treaty/${params.congress}/${params.treatyNumber}/actions`;
    const queryParams: Record<string, string | number> = {};
    if (pagination?.limit !== undefined) {
      queryParams["limit"] = pagination.limit;
    }
    if (pagination?.offset !== undefined) {
      queryParams["offset"] = pagination.offset;
    }
    return this.executeRequest(endpoint, queryParams);
  }

  /**
   * Get committees associated with a specific treaty.
   */
  public async getTreatyCommittees(
    params: TreatySubResourceParams,
    pagination?: PaginationParams
  ): Promise<any> {
    const endpoint = `/treaty/${params.congress}/${params.treatyNumber}/committees`;
    const queryParams: Record<string, string | number> = {};
    if (pagination?.limit !== undefined) {
      queryParams["limit"] = pagination.limit;
    }
    if (pagination?.offset !== undefined) {
      queryParams["offset"] = pagination.offset;
    }
    return this.executeRequest(endpoint, queryParams);
  }

  // --- CRS Report Resource Methods ---

  /**
   * Get details about a specific CRS report.
   */
  public async getCRSReportDetails(
    params: CRSReportResourceParams
  ): Promise<any> {
    const endpoint = `/crsreport/${params.reportNumber}`;
    return this.executeRequest(endpoint);
  }

  // --- Summaries Resource Methods ---

  /**
   * Get bill summaries for a specific congress and bill type.
   */
  public async getSummaries(
    params: SummariesResourceParams,
    pagination?: PaginationParams
  ): Promise<any> {
    const endpoint = `/summaries/${params.congress}/${params.billType}`;
    const queryParams: Record<string, string | number> = {};
    if (pagination?.limit !== undefined) {
      queryParams["limit"] = pagination.limit;
    }
    if (pagination?.offset !== undefined) {
      queryParams["offset"] = pagination.offset;
    }
    return this.executeRequest(endpoint, queryParams);
  }

  // --- House Vote Resource Methods (Beta) ---

  /**
   * Get details about a specific House vote.
   */
  public async getHouseVoteDetails(
    params: HouseVoteResourceParams
  ): Promise<any> {
    const endpoint = `/house-vote/${params.congress}/${params.session}/${params.voteNumber}`;
    return this.executeRequest(endpoint);
  }

  /**
   * Get member votes for a specific House vote.
   */
  public async getHouseVoteMembers(
    params: HouseVoteMembersResourceParams,
    pagination?: PaginationParams
  ): Promise<any> {
    const endpoint = `/house-vote/${params.congress}/${params.session}/${params.voteNumber}/members`;
    const queryParams: Record<string, string | number> = {};
    if (pagination?.limit !== undefined) {
      queryParams["limit"] = pagination.limit;
    }
    if (pagination?.offset !== undefined) {
      queryParams["offset"] = pagination.offset;
    }
    return this.executeRequest(endpoint, queryParams);
  }
}

// Note: Removed default singleton export. Instantiation should be handled by the caller (e.g., in createServer.ts)
// This improves testability and allows configuration injection.
