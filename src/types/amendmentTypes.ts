/**
 * Parameters for retrieving details about a specific Amendment.
 */
export interface AmendmentResourceParams {
  /** The congress number (e.g., "117", "118"). */
  congress: string; // Assuming number is passed as string from URI
  /** The amendment type (e.g., "samdt", "hamdt"). */
  amendmentType: string;
  /** The amendment number (e.g., "2137"). */
  amendmentNumber: string; // Assuming number is passed as string from URI
}

// Amendment Detail types
export interface AmendmentDetail {
  // Define fields based on the actual API response for /amendment/{congress}/{type}/{number}
  congress: number;
  number: string;
  type: string;
  updateDate: string;
  url: string;
  // ... other fields like description, purpose, sponsor, etc.
}

export interface AmendmentAction {
  actionDate: string;
  text: string;
  type: string;
  actionCode?: string;
}

export interface AmendmentCosponsor {
  bioguideId: string;
  firstName: string;
  lastName: string;
  party: string;
  state: string;
  sponsorshipDate: string;
  sponsorshipWithdrawnDate?: string;
}

export interface AmendmentText {
  date: string;
  type: string;
  formattedText?: string;
}
