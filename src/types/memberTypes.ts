// Defines parameters extracted from member resource URIs
export interface MemberResourceParams {
  memberId: string; // Member ID (e.g., "L000174")
}

// Parameters for member sub-resources (sponsored/cosponsored legislation)
export interface MemberSubResourceParams {
  bioguideId: string; // BioguideId (e.g., "P000197")
}

// Parameters for members by state
export interface MembersByStateParams {
  stateCode: string; // 2-letter state code (e.g., "CA")
}

// Parameters for members by state and district
export interface MembersByDistrictParams {
  stateCode: string; // 2-letter state code (e.g., "CA")
  district: string; // District number (e.g., "12" or "0" for at-large)
}

// Parameters for members by congress, state, and district
export interface MembersByCongressStateDistrictParams {
  congress: string; // Congress number (e.g., "118")
  stateCode: string; // 2-letter state code (e.g., "CA")
  district: string; // District number (e.g., "12" or "0" for at-large)
}
