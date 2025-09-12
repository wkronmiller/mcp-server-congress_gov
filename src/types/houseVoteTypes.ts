/**
 * Parameters for retrieving House vote details.
 * Based on API endpoint: /house-vote/{congress}/{session}/{voteNumber}
 */
export interface HouseVoteResourceParams {
  congress: string;
  session: string; // Typically "1" or "2"
  voteNumber: string;
}

/**
 * Parameters for retrieving House vote members.
 * Based on API endpoint: /house-vote/{congress}/{session}/{voteNumber}/members
 */
export interface HouseVoteMembersResourceParams
  extends HouseVoteResourceParams {
  // Base params are sufficient for member votes
}

/**
 * House vote detail from the Congress API (Beta).
 */
export interface HouseVoteDetail {
  congress: number;
  session: number;
  voteNumber: number;
  voteDate?: string;
  voteTime?: string;
  question?: string;
  description?: string;
  voteType?: string;
  result?: string;
  totals?: HouseVoteTotals;
  bill?: {
    congress: number;
    type: string;
    number: string;
    title?: string;
    url?: string;
  };
  amendment?: {
    congress: number;
    type: string;
    number: string;
    purpose?: string;
    url?: string;
  };
  members?: HouseVoteMember[];
  updateDate?: string;
  url?: string;
  [key: string]: any;
}

/**
 * House vote totals.
 */
export interface HouseVoteTotals {
  yea?: number;
  nay?: number;
  present?: number;
  notVoting?: number;
  [key: string]: any;
}

/**
 * Individual House member's vote.
 */
export interface HouseVoteMember {
  bioguideId?: string;
  name?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  suffix?: string;
  state?: string;
  district?: string;
  party?: string;
  votePosition?: string; // "Yea", "Nay", "Present", "Not Voting"
  url?: string;
  [key: string]: any;
}
