import axios, { AxiosInstance, AxiosError, AxiosResponse } from 'axios';
// import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js'; // No longer throwing McpError directly
import { logger } from '../utils/index.js';
import { ConfigurationManager } from '../config/ConfigurationManager.js';
import { CongressGovConfig } from '../types/configTypes.js';
import { BillResourceParams, MemberResourceParams } from '../types/index.js'; // Import needed param types
import { ApiError, RateLimitError, NotFoundError } from '../utils/errors.js'; // Import custom errors
import { RateLimitService } from './RateLimitService.js'; // Import RateLimitService

// Define types for other params inline or import if defined elsewhere
interface CongressResourceParams { congress: string; }
interface CommitteeResourceParams { congress: string; chamber: string; committeeCode: string; }
interface SearchResourceParams { collection: string; query: string; limit?: number; offset?: number; }

// const BASE_URL = 'https://api.congress.gov/v3'; // Now comes from config
// const API_KEY_ENV_VAR = 'CONGRESS_GOV_API_KEY'; // Now comes from config

/**
 * Service responsible for handling communication with the Congress.gov API.
 * It configures Axios with the base URL and API key, integrates rate limiting,
 * and provides methods for specific API endpoints, throwing custom errors.
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
                format: 'json', // Default to JSON format
            },
            timeout: this.config.timeout,
        });

        // Simplified interceptor: just log, throw custom errors from makeRequest
        this.axiosInstance.interceptors.response.use(
            (response: AxiosResponse) => response,
            (error: AxiosError) => {
                // Log the raw error here
                logger.error(`Raw Congress API Error: ${error.message}`, {
                    url: error.config?.url?.replace(this.config.apiKey, '[REDACTED]'), // Redact key
                    status: error.response?.status,
                    data: error.response?.data,
                });
                // Let makeRequest handle throwing specific custom errors
                return Promise.reject(error);
            }
        );

        logger.info('CongressApiService initialized', { baseUrl: this.config.baseUrl, timeout: this.config.timeout });
    }

    /**
     * Makes a request to the Congress.gov API, handling rate limits and errors.
     *
     * @param endpoint - API endpoint path (without base URL)
     * @param params - Optional query parameters
     * @returns Response data as JSON
     * @throws {ApiError} If the API request fails for non-404 reasons.
     * @throws {NotFoundError} If the API returns a 404 status.
     * @throws {RateLimitError} If rate limits are exceeded before making the call.
     */
    public async makeRequest(endpoint: string, params: Record<string, string | number> = {}): Promise<any> { // Changed to public
        // Check rate limits before making the call
        if (!this.rateLimitService.canMakeRequest()) {
            throw new RateLimitError("Congress.gov API rate limit exceeded (pre-check)");
        }

        // Build URL (params handled by axios config)
        const url = `${this.config.baseUrl}${endpoint}`;
        const requestParams = { ...params }; // Copy params to avoid modifying axios defaults

        // Add context to debug log
        logger.debug(`Making API request`, { endpoint, params: requestParams });

        try {
            const response = await this.axiosInstance.get(endpoint, { params: requestParams });
            // Record request *after* successful call (or decide if pre-call is better)
            this.rateLimitService.recordRequest();
            return response.data; // Return parsed JSON data
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response) {
                    const status = error.response.status;
                    const responseData = error.response.data as any; // Type assertion
                    const errorMessage = responseData?.message || responseData?.error?.message || error.message || 'Unknown API error';

                    if (status === 404) {
                        throw new NotFoundError(`Resource not found at API endpoint: ${endpoint}`);
                    }
                    // Handle cases where API returns 500 but message indicates "not found"
                    if (status === 500 && errorMessage.toLowerCase().includes('not found')) {
                        // Log with context
                        logger.warn(`API returned 500 but message indicates 'not found'`, { endpoint, status, responseData });
                        throw new NotFoundError(`Resource not found at API endpoint (reported as 500): ${endpoint}`);
                    }
                    if (status === 429) {
                        // Even if pre-check passed, API might still return 429
                        throw new RateLimitError(`Congress.gov API rate limit hit (status 429)`);
                    }
                    // Throw generic ApiError for other client/server errors from API
                    throw new ApiError(
                        `Congress API request failed with status ${status}: ${errorMessage}`,
                        status,
                        responseData
                    );
                } else if (error.request) {
                    // Network error, timeout, etc.
                    throw new ApiError(`Congress API request failed: No response received. ${error.message}`, 0, { code: error.code });
                }
            }
            // Rethrow unexpected errors (e.g., setup errors) as generic ApiError
            throw new ApiError(`Congress API request failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 0, error);
        }
    }

    // --- Specific Endpoint Methods (from Feature Spec) ---

    public async getBill(params: BillResourceParams): Promise<any> {
        const endpoint = `/bill/${params.congress}/${params.billType}/${params.billNumber}`;
        return this.makeRequest(endpoint);
    }

    public async getMember(params: MemberResourceParams): Promise<any> {
        const endpoint = `/member/${params.memberId}`;
        return this.makeRequest(endpoint);
    }

    public async getCongress(params: CongressResourceParams): Promise<any> {
        const endpoint = `/congress/${params.congress}`;
        return this.makeRequest(endpoint);
    }

    public async getCommittee(params: CommitteeResourceParams): Promise<any> {
        const endpoint = `/committee/${params.congress}/${params.chamber}/${params.committeeCode}`;
        return this.makeRequest(endpoint);
    }

    public async search(params: SearchResourceParams): Promise<any> {
        const endpoint = `/${params.collection}`;
        const queryParams: Record<string, string | number> = { q: params.query };
        if (params.limit !== undefined) {
            queryParams.limit = params.limit;
        }
        if (params.offset !== undefined) {
            queryParams.offset = params.offset;
        }
        return this.makeRequest(endpoint, queryParams);
    }

    // Note: Removed get client() method as internal axios instance shouldn't be exposed directly.
    // Add common utility methods here if needed, e.g., handling pagination
}

// Export a singleton instance (optional, depends on usage pattern)
// Consider if dependency injection is preferred over singleton for testability
const congressApiServiceInstance = new CongressApiService();
export default congressApiServiceInstance;
