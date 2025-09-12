/**
 * Parameters for retrieving details about a specific CRS report.
 * Based on API endpoint: /crsreport/{reportNumber}
 */
export interface CRSReportResourceParams {
  reportNumber: string;
}

/**
 * CRS (Congressional Research Service) report detail from the Congress API.
 */
export interface CRSReportDetail {
  reportNumber?: string;
  title?: string;
  summary?: string;
  date?: string;
  updateDate?: string;
  versions?: CRSReportVersion[];
  topics?: string[];
  authors?: CRSAuthor[];
  url?: string;
  [key: string]: any;
}

/**
 * CRS report version information.
 */
export interface CRSReportVersion {
  versionCode?: string;
  versionDate?: string;
  title?: string;
  summary?: string;
  url?: string;
  [key: string]: any;
}

/**
 * CRS report author information.
 */
export interface CRSAuthor {
  name?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  [key: string]: any;
}
