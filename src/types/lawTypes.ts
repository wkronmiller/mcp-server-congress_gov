/**
 * Parameters for retrieving details about a specific Law.
 */
export interface LawResourceParams {
  /** The congress number (e.g., "117", "118"). */
  congress: string; // Assuming number is passed as string from URI
  /** The law type (public or private). */
  lawType: string;
  /** The law number (e.g., "1", "123"). */
  lawNumber: string; // Assuming number is passed as string from URI
}

/**
 * Parameters for retrieving laws by congress and type.
 */
export interface LawListParams {
  /** The congress number (e.g., "117", "118"). */
  congress: string;
  /** The law type (public or private). */
  lawType: string;
}

/**
 * Parameters for retrieving laws by congress only.
 */
export interface LawCongressParams {
  /** The congress number (e.g., "117", "118"). */
  congress: string;
}

// Law Detail types
export interface LawDetail {
  // Define fields based on the actual API response for /law/{congress}/{type}/{number}
  congress: number;
  number: string;
  type: string;
  updateDate: string;
  url: string;
  title?: string;
  originChamber?: string;
  policyArea?: {
    name: string;
  };
  subjects?: Array<{
    name: string;
  }>;
  // ... other fields like description, sponsors, etc.
}

export interface LawAction {
  actionDate: string;
  text: string;
  type: string;
  actionCode?: string;
}

export interface LawText {
  date: string;
  type: string;
  formattedText?: string;
}
