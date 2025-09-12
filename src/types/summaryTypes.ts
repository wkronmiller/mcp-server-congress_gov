/**
 * Parameters for retrieving bill summaries.
 * Based on API endpoint: /summaries/{congress}/{billType}
 */
export interface SummariesResourceParams {
  congress: string;
  billType: string;
}

/**
 * Bill summaries collection from the Congress API.
 */
export interface SummariesCollection {
  summaries: BillSummary[];
  pagination?: {
    count?: number;
    next?: string;
    prev?: string;
  };
  request?: {
    congress: number;
    billType: string;
    contentType: string;
    format: string;
  };
}

/**
 * Individual bill summary.
 */
export interface BillSummary {
  actionDate?: string;
  actionDesc?: string;
  text?: string;
  updateDate?: string;
  versionCode?: string;
  bill?: {
    congress: number;
    type: string;
    number: string;
    title: string;
    url: string;
  };
  [key: string]: any;
}
