/**
 * Parameters for retrieving details about a specific Congress.
 */
export interface CongressResourceParams {
  /** The congress number (e.g., "117", "118"). */
  congress: string;
}

// Add other Congress-related types if needed, e.g., for the API response structure
export interface CongressDetail {
  // Define fields based on the actual API response for /congress/{congress}
  name: string;
  number: number;
  sessions: { name: string; startDate: string; endDate: string }[];
  // ... other fields
}
