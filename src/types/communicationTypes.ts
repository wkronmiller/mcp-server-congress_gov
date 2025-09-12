/**
 * Parameters for retrieving details about a specific House Communication.
 * API endpoint: /house-communication/{congress}/{communicationType}/{communicationNumber}
 */
export interface HouseCommunicationResourceParams {
  congress: string;
  communicationType: string;
  communicationNumber: string;
}

/**
 * Parameters for retrieving details about a specific Senate Communication.
 * API endpoint: /senate-communication/{congress}/{communicationType}/{communicationNumber}
 */
export interface SenateCommunicationResourceParams {
  congress: string;
  communicationType: string;
  communicationNumber: string;
}

/**
 * Parameters for retrieving details about a specific House Requirement.
 * API endpoint: /house-requirement/{requirementNumber}
 */
export interface HouseRequirementResourceParams {
  requirementNumber: string;
}

/**
 * Parameters for retrieving matching communications for a House Requirement.
 * API endpoint: /house-requirement/{requirementNumber}/matching-communications
 */
export interface HouseRequirementMatchingCommunicationsParams {
  requirementNumber: string;
}

/**
 * Communication types used in the Congress.gov API
 * These are common communication type codes:
 * - ec: Executive Communication
 * - ml: Memorial
 * - pm: Presidential Message
 * - pt: Petition
 */
export type CommunicationType = "ec" | "ml" | "pm" | "pt" | string;

/**
 * Communication detail structure returned by the API
 */
export interface CommunicationDetail {
  congress?: number;
  communicationType?: string;
  communicationNumber?: number;
  title?: string;
  description?: string;
  url?: string;
  updateDate?: string;
  [key: string]: any; // Allow for additional API response fields
}

/**
 * House requirement detail structure returned by the API
 */
export interface HouseRequirementDetail {
  requirementNumber?: number;
  title?: string;
  description?: string;
  url?: string;
  updateDate?: string;
  [key: string]: any; // Allow for additional API response fields
}
