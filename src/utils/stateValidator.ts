import { InvalidParameterError } from "./errors.js";

// Official 2-letter state codes including territories
export const VALID_STATE_CODES = new Set([
  // US States
  "AL",
  "AK",
  "AZ",
  "AR",
  "CA",
  "CO",
  "CT",
  "DE",
  "FL",
  "GA",
  "HI",
  "ID",
  "IL",
  "IN",
  "IA",
  "KS",
  "KY",
  "LA",
  "ME",
  "MD",
  "MA",
  "MI",
  "MN",
  "MS",
  "MO",
  "MT",
  "NE",
  "NV",
  "NH",
  "NJ",
  "NM",
  "NY",
  "NC",
  "ND",
  "OH",
  "OK",
  "OR",
  "PA",
  "RI",
  "SC",
  "SD",
  "TN",
  "TX",
  "UT",
  "VT",
  "VA",
  "WA",
  "WV",
  "WI",
  "WY",
  // Federal District and Territories
  "DC",
  "PR",
  "VI",
  "GU",
  "AS",
  "MP",
]);

/**
 * Validates a state code against official 2-letter abbreviations
 * @param stateCode - The state code to validate
 * @returns The validated uppercase state code
 * @throws InvalidParameterError if the state code is invalid
 */
export function validateStateCode(stateCode: string): string {
  if (!stateCode || typeof stateCode !== "string") {
    throw new InvalidParameterError(
      "State code is required and must be a string"
    );
  }

  const upperStateCode = stateCode.toUpperCase();

  if (!VALID_STATE_CODES.has(upperStateCode)) {
    throw new InvalidParameterError(
      `Invalid state code: ${stateCode}. Must be a valid 2-letter state or territory code`
    );
  }

  return upperStateCode;
}

/**
 * Validates a district number
 * @param district - The district number to validate
 * @returns The validated district as a string
 * @throws InvalidParameterError if the district is invalid
 */
export function validateDistrict(district: string): string {
  if (!district || typeof district !== "string") {
    throw new InvalidParameterError(
      "District is required and must be a string"
    );
  }

  // Check if it's a valid integer string (no decimals, letters, etc.)
  if (!/^\d+$/.test(district)) {
    throw new InvalidParameterError(
      `Invalid district number: ${district}. Must be an integer between 0 and 53 (0 for at-large)`
    );
  }

  const districtNum = parseInt(district, 10);

  if (districtNum < 0 || districtNum > 53) {
    throw new InvalidParameterError(
      `Invalid district number: ${district}. Must be an integer between 0 and 53 (0 for at-large)`
    );
  }

  return district;
}

/**
 * Validates a BioguideId format
 * @param bioguideId - The BioguideId to validate
 * @returns The validated BioguideId
 * @throws InvalidParameterError if the BioguideId is invalid
 */
export function validateBioguideId(bioguideId: string): string {
  if (!bioguideId || typeof bioguideId !== "string") {
    throw new InvalidParameterError(
      "BioguideId is required and must be a string"
    );
  }

  // BioguideId format: typically uppercase letters + numbers (e.g., "A000370", "P000197")
  const bioguidePattern = /^[A-Z]\d{6}$/;

  if (!bioguidePattern.test(bioguideId)) {
    throw new InvalidParameterError(
      `Invalid BioguideId format: ${bioguideId}. Must be 1 uppercase letter followed by 6 digits (e.g., "A000370")`
    );
  }

  return bioguideId;
}
