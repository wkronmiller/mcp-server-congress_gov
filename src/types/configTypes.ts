/**
 * Configuration options for the RateLimitService.
 */
export interface RateLimitConfig {
    maxRequests: number; // Max requests allowed
    perHours: number;    // Within this number of hours
    enableBackoff?: boolean; // Optional: Whether to implement backoff on 429 errors
}

/**
 * Configuration options for the CongressGovService.
 */
export interface CongressGovConfig {
    apiKey: string;     // API key for api.data.gov
    baseUrl: string;    // Base URL for the Congress.gov API
    timeout: number;    // Request timeout in milliseconds
}

// Add other configuration interfaces as needed
