/**
 * Valid bill types supported by the Congress.gov API
 * Based on the Library of Congress API documentation
 */
export const VALID_BILL_TYPES = [
  "hr", // House Bill (H.R.)
  "s", // Senate Bill (S.)
  "hjres", // House Joint Resolution (H.J.Res.)
  "sjres", // Senate Joint Resolution (S.J.Res.)
  "hconres", // House Concurrent Resolution (H.Con.Res.)
  "sconres", // Senate Concurrent Resolution (S.Con.Res.)
  "hres", // House Simple Resolution (H.Res.)
  "sres", // Senate Simple Resolution (S.Res.)
] as const;

export type BillType = (typeof VALID_BILL_TYPES)[number];

/**
 * Bill type descriptions for documentation
 */
export const BILL_TYPE_DESCRIPTIONS: Record<BillType, string> = {
  hr: "House Bill - Legislation that must be passed by both chambers and signed by the President",
  s: "Senate Bill - Legislation that must be passed by both chambers and signed by the President",
  hjres:
    "House Joint Resolution - Requires approval by both chambers and the President (except constitutional amendments)",
  sjres:
    "Senate Joint Resolution - Requires approval by both chambers and the President (except constitutional amendments)",
  hconres:
    "House Concurrent Resolution - Requires approval by both chambers but not the President",
  sconres:
    "Senate Concurrent Resolution - Requires approval by both chambers but not the President",
  hres: "House Simple Resolution - Concerns only the House and does not require approval by the Senate or President",
  sres: "Senate Simple Resolution - Concerns only the Senate and does not require approval by the House or President",
};

/**
 * Bill type information for reference purposes
 */
export interface BillTypeInfo {
  /** The bill type code (e.g., "hr", "s") */
  code: BillType;
  /** Full name of the bill type */
  name: string;
  /** Detailed description of what this bill type is used for */
  description: string;
  /** Example bill numbers for this type */
  examples: string[];
  /** Which chamber originates this type of bill */
  chamber: "house" | "senate" | "both";
}

/**
 * Response interface for the bill types resource
 */
export interface BillTypesResponse {
  /** List of all available bill types with their information */
  billTypes: BillTypeInfo[];
  /** Total number of bill types */
  count: number;
  /** Metadata about the response */
  metadata: {
    /** When this data was last updated */
    lastUpdated: string;
    /** Description of the resource */
    description: string;
  };
}

/**
 * Parameters extracted from bill resource URIs
 *
 * URI Format: congress-gov://bill/{congress}/{billType}/{billNumber}
 * Example URI: congress-gov://bill/117/hr/21
 *
 * Field Explanations:
 * - congress: Congressional session number (117=2021-2022, 118=2023-2024, 119=2025-2026, etc.)
 * - billType: Type of legislation (hr, s, hjres, sjres, hconres, sconres, hres, sres)
 * - billNumber: Sequential number within the bill type (typically 1-9999+ depending on session)
 */
export interface BillResourceParams {
  /**
   * Congress session number as string
   * Examples: "117" (117th Congress, 2021-2022), "118" (118th Congress, 2023-2024)
   * Range: Typically 1st Congress (1789) to current Congress
   */
  congress: string;

  /**
   * Bill type identifier - determines the category of legislation
   * Valid values: hr, s, hjres, sjres, hconres, sconres, hres, sres
   * Examples: "hr" for House Bill, "s" for Senate Bill
   */
  billType: string;

  /**
   * Bill number within its type for the given Congress
   * Examples: "1", "21", "3076", "8245"
   * Range: Typically 1 to several thousand per type per Congress
   */
  billNumber: string;
}
