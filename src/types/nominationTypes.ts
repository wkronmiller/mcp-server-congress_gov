/**
 * Parameters for retrieving details about a specific nomination.
 * Based on API endpoint: /nomination/{congress}/{nominationNumber}
 */
export interface NominationResourceParams {
  congress: string;
  nominationNumber: string;
}

/**
 * Parameters for retrieving a specific nominee within a nomination.
 * Based on API endpoint: /nomination/{congress}/{nominationNumber}/{ordinal}
 */
export interface NominationNomineeParams extends NominationResourceParams {
  ordinal: string;
}

/**
 * Parameters for retrieving nomination sub-resources (actions, committees, hearings).
 */
export interface NominationSubResourceParams extends NominationResourceParams {
  // Base params are sufficient for sub-resources
}

/**
 * Nomination detail from the Congress API.
 */
export interface NominationDetail {
  congress: number;
  number: string;
  partNumber?: string;
  description?: string;
  receivedDate?: string;
  latestAction?: NominationAction;
  organization?: string;
  nominees?: Nominee[];
  actions?: NominationAction[];
  committees?: NominationCommittee[];
  hearings?: NominationHearing[];
  updateDate?: string;
  updateDateIncludingText?: string;
  url?: string;
  [key: string]: any;
}

/**
 * Individual nominee within a nomination.
 */
export interface Nominee {
  ordinal?: number;
  name?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  suffix?: string;
  position?: string;
  organization?: string;
  state?: string;
  description?: string;
  bioguideId?: string;
  url?: string;
  [key: string]: any;
}

/**
 * Nomination action/activity.
 */
export interface NominationAction {
  actionDate?: string;
  actionCode?: string;
  text?: string;
  type?: string;
  committee?: NominationCommittee;
  sourceSystem?: {
    name?: string;
    code?: string;
  };
  [key: string]: any;
}

/**
 * Committee associated with a nomination.
 */
export interface NominationCommittee {
  systemCode?: string;
  name?: string;
  chamber?: string;
  type?: string;
  subcommittees?: NominationCommittee[];
  activities?: CommitteeActivity[];
  url?: string;
  [key: string]: any;
}

/**
 * Committee activity related to a nomination.
 */
export interface CommitteeActivity {
  name?: string;
  date?: string;
  [key: string]: any;
}

/**
 * Hearing related to a nomination.
 */
export interface NominationHearing {
  jacketNumber?: string;
  chamber?: string;
  congress?: number;
  sessionNumber?: string;
  hearingNumber?: string;
  partNumber?: string;
  date?: string;
  title?: string;
  committee?: NominationCommittee;
  url?: string;
  [key: string]: any;
}
