/**
 * Valid amendment types supported by the Congress.gov API
 */
export const VALID_AMENDMENT_TYPES = [
  "hamdt", // House Amendment
  "samdt", // Senate Amendment
  "suamdt", // Senate Unprinted Amendment
] as const;

export type AmendmentType = (typeof VALID_AMENDMENT_TYPES)[number];

/**
 * Amendment type descriptions for documentation
 */
export const AMENDMENT_TYPE_DESCRIPTIONS: Record<AmendmentType, string> = {
  hamdt: "House Amendment - Amendment proposed in the House of Representatives",
  samdt: "Senate Amendment - Amendment proposed in the Senate",
  suamdt: "Senate Unprinted Amendment - Senate amendment not yet printed",
};

/**
 * Parameters for retrieving details about a specific Amendment.
 *
 * URI Format: congress-gov://amendment/{congress}/{amendmentType}/{amendmentNumber}
 * Example URI: congress-gov://amendment/117/samdt/2137
 *
 * Field Explanations:
 * - congress: Congressional session number (same as bills)
 * - amendmentType: Chamber and format of the amendment (hamdt, samdt, suamdt)
 * - amendmentNumber: Sequential number assigned to the amendment within its type
 */
export interface AmendmentResourceParams {
  /**
   * Congress session number as string
   * Examples: "117" (117th Congress, 2021-2022), "118" (118th Congress, 2023-2024)
   */
  congress: string;

  /**
   * Amendment type identifier - determines chamber and format
   * Valid values: hamdt (House), samdt (Senate), suamdt (Senate Unprinted)
   * Examples: "samdt" for Senate Amendment, "hamdt" for House Amendment
   */
  amendmentType: string;

  /**
   * Amendment number within its type for the given Congress
   * Examples: "1", "2137", "5084"
   * Range: Typically 1 to several thousand per type per Congress
   */
  amendmentNumber: string;
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
