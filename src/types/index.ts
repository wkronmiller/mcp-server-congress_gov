// Export all types and interfaces from this barrel file
export * from "./billTypes.js";
export * from "./memberTypes.js";
export * from "./congressTypes.js"; // Added
export * from "./committeeTypes.js"; // Added
export * from "./amendmentTypes.js"; // Added
export * from "./nominationTypes.js"; // Added
export * from "./treatyTypes.js"; // Added
export * from "./communicationTypes.js"; // Added
export * from "./committeeReportTypes.js"; // Added
export * from "./congressionalRecordTypes.js"; // Added
export * from "./lawTypes.js"; // Added
export * from "./crsTypes.js"; // Added
export * from "./summaryTypes.js"; // Added
export * from "./houseVoteTypes.js"; // Added
export * from "./configTypes.js";
export * from "./commonTypes.js"; // Added

// Define common types used across services/tools if any
export interface CommonContext {
  sessionId?: string;
  userId?: string;
}

// Re-export specific types needed by service/tools if not covered by '*'
// (Example - adjust based on actual needs)
// export type { BillResourceParams } from './billTypes.js';
// export type { MemberResourceParams } from './memberTypes.js';
// export type { PaginationParams, SearchParams, ApiResponse } from './commonTypes.js';
