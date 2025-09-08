/**
 * Parameters for retrieving details about a specific Congressional Record issue.
 * Define based on API endpoint structure, e.g., /congressional-record/{year}/{month}/{day}
 */
export interface CongressionalRecordResourceParams {
  // Define based on API structure - might be date parts or an issue ID
  year: string;
  month: string;
  day: string;
  // Or potentially: issueId: string;
}

export interface CongressionalRecordDetail {
  // Define fields based on API response
  [key: string]: any; // Placeholder
}
