/**
 * Parameters for retrieving details about a specific Nomination.
 * Define based on API endpoint structure, e.g., /nomination/{congress}/{number}
 */
export interface NominationResourceParams {
    congress: string;
    number: string; // Or is it a specific ID? Check API docs.
}

export interface NominationDetail {
    // Define fields based on API response
    [key: string]: any; // Placeholder
}
