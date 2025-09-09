/**
 * Parameters for retrieving details about a specific Committee.
 */
export interface CommitteeResourceParams {
  /** The congress number (e.g., "117", "118"). Optional for some lookups? */
  congress?: string; // Made optional based on service method refinement
  /** The chamber ('house' or 'senate'). */
  chamber: string;
  /** The committee code (e.g., "hsju00", "ssga00"). */
  committeeCode: string;
}

// Add other Committee-related types if needed
export interface CommitteeDetail {
  // Define fields based on the actual API response for /committee/{chamber}/{code}
  systemCode: string;
  chamber: string;
  name: string;
  url: string;
  // ... other fields
}
