/**
 * Parameters for retrieving details about a specific treaty.
 * Based on API endpoint: /treaty/{congress}/{treatyNumber}
 */
export interface TreatyResourceParams {
  congress: string;
  treatyNumber: string;
}

/**
 * Parameters for retrieving a partitioned treaty.
 * Based on API endpoint: /treaty/{congress}/{treatyNumber}/{treatySuffix}
 */
export interface TreatyPartitionResourceParams extends TreatyResourceParams {
  treatySuffix: string; // e.g., "A", "B", etc.
}

/**
 * Parameters for retrieving treaty sub-resources (actions, committees).
 */
export interface TreatySubResourceParams extends TreatyResourceParams {
  // Base params are sufficient for sub-resources
}

/**
 * Treaty detail from the Congress API.
 */
export interface TreatyDetail {
  congress: number;
  number: string;
  suffix?: string;
  partNumber?: string;
  transmittedDate?: string;
  title?: string;
  description?: string;
  topic?: string[];
  latestAction?: TreatyAction;
  actions?: TreatyAction[];
  committees?: TreatyCommittee[];
  updateDate?: string;
  updateDateIncludingText?: string;
  url?: string;
  [key: string]: any;
}

/**
 * Treaty action/activity.
 */
export interface TreatyAction {
  actionDate?: string;
  actionCode?: string;
  text?: string;
  type?: string;
  committee?: TreatyCommittee;
  sourceSystem?: {
    name?: string;
    code?: string;
  };
  [key: string]: any;
}

/**
 * Committee associated with a treaty.
 */
export interface TreatyCommittee {
  systemCode?: string;
  name?: string;
  chamber?: string;
  type?: string;
  subcommittees?: TreatyCommittee[];
  activities?: TreatyCommitteeActivity[];
  url?: string;
  [key: string]: any;
}

/**
 * Committee activity related to a treaty.
 */
export interface TreatyCommitteeActivity {
  name?: string;
  date?: string;
  [key: string]: any;
}
