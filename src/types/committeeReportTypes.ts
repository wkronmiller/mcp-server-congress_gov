/**
 * Parameters for retrieving details about a specific Committee Report.
 * API endpoint: /committee-report/{congress}/{reportType}/{reportNumber}
 */
export interface CommitteeReportResourceParams {
  congress: string;
  reportType: string; // e.g., 'hrpt', 'srpt'
  reportNumber: string;
}

/**
 * Parameters for retrieving text version of a Committee Report.
 * API endpoint: /committee-report/{congress}/{reportType}/{reportNumber}/text
 */
export interface CommitteeReportTextParams
  extends CommitteeReportResourceParams {
  // Inherits congress, reportType, reportNumber
}

/**
 * Parameters for retrieving details about a specific Committee Print.
 * API endpoint: /committee-print/{congress}/{chamber}/{jacketNumber}
 */
export interface CommitteePrintResourceParams {
  congress: string;
  chamber: string; // 'house' or 'senate'
  jacketNumber: string;
}

/**
 * Parameters for retrieving text version of a Committee Print.
 * API endpoint: /committee-print/{congress}/{chamber}/{jacketNumber}/text
 */
export interface CommitteePrintTextParams extends CommitteePrintResourceParams {
  // Inherits congress, chamber, jacketNumber
}

/**
 * Parameters for retrieving details about a specific Committee Meeting.
 * API endpoint: /committee-meeting/{congress}/{chamber}/{eventId}
 */
export interface CommitteeMeetingResourceParams {
  congress: string;
  chamber: string; // 'house' or 'senate'
  eventId: string;
}

/**
 * Parameters for retrieving details about a specific Committee Hearing.
 * API endpoint: /hearing/{congress}/{chamber}/{jacketNumber}
 */
export interface CommitteeHearingResourceParams {
  congress: string;
  chamber: string; // 'house' or 'senate'
  jacketNumber: string;
}

// Response type interfaces (placeholders - can be expanded based on actual API responses)
export interface CommitteeReportDetail {
  congress?: number;
  reportType?: string;
  reportNumber?: string;
  title?: string;
  updateDate?: string;
  url?: string;
  [key: string]: any; // Allow additional fields
}

export interface CommitteePrintDetail {
  congress?: number;
  chamber?: string;
  jacketNumber?: string;
  title?: string;
  updateDate?: string;
  url?: string;
  [key: string]: any; // Allow additional fields
}

export interface CommitteeMeetingDetail {
  congress?: number;
  chamber?: string;
  eventId?: string;
  title?: string;
  date?: string;
  updateDate?: string;
  url?: string;
  [key: string]: any; // Allow additional fields
}

export interface CommitteeHearingDetail {
  congress?: number;
  chamber?: string;
  jacketNumber?: string;
  title?: string;
  date?: string;
  updateDate?: string;
  url?: string;
  [key: string]: any; // Allow additional fields
}
