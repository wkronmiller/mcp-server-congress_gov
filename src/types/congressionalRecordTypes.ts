/**
 * Parameters for retrieving details about a specific Congressional Record issue.
 * Define based on API endpoint structure, e.g., /congressional-record/{year}/{month}/{day}
 */
export interface CongressionalRecordResourceParams {
  year: string;
  month?: string;
  day?: string;
}

/**
 * Parameters for Daily Congressional Record resources.
 */
export interface DailyCongressionalRecordResourceParams {
  volumeNumber: string;
  issueNumber: string;
}

/**
 * Parameters for Daily Congressional Record Articles sub-resources.
 */
export interface DailyCongressionalRecordArticlesResourceParams {
  volumeNumber: string;
  issueNumber: string;
}

/**
 * Parameters for Bound Congressional Record resources.
 */
export interface BoundCongressionalRecordResourceParams {
  year: string;
  month: string;
  day: string;
}

/**
 * Defines the structure for a single Congressional Record issue in a list.
 */
export interface CongressionalRecord {
  Congress: string;
  Id: number;
  Issue: string;
  Links: {
    Digest?: {
      Label: string;
      Ordinal: number;
      PDF: Array<{ Part: string; Url: string }>;
    };
    FullRecord?: {
      Label: string;
      Ordinal: number;
      PDF: Array<{ Part: string; Url: string }>;
    };
    House?: {
      Label: string;
      Ordinal: number;
      PDF: Array<{ Part: string; Url: string }>;
    };
    Remarks?: {
      Label: string;
      Ordinal: number;
      PDF: Array<{ Part: string; Url: string }>;
    };
    Senate?: {
      Label: string;
      Ordinal: number;
      PDF: Array<{ Part: string; Url: string }>;
    };
  };
  PublishDate: string;
  Session: string;
  Volume: string;
}

/**
 * Defines the structure for the response of the Congressional Record list endpoint.
 */
export interface CongressionalRecordListResponse {
  Results: {
    IndexStart: number;
    Issues: CongressionalRecord[];
    SetSize: number;
    TotalCount: number;
  };
  Status: {
    Code: string;
    Message: string;
  };
}

/**
 * Defines the structure for a section within a Congressional Record.
 */
export interface CongressionalRecordSection {
  chamber: string;
  number: string;
  part: string;
  title: string;
  type: string;
}

/**
 * Defines the structure for the details of a Congressional Record.
 */
export interface CongressionalRecordDetail {
  chamber: string;
  date: string;
  sections: CongressionalRecordSection[];
  updateDate: string;
}

/**
 * Defines the structure for the response of the Congressional Record detail endpoint.
 */
export interface CongressionalRecordDetailResponse {
  congressionalRecord: CongressionalRecordDetail;
}

/**
 * Defines the structure for a Daily Congressional Record item.
 */
export interface DailyCongressionalRecord {
  congress: number;
  fullIssue: {
    articles: {
      count: number;
      url: string;
    };
    entireIssue: Array<{
      part: string;
      type: string;
      url: string;
    }>;
    sections: Array<{
      endPage: string;
      name: string;
      startPage: string;
      text: Array<{
        part?: string;
        type: string;
        url: string;
      }>;
    }>;
  };
  issueDate: string;
  issueNumber: string;
  sessionNumber: number;
  updateDate: string;
  url: string;
  volumeNumber: number;
}

/**
 * Defines the structure for the response of the Daily Congressional Record endpoint.
 */
export interface DailyCongressionalRecordResponse {
  issue: DailyCongressionalRecord;
  request: {
    contentType: string;
    format: string;
    issueNumber: string;
    volumeNumber: string;
  };
}

/**
 * Defines the structure for a section article within a Daily Congressional Record.
 */
export interface DailyCongressionalRecordSectionArticle {
  endPage: string;
  startPage: string;
  text: Array<{
    type: string;
    url: string;
  }>;
  title: string;
}

/**
 * Defines the structure for an article section within a Daily Congressional Record.
 */
export interface DailyCongressionalRecordArticle {
  name: string;
  sectionArticles: DailyCongressionalRecordSectionArticle[];
}

/**
 * Defines the structure for the response of the Daily Congressional Record Articles endpoint.
 */
export interface DailyCongressionalRecordArticlesResponse {
  articles: DailyCongressionalRecordArticle[];
  pagination: {
    count: number;
    next?: string;
  };
  request: {
    contentType: string;
    format: string;
    issueNumber: string;
    volumeNumber: string;
  };
}

/**
 * Defines the structure for a Bound Congressional Record item.
 */
export interface BoundCongressionalRecord {
  chamber: string;
  congress: number;
  date: string;
  number: string;
  sessionNumber: number;
  title: string;
  updateDate: string;
  url: string;
  volumeNumber: number;
}

/**
 * Defines the structure for the response of the Bound Congressional Record endpoint.
 * This can contain an empty array if no data exists for the date.
 */
export interface BoundCongressionalRecordResponse {
  boundCongressionalRecord:
    | BoundCongressionalRecord[]
    | BoundCongressionalRecord;
  pagination: {
    count: number;
  };
  request: {
    contentType: string;
    day: string;
    format: string;
    month: string;
    year: string;
  };
}
