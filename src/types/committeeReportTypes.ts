/**
 * Parameters for retrieving details about a specific Committee Report.
 * Define based on API endpoint structure, e.g., /committee-report/{congress}/{reportType}/{number}
 */
export interface CommitteeReportResourceParams {
  congress: string;
  reportType: string; // e.g., 'hrpt', 'srpt'
  number: string;
}

export interface CommitteeReportDetail {
  // Define fields based on API response
  [key: string]: any; // Placeholder
}
