/**
 * Common pagination parameters used in list requests.
 */
export interface PaginationParams {
    limit?: number;
    offset?: number;
}

/**
 * Common search parameters used by the searchCollection service method.
 */
export interface SearchParams {
    query?: string;
    filters?: {
        // Define specific filters based on what the API supports and the tool exposes
        // Example filters (align with searchParams.ts but allow for expansion):
        type?: string;
        fromDateTime?: string;
        toDateTime?: string;
        currentMember?: boolean; // Specific to member search
        // Add other potential filters here as needed
    };
    sort?: 'updateDate+asc' | 'updateDate+desc';
    limit?: number;
    offset?: number;
}

// Define common API response structure if needed, e.g., for pagination info
export interface ApiResponse<T = any> {
    pagination?: {
        count: number;
        next?: string; // URL for the next page
    };
    request?: Record<string, any>; // Echoed request parameters
    // The main data payload key varies by endpoint (e.g., 'bills', 'members')
    // Use a generic approach or specific interfaces per endpoint
    [key: string]: T[] | any; // Allow for dynamic data keys like 'bills', 'members' etc.
}
