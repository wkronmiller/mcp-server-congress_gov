/**
 * Parameters for retrieving details about a specific Treaty.
 * Define based on API endpoint structure, e.g., /treaty/{congress}/{number}
 */
export interface TreatyResourceParams {
  congress: string;
  number: string; // Or is it a specific ID? Check API docs.
}

export interface TreatyDetail {
  // Define fields based on API response
  [key: string]: any; // Placeholder
}
