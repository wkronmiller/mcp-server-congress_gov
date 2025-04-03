/**
 * Parameters for retrieving details about a specific Amendment.
 */
export interface AmendmentResourceParams {
    /** The congress number (e.g., "117", "118"). */
    congress: string; // Assuming number is passed as string from URI
    /** The amendment type (e.g., "samdt", "hamdt"). */
    amendmentType: string;
    /** The amendment number (e.g., "2137"). */
    amendmentNumber: string; // Assuming number is passed as string from URI
}

// Add other Amendment-related types if needed
export interface AmendmentDetail {
    // Define fields based on the actual API response for /amendment/{congress}/{type}/{number}
    congress: number;
    number: string;
    type: string;
    updateDate: string;
    url: string;
    // ... other fields like description, purpose, sponsor, etc.
}
