import { McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";
import { CongressApiService } from "./services/CongressApiService.js"; // Import class
import {
  ResourceNotFoundError,
  ResourceError,
  NotFoundError,
  ApiError,
  RateLimitError,
  InvalidParameterError,
} from "./utils/errors.js"; // Added InvalidParameterError
import { logger } from "./utils/logger.js";
// Import all needed param types
import {
  BillResourceParams,
  MemberResourceParams,
  CongressResourceParams,
  CommitteeResourceParams,
  AmendmentResourceParams,
  LawResourceParams,
  LawListParams,
  LawCongressParams,
  TreatyResourceParams,
  TreatyPartitionResourceParams,
  TreatySubResourceParams,
  CRSReportResourceParams,
  SummariesResourceParams,
  HouseVoteResourceParams,
  HouseVoteMembersResourceParams,
} from "./types/index.js";

/**
 * Formats successful API data into the MCP ResourceContents structure (array).
 */
function formatSuccessResponse(uri: string, data: any): any[] {
  // Use any[] return type
  return [
    {
      // Return the array directly
      uri: uri,
      mimeType: "application/json",
      text: JSON.stringify(data, null, 2),
    },
  ];
}

/**
 * Handles errors during resource fetching, throwing appropriate McpErrors.
 */
function handleResourceError(uri: string, error: unknown): never {
  // Use structured logging for errors
  logger.error(`Error handling resource`, error, { uri });

  if (
    error instanceof ResourceNotFoundError ||
    error instanceof NotFoundError
  ) {
    // URI parsing error or 404 from API
    throw new McpError(
      ErrorCode.InvalidRequest,
      `Resource not found: ${uri}. Details: ${error.message}`
    );
  } else if (error instanceof RateLimitError) {
    // Rate limit error from API service - use InternalError as planned
    throw new McpError(
      ErrorCode.InternalError,
      `Rate limit exceeded for ${uri}. Details: ${error.message}`
    );
  } else if (error instanceof InvalidParameterError) {
    // Invalid params detected during URI parsing or service call
    throw new McpError(
      ErrorCode.InvalidParams,
      `Invalid parameters for resource ${uri}: ${error.message}`
    );
  } else if (error instanceof ApiError) {
    // Other specific API errors (non-404, non-429)
    throw new McpError(
      ErrorCode.InternalError,
      `API error fetching resource ${uri}: ${error.message}`,
      { statusCode: error.statusCode, details: error.details }
    );
  } else if (error instanceof ResourceError) {
    // Other resource handling errors (e.g., invalid params in URI)
    throw new McpError(
      ErrorCode.InvalidRequest,
      `Invalid resource request for ${uri}: ${error.message}`,
      error.details
    );
  } else if (error instanceof Error) {
    // Unexpected JS errors
    throw new McpError(
      ErrorCode.InternalError,
      `Unexpected error processing resource ${uri}: ${error.message}`,
      error.stack
    );
  } else {
    // Fallback for non-Error throws
    throw new McpError(
      ErrorCode.InternalError,
      `Unknown error processing resource ${uri}`,
      error
    );
  }
}

// --- Resource Handler Implementations (Refactored for RFC-002) ---
// Each handler now accepts the service instance

export async function handleBillResource(
  uri: string,
  congressApiService: CongressApiService
): Promise<any> {
  logger.debug("Handling handleBillResource", { uri });
  // Use more specific regex, ensure case-insensitivity if needed for type
  const match = uri.match(/^congress-gov:\/\/bill\/(\d+)\/([a-z]+)\/(\d+)$/i);
  if (!match)
    throw new ResourceNotFoundError(`Invalid bill resource URI format: ${uri}`);
  const [_, congressStr, billType, billNumberStr] = match;
  // Validate and convert params
  const congress = parseInt(congressStr, 10);
  const billNumber = parseInt(billNumberStr, 10); // Assuming API needs number
  if (isNaN(congress) || isNaN(billNumber)) {
    throw new InvalidParameterError(
      `Invalid numeric identifier in bill URI: ${uri}`
    );
  }
  // Validate bill type - Congress.gov API supports these types
  const validBillTypes = ["hr", "s", "sjres", "hjres", "hconres", "sconres"];
  const normalizedBillType = billType.toLowerCase();
  if (!validBillTypes.includes(normalizedBillType)) {
    throw new InvalidParameterError(
      `Invalid bill type '${billType}'. Must be one of: ${validBillTypes.join(", ")}`
    );
  }

  const params: BillResourceParams = {
    congress: congressStr,
    billType: billType.toLowerCase(),
    billNumber: billNumberStr,
  }; // Keep original strings for params if service expects them
  try {
    // Call specific service method
    const billData = await congressApiService.getBillDetails(params);
    return { contents: formatSuccessResponse(uri, billData) };
  } catch (error) {
    handleResourceError(uri, error);
  }
}

// Helper function to parse and validate bill URI with sub-resource support
function parseBillUri(uri: string): {
  params: BillResourceParams;
  subResource?: string;
} {
  // Match with optional sub-resource: congress-gov://bill/{congress}/{billType}/{billNumber}[/{subResource}]
  const match = uri.match(
    /^congress-gov:\/\/bill\/(\d+)\/([a-z]+)\/(\d+)(?:\/([a-z]+))?$/i
  );
  if (!match) {
    throw new ResourceNotFoundError(`Invalid bill resource URI format: ${uri}`);
  }

  const [_, congressStr, billType, billNumberStr, subResource] = match;

  // Validate numeric parts
  const congress = parseInt(congressStr, 10);
  const billNumber = parseInt(billNumberStr, 10);
  if (isNaN(congress) || isNaN(billNumber)) {
    throw new InvalidParameterError(
      `Invalid numeric identifier in bill URI: ${uri}`
    );
  }

  const params: BillResourceParams = {
    congress: congressStr,
    billType: billType.toLowerCase(),
    billNumber: billNumberStr,
  };

  return { params, subResource };
}

// --- Bill Sub-Resource Handlers ---

export async function handleBillActionsResource(
  uri: string,
  congressApiService: CongressApiService
): Promise<any> {
  logger.debug("Handling handleBillActionsResource", { uri });

  const { params } = parseBillUri(uri);

  try {
    const data = await congressApiService.getBillActions(params);
    return { contents: formatSuccessResponse(uri, data) };
  } catch (error) {
    handleResourceError(uri, error);
  }
}

export async function handleBillAmendmentsResource(
  uri: string,
  congressApiService: CongressApiService
): Promise<any> {
  logger.debug("Handling handleBillAmendmentsResource", { uri });

  const { params } = parseBillUri(uri);

  try {
    const data = await congressApiService.getBillAmendments(params);
    return { contents: formatSuccessResponse(uri, data) };
  } catch (error) {
    handleResourceError(uri, error);
  }
}

export async function handleBillCommitteesResource(
  uri: string,
  congressApiService: CongressApiService
): Promise<any> {
  logger.debug("Handling handleBillCommitteesResource", { uri });

  const { params } = parseBillUri(uri);

  try {
    const data = await congressApiService.getBillCommittees(params);
    return { contents: formatSuccessResponse(uri, data) };
  } catch (error) {
    handleResourceError(uri, error);
  }
}

export async function handleBillCosponsorsResource(
  uri: string,
  congressApiService: CongressApiService
): Promise<any> {
  logger.debug("Handling handleBillCosponsorsResource", { uri });

  const { params } = parseBillUri(uri);

  try {
    const data = await congressApiService.getBillCosponsors(params);
    return { contents: formatSuccessResponse(uri, data) };
  } catch (error) {
    handleResourceError(uri, error);
  }
}

export async function handleBillRelatedBillsResource(
  uri: string,
  congressApiService: CongressApiService
): Promise<any> {
  logger.debug("Handling handleBillRelatedBillsResource", { uri });

  const { params } = parseBillUri(uri);

  try {
    const data = await congressApiService.getBillRelatedBills(params);
    return { contents: formatSuccessResponse(uri, data) };
  } catch (error) {
    handleResourceError(uri, error);
  }
}

export async function handleBillSubjectsResource(
  uri: string,
  congressApiService: CongressApiService
): Promise<any> {
  logger.debug("Handling handleBillSubjectsResource", { uri });

  const { params } = parseBillUri(uri);

  try {
    const data = await congressApiService.getBillSubjects(params);
    return { contents: formatSuccessResponse(uri, data) };
  } catch (error) {
    handleResourceError(uri, error);
  }
}

export async function handleBillSummariesResource(
  uri: string,
  congressApiService: CongressApiService
): Promise<any> {
  logger.debug("Handling handleBillSummariesResource", { uri });

  const { params } = parseBillUri(uri);

  try {
    const data = await congressApiService.getBillSummaries(params);
    return { contents: formatSuccessResponse(uri, data) };
  } catch (error) {
    handleResourceError(uri, error);
  }
}

export async function handleBillTextResource(
  uri: string,
  congressApiService: CongressApiService
): Promise<any> {
  logger.debug("Handling handleBillTextResource", { uri });

  const { params } = parseBillUri(uri);

  try {
    const data = await congressApiService.getBillText(params);
    return { contents: formatSuccessResponse(uri, data) };
  } catch (error) {
    handleResourceError(uri, error);
  }
}

export async function handleBillTitlesResource(
  uri: string,
  congressApiService: CongressApiService
): Promise<any> {
  logger.debug("Handling handleBillTitlesResource", { uri });

  const { params } = parseBillUri(uri);

  try {
    const data = await congressApiService.getBillTitles(params);
    return { contents: formatSuccessResponse(uri, data) };
  } catch (error) {
    handleResourceError(uri, error);
  }
}

export async function handleMemberResource(
  uri: string,
  congressApiService: CongressApiService
): Promise<any> {
  logger.debug("Handling handleMemberResource", { uri });
  const match = uri.match(/^congress-gov:\/\/member\/([A-Z0-9]+)$/i);
  if (!match)
    throw new ResourceNotFoundError(
      `Invalid member resource URI format: ${uri}`
    );
  const [_, memberId] = match;
  const params: MemberResourceParams = { memberId };
  try {
    // Call specific service method
    const memberData = await congressApiService.getMemberDetails(params);
    return { contents: formatSuccessResponse(uri, memberData) };
  } catch (error) {
    handleResourceError(uri, error);
  }
}

export async function handleCongressResource(
  uri: string,
  congressApiService: CongressApiService
): Promise<any> {
  logger.debug("Handling handleCongressResource", { uri });
  const match = uri.match(/^congress-gov:\/\/congress\/(\d+)$/);
  if (!match)
    throw new ResourceNotFoundError(
      `Invalid congress resource URI format: ${uri}`
    );
  const [_, congress] = match;
  const params: CongressResourceParams = { congress };
  try {
    // Call specific service method
    const congressData = await congressApiService.getCongressDetails(params);
    return { contents: formatSuccessResponse(uri, congressData) };
  } catch (error) {
    handleResourceError(uri, error);
  }
}

export async function handleCommitteeResource(
  uri: string,
  congressApiService: CongressApiService
): Promise<any> {
  logger.debug("Handling handleCommitteeResource", { uri });
  // Updated regex to handle optional congress in path (assuming format like /committee/house/hsju00 or /committee/117/house/hsju00)
  // This needs clarification based on actual desired URI structure vs API structure
  // Assuming format: congress-gov://committee/{chamber}/{code}?congress={congress}
  // Let's parse based on that assumption for now.
  const url = new URL(uri);
  const match = url.pathname.match(/^\/committee\/([a-z]+)\/([a-z0-9]+)$/i);
  if (url.protocol !== "congress-gov:" || !match) {
    throw new ResourceNotFoundError(
      `Invalid committee resource URI format: ${uri}`
    );
  }
  const [_, chamber, committeeCode] = match;
  const congress = url.searchParams.get("congress") || undefined; // Get optional congress from query

  const params: CommitteeResourceParams = {
    chamber: chamber.toLowerCase(),
    committeeCode: committeeCode.toLowerCase(),
    congress: congress, // Pass optional congress
  };
  try {
    // Call specific service method
    const committeeData = await congressApiService.getCommitteeDetails(params);
    return { contents: formatSuccessResponse(uri, committeeData) };
  } catch (error) {
    handleResourceError(uri, error);
  }
}

// Helper function to validate amendment types
function validateAmendmentType(amendmentType: string): string {
  const lowerType = amendmentType.toLowerCase();

  // Support both abbreviated forms (hamdt, samdt) and full forms mapping to API format
  const typeMap: Record<string, string> = {
    hamdt: "hamdt",
    samdt: "samdt",
    "house-amendment": "hamdt",
    "senate-amendment": "samdt",
  };

  const mappedType = typeMap[lowerType];
  if (!mappedType) {
    throw new InvalidParameterError(
      `Invalid amendment type: ${amendmentType}. Must be one of: house-amendment, senate-amendment, hamdt, samdt`
    );
  }

  return mappedType;
}

// Helper function to parse and validate amendment URI
function parseAmendmentUri(uri: string): AmendmentResourceParams {
  const match = uri.match(
    /^congress-gov:\/\/amendment\/(\d+)\/([a-z-]+)\/(\d+)(?:\/([a-z]+))?$/i
  );
  if (!match) {
    throw new ResourceNotFoundError(
      `Invalid amendment resource URI format: ${uri}`
    );
  }

  const [_, congressStr, amendmentType, amendmentNumberStr] = match;

  // Validate numeric parts
  const congress = parseInt(congressStr, 10);
  const amendmentNumber = parseInt(amendmentNumberStr, 10);
  if (isNaN(congress) || isNaN(amendmentNumber)) {
    throw new InvalidParameterError(
      `Invalid numeric identifier in amendment URI: ${uri}`
    );
  }

  // Validate and normalize amendment type
  const validatedType = validateAmendmentType(amendmentType);

  return {
    congress: congressStr,
    amendmentType: validatedType,
    amendmentNumber: amendmentNumberStr,
  };
}

export async function handleAmendmentResource(
  uri: string,
  congressApiService: CongressApiService
): Promise<any> {
  logger.debug("Handling handleAmendmentResource", { uri });

  const params = parseAmendmentUri(uri);

  try {
    const data = await congressApiService.getAmendmentDetails(params);
    return { contents: formatSuccessResponse(uri, data) };
  } catch (error) {
    handleResourceError(uri, error);
  }
}

export async function handleAmendmentActionsResource(
  uri: string,
  congressApiService: CongressApiService
): Promise<any> {
  logger.debug("Handling handleAmendmentActionsResource", { uri });

  // Parse the base amendment URI (removing the /actions part)
  const baseUri = uri.replace(/\/actions$/, "");
  const params = parseAmendmentUri(baseUri);

  try {
    const data = await congressApiService.getAmendmentActions(params);
    return { contents: formatSuccessResponse(uri, data) };
  } catch (error) {
    handleResourceError(uri, error);
  }
}

export async function handleAmendmentCosponsorsResource(
  uri: string,
  congressApiService: CongressApiService
): Promise<any> {
  logger.debug("Handling handleAmendmentCosponsorsResource", { uri });

  const baseUri = uri.replace(/\/cosponsors$/, "");
  const params = parseAmendmentUri(baseUri);

  try {
    const data = await congressApiService.getAmendmentCosponsors(params);
    return { contents: formatSuccessResponse(uri, data) };
  } catch (error) {
    handleResourceError(uri, error);
  }
}

export async function handleAmendmentAmendmentsResource(
  uri: string,
  congressApiService: CongressApiService
): Promise<any> {
  logger.debug("Handling handleAmendmentAmendmentsResource", { uri });

  const baseUri = uri.replace(/\/amendments$/, "");
  const params = parseAmendmentUri(baseUri);

  try {
    const data = await congressApiService.getAmendmentAmendments(params);
    return { contents: formatSuccessResponse(uri, data) };
  } catch (error) {
    handleResourceError(uri, error);
  }
}

export async function handleAmendmentTextResource(
  uri: string,
  congressApiService: CongressApiService
): Promise<any> {
  logger.debug("Handling handleAmendmentTextResource", { uri });

  const baseUri = uri.replace(/\/text$/, "");
  const params = parseAmendmentUri(baseUri);

  try {
    const data = await congressApiService.getAmendmentText(params);
    return { contents: formatSuccessResponse(uri, data) };
  } catch (error) {
    handleResourceError(uri, error);
  }
}

// --- Static Info Handlers (No service call needed) ---
export async function handleInfoOverviewResource(uri: string): Promise<any> {
  // Pass URI for consistency
  logger.debug("Handling handleInfoOverviewResource", { uri });
  try {
    // This data could potentially be fetched or configured, but static is fine for now
    const overviewData = {
      message: "Congress.gov API provides access to legislative data.",
      version: "v3",
      documentation: "https://api.congress.gov/",
    };
    return { contents: formatSuccessResponse(uri, overviewData) };
  } catch (error) {
    handleResourceError(uri, error);
  }
}

export async function handleInfoCurrentCongressResource(
  uri: string
): Promise<any> {
  // Pass URI
  logger.debug("Handling handleInfoCurrentCongressResource", { uri });
  try {
    // This could also be fetched dynamically if needed
    const currentCongressData = {
      number: 118,
      startDate: "2023-01-03",
      endDate: "2025-01-03",
    }; // Example, update as needed
    return { contents: formatSuccessResponse(uri, currentCongressData) };
  } catch (error) {
    handleResourceError(uri, error);
  }
}

// Helper function to validate law types
function validateLawType(lawType: string): string {
  const lowerType = lawType.toLowerCase();

  // Support both full and abbreviated forms
  const typeMap: Record<string, string> = {
    public: "public",
    private: "private",
    pub: "public",
    priv: "private",
  };

  const mappedType = typeMap[lowerType];
  if (!mappedType) {
    throw new InvalidParameterError(
      `Invalid law type: ${lawType}. Must be one of: public, private`
    );
  }

  return mappedType;
}

// Helper function to parse and validate law URI patterns
function parseLawUri(uri: string): {
  congress: string;
  lawType?: string;
  lawNumber?: string;
} {
  // Try specific law first: congress-gov://law/{congress}/{lawType}/{lawNumber}
  let match = uri.match(/^congress-gov:\/\/law\/(\d+)\/([a-z]+)\/(\d+)$/i);
  if (match) {
    const [_, congressStr, lawType, lawNumberStr] = match;

    // Validate numeric parts
    const congress = parseInt(congressStr, 10);
    const lawNumber = parseInt(lawNumberStr, 10);
    if (isNaN(congress) || isNaN(lawNumber)) {
      throw new InvalidParameterError(
        `Invalid numeric identifier in law URI: ${uri}`
      );
    }

    // Validate and normalize law type
    const validatedType = validateLawType(lawType);

    return {
      congress: congressStr,
      lawType: validatedType,
      lawNumber: lawNumberStr,
    };
  }

  // Try congress and type: congress-gov://law/{congress}/{lawType}
  match = uri.match(/^congress-gov:\/\/law\/(\d+)\/([a-z]+)$/i);
  if (match) {
    const [_, congressStr, lawType] = match;

    // Validate numeric parts
    const congress = parseInt(congressStr, 10);
    if (isNaN(congress)) {
      throw new InvalidParameterError(
        `Invalid numeric identifier in law URI: ${uri}`
      );
    }

    // Validate and normalize law type
    const validatedType = validateLawType(lawType);

    return {
      congress: congressStr,
      lawType: validatedType,
    };
  }

  // Try congress only: congress-gov://law/{congress}
  match = uri.match(/^congress-gov:\/\/law\/(\d+)$/i);
  if (match) {
    const [_, congressStr] = match;

    // Validate numeric parts
    const congress = parseInt(congressStr, 10);
    if (isNaN(congress)) {
      throw new InvalidParameterError(
        `Invalid numeric identifier in law URI: ${uri}`
      );
    }

    return {
      congress: congressStr,
    };
  }

  throw new ResourceNotFoundError(`Invalid law resource URI format: ${uri}`);
}

export async function handleLawResource(
  uri: string,
  congressApiService: CongressApiService
): Promise<any> {
  logger.debug("Handling handleLawResource", { uri });

  const parsed = parseLawUri(uri);

  try {
    let data: any;

    if (parsed.lawType && parsed.lawNumber) {
      // Specific law: /law/{congress}/{lawType}/{lawNumber}
      const params: LawResourceParams = {
        congress: parsed.congress,
        lawType: parsed.lawType,
        lawNumber: parsed.lawNumber,
      };
      data = await congressApiService.getLawDetails(params);
    } else if (parsed.lawType) {
      // Laws by congress and type: /law/{congress}/{lawType}
      const params: LawListParams = {
        congress: parsed.congress,
        lawType: parsed.lawType,
      };
      data = await congressApiService.getLawsByCongressAndType(params);
    } else {
      // Laws by congress: /law/{congress}
      const params: LawCongressParams = {
        congress: parsed.congress,
      };
      data = await congressApiService.getLawsByCongress(params);
    }

    return { contents: formatSuccessResponse(uri, data) };
  } catch (error) {
    handleResourceError(uri, error);
  }
}

// --- Treaty Resource Handlers ---

/**
 * Helper function to validate treaty numbers (typically numeric).
 */
function validateTreatyNumber(treatyNumber: string): string {
  const num = parseInt(treatyNumber, 10);
  if (isNaN(num) || num <= 0) {
    throw new InvalidParameterError(
      `Invalid treaty number: ${treatyNumber}. Must be a positive integer`
    );
  }
  return treatyNumber;
}

/**
 * Helper function to validate treaty suffix (typically single letter).
 */
function validateTreatySuffix(treatySuffix: string): string {
  if (!treatySuffix || !/^[A-Z]$/i.test(treatySuffix)) {
    throw new InvalidParameterError(
      `Invalid treaty suffix: ${treatySuffix}. Must be a single letter`
    );
  }
  return treatySuffix.toUpperCase();
}

/**
 * Parse and validate treaty URI patterns.
 */
function parseTreatyUri(uri: string): {
  params: TreatyResourceParams;
  treatySuffix?: string;
  subResource?: string;
} {
  // Try partitioned treaty first: congress-gov://treaty/{congress}/{treatyNumber}/{treatySuffix}
  let match = uri.match(/^congress-gov:\/\/treaty\/(\d+)\/(\d+)\/([A-Z])$/i);
  if (match) {
    const [_, congressStr, treatyNumberStr, treatySuffix] = match;

    // Validate numeric parts
    const congress = parseInt(congressStr, 10);
    const treatyNumber = parseInt(treatyNumberStr, 10);
    if (isNaN(congress) || isNaN(treatyNumber)) {
      throw new InvalidParameterError(
        `Invalid numeric identifier in treaty URI: ${uri}`
      );
    }

    const validatedTreatySuffix = validateTreatySuffix(treatySuffix);
    const validatedTreatyNumber = validateTreatyNumber(treatyNumberStr);

    return {
      params: {
        congress: congressStr,
        treatyNumber: validatedTreatyNumber,
      },
      treatySuffix: validatedTreatySuffix,
    };
  }

  // Try with sub-resource: congress-gov://treaty/{congress}/{treatyNumber}/{subResource}
  match = uri.match(
    /^congress-gov:\/\/treaty\/(\d+)\/(\d+)\/(actions|committees)$/i
  );
  if (match) {
    const [_, congressStr, treatyNumberStr, subResource] = match;

    // Validate numeric parts
    const congress = parseInt(congressStr, 10);
    const treatyNumber = parseInt(treatyNumberStr, 10);
    if (isNaN(congress) || isNaN(treatyNumber)) {
      throw new InvalidParameterError(
        `Invalid numeric identifier in treaty URI: ${uri}`
      );
    }

    const validatedTreatyNumber = validateTreatyNumber(treatyNumberStr);

    return {
      params: {
        congress: congressStr,
        treatyNumber: validatedTreatyNumber,
      },
      subResource: subResource.toLowerCase(),
    };
  }

  // Try basic treaty: congress-gov://treaty/{congress}/{treatyNumber}
  match = uri.match(/^congress-gov:\/\/treaty\/(\d+)\/(\d+)$/i);
  if (match) {
    const [_, congressStr, treatyNumberStr] = match;

    // Validate numeric parts
    const congress = parseInt(congressStr, 10);
    const treatyNumber = parseInt(treatyNumberStr, 10);
    if (isNaN(congress) || isNaN(treatyNumber)) {
      throw new InvalidParameterError(
        `Invalid numeric identifier in treaty URI: ${uri}`
      );
    }

    const validatedTreatyNumber = validateTreatyNumber(treatyNumberStr);

    return {
      params: {
        congress: congressStr,
        treatyNumber: validatedTreatyNumber,
      },
    };
  }

  throw new ResourceNotFoundError(`Invalid treaty resource URI format: ${uri}`);
}

/**
 * Handle main treaty resource requests.
 */
export async function handleTreatyResource(
  uri: string,
  congressApiService: CongressApiService
): Promise<any> {
  logger.debug("Handling handleTreatyResource", { uri });

  const { params, treatySuffix } = parseTreatyUri(uri);

  try {
    let data: any;
    if (treatySuffix) {
      // Partitioned treaty
      const partitionParams: TreatyPartitionResourceParams = {
        ...params,
        treatySuffix,
      };
      data =
        await congressApiService.getTreatyPartitionDetails(partitionParams);
    } else {
      // Main treaty
      data = await congressApiService.getTreatyDetails(params);
    }
    return { contents: formatSuccessResponse(uri, data) };
  } catch (error) {
    handleResourceError(uri, error);
  }
}

/**
 * Handle treaty actions resource requests.
 */
export async function handleTreatyActionsResource(
  uri: string,
  congressApiService: CongressApiService
): Promise<any> {
  logger.debug("Handling handleTreatyActionsResource", { uri });

  const { params } = parseTreatyUri(uri);

  try {
    const data = await congressApiService.getTreatyActions(params);
    return { contents: formatSuccessResponse(uri, data) };
  } catch (error) {
    handleResourceError(uri, error);
  }
}

/**
 * Handle treaty committees resource requests.
 */
export async function handleTreatyCommitteesResource(
  uri: string,
  congressApiService: CongressApiService
): Promise<any> {
  logger.debug("Handling handleTreatyCommitteesResource", { uri });

  const { params } = parseTreatyUri(uri);

  try {
    const data = await congressApiService.getTreatyCommittees(params);
    return { contents: formatSuccessResponse(uri, data) };
  } catch (error) {
    handleResourceError(uri, error);
  }
}

// --- CRS Report Resource Handlers ---

/**
 * Helper function to validate CRS report numbers.
 */
function validateCRSReportNumber(reportNumber: string): string {
  // CRS report numbers typically follow patterns like "R12345", "RL12345", "RS12345"
  if (!reportNumber || !/^[A-Z]{1,2}\d{4,5}$/i.test(reportNumber)) {
    throw new InvalidParameterError(
      `Invalid CRS report number: ${reportNumber}. Must follow pattern like R12345, RL12345, RS12345`
    );
  }
  return reportNumber.toUpperCase();
}

/**
 * Parse and validate CRS report URI.
 */
function parseCRSReportUri(uri: string): CRSReportResourceParams {
  const match = uri.match(/^congress-gov:\/\/crsreport\/([A-Z]{1,2}\d{4,5})$/i);
  if (!match) {
    throw new ResourceNotFoundError(
      `Invalid CRS report resource URI format: ${uri}`
    );
  }

  const [_, reportNumber] = match;
  const validatedReportNumber = validateCRSReportNumber(reportNumber);

  return { reportNumber: validatedReportNumber };
}

/**
 * Handle CRS report resource requests.
 */
export async function handleCRSReportResource(
  uri: string,
  congressApiService: CongressApiService
): Promise<any> {
  logger.debug("Handling handleCRSReportResource", { uri });

  const params = parseCRSReportUri(uri);

  try {
    const data = await congressApiService.getCRSReportDetails(params);
    return { contents: formatSuccessResponse(uri, data) };
  } catch (error) {
    handleResourceError(uri, error);
  }
}

// --- Summaries Resource Handlers ---

/**
 * Helper function to validate bill types for summaries.
 */
function validateBillTypeForSummaries(billType: string): string {
  const lowerType = billType.toLowerCase();
  const validTypes = [
    "hr",
    "s",
    "hjres",
    "sjres",
    "hconres",
    "sconres",
    "hres",
    "sres",
  ];

  if (!validTypes.includes(lowerType)) {
    throw new InvalidParameterError(
      `Invalid bill type: ${billType}. Must be one of: ${validTypes.join(", ")}`
    );
  }

  return lowerType;
}

/**
 * Parse and validate summaries URI.
 */
function parseSummariesUri(uri: string): SummariesResourceParams {
  const match = uri.match(/^congress-gov:\/\/summaries\/(\d+)\/([a-z]+)$/i);
  if (!match) {
    throw new ResourceNotFoundError(
      `Invalid summaries resource URI format: ${uri}`
    );
  }

  const [_, congressStr, billType] = match;

  // Validate congress number
  const congress = parseInt(congressStr, 10);
  if (isNaN(congress) || congress < 93 || congress > 118) {
    throw new InvalidParameterError(
      `Invalid congress number: ${congress}. Must be between 93 and 118`
    );
  }

  const validatedBillType = validateBillTypeForSummaries(billType);

  return {
    congress: congressStr,
    billType: validatedBillType,
  };
}

/**
 * Handle summaries resource requests.
 */
export async function handleSummariesResource(
  uri: string,
  congressApiService: CongressApiService
): Promise<any> {
  logger.debug("Handling handleSummariesResource", { uri });

  const params = parseSummariesUri(uri);

  try {
    const data = await congressApiService.getSummaries(params);
    return { contents: formatSuccessResponse(uri, data) };
  } catch (error) {
    handleResourceError(uri, error);
  }
}

// --- House Vote Resource Handlers (Beta) ---

/**
 * Helper function to validate House vote sessions.
 */
function validateSession(session: string): string {
  const sessionNum = parseInt(session, 10);
  if (isNaN(sessionNum) || (sessionNum !== 1 && sessionNum !== 2)) {
    throw new InvalidParameterError(
      `Invalid session: ${session}. Must be 1 or 2`
    );
  }
  return session;
}

/**
 * Helper function to validate House vote numbers.
 */
function validateVoteNumber(voteNumber: string): string {
  const num = parseInt(voteNumber, 10);
  if (isNaN(num) || num <= 0) {
    throw new InvalidParameterError(
      `Invalid vote number: ${voteNumber}. Must be a positive integer`
    );
  }
  return voteNumber;
}

/**
 * Parse and validate House vote URI.
 */
function parseHouseVoteUri(uri: string): {
  params: HouseVoteResourceParams;
  subResource?: string;
} {
  // Try with sub-resource: congress-gov://house-vote/{congress}/{session}/{voteNumber}/{subResource}
  let match = uri.match(
    /^congress-gov:\/\/house-vote\/(\d+)\/(\d+)\/(\d+)\/(members)$/i
  );
  if (match) {
    const [_, congressStr, sessionStr, voteNumberStr, subResource] = match;

    // Validate numeric parts
    const congress = parseInt(congressStr, 10);
    if (isNaN(congress) || congress < 93 || congress > 118) {
      throw new InvalidParameterError(
        `Invalid congress number: ${congress}. Must be between 93 and 118`
      );
    }

    const validatedSession = validateSession(sessionStr);
    const validatedVoteNumber = validateVoteNumber(voteNumberStr);

    return {
      params: {
        congress: congressStr,
        session: validatedSession,
        voteNumber: validatedVoteNumber,
      },
      subResource: subResource.toLowerCase(),
    };
  }

  // Try basic House vote: congress-gov://house-vote/{congress}/{session}/{voteNumber}
  match = uri.match(/^congress-gov:\/\/house-vote\/(\d+)\/(\d+)\/(\d+)$/i);
  if (match) {
    const [_, congressStr, sessionStr, voteNumberStr] = match;

    // Validate numeric parts
    const congress = parseInt(congressStr, 10);
    if (isNaN(congress) || congress < 93 || congress > 118) {
      throw new InvalidParameterError(
        `Invalid congress number: ${congress}. Must be between 93 and 118`
      );
    }

    const validatedSession = validateSession(sessionStr);
    const validatedVoteNumber = validateVoteNumber(voteNumberStr);

    return {
      params: {
        congress: congressStr,
        session: validatedSession,
        voteNumber: validatedVoteNumber,
      },
    };
  }

  throw new ResourceNotFoundError(
    `Invalid House vote resource URI format: ${uri}`
  );
}

/**
 * Handle House vote resource requests (Beta).
 */
export async function handleHouseVoteResource(
  uri: string,
  congressApiService: CongressApiService
): Promise<any> {
  logger.debug("Handling handleHouseVoteResource", { uri });

  const { params } = parseHouseVoteUri(uri);

  try {
    const data = await congressApiService.getHouseVoteDetails(params);
    return { contents: formatSuccessResponse(uri, data) };
  } catch (error) {
    handleResourceError(uri, error);
  }
}

/**
 * Handle House vote members resource requests (Beta).
 */
export async function handleHouseVoteMembersResource(
  uri: string,
  congressApiService: CongressApiService
): Promise<any> {
  logger.debug("Handling handleHouseVoteMembersResource", { uri });

  const { params } = parseHouseVoteUri(uri);

  try {
    const data = await congressApiService.getHouseVoteMembers(params);
    return { contents: formatSuccessResponse(uri, data) };
  } catch (error) {
    handleResourceError(uri, error);
  }
}

// ========== MEMBER SUBRESOURCE HANDLERS ==========

// Helper function to parse and validate member URI with sub-resource support
function parseMemberUri(uri: string): {
  bioguideId: string;
  subResource: string;
} {
  // Match: congress-gov://member/{bioguideId}/{subResource}
  const match = uri.match(/^congress-gov:\/\/member\/([A-Z0-9]+)\/([a-z-]+)$/i);
  if (!match) {
    throw new ResourceNotFoundError(
      `Invalid member resource URI format: ${uri}`
    );
  }

  const [_, bioguideId, subResource] = match;

  // Validate bioguide ID format (should be like "A000001" - letter + 6 digits)
  if (!/^[A-Z][0-9]{6}$/i.test(bioguideId)) {
    throw new InvalidParameterError(
      `Invalid bioguide ID format '${bioguideId}'. Expected format: letter followed by 6 digits (e.g., A000001).`
    );
  }

  return {
    bioguideId: bioguideId.toUpperCase(),
    subResource: subResource.toLowerCase(),
  };
}

/**
 * Handle member sponsored legislation resource requests.
 */
export async function handleMemberSponsoredLegislationResource(
  uri: string,
  congressApiService: CongressApiService
): Promise<any> {
  logger.debug("Handling handleMemberSponsoredLegislationResource", { uri });

  // Parse and validate the member URI
  const { bioguideId, subResource } = parseMemberUri(uri);

  // Validate that this is a sponsored-legislation resource
  if (subResource !== "sponsored-legislation") {
    throw new ResourceNotFoundError(
      `Expected 'sponsored-legislation' sub-resource, got '${subResource}' in URI: ${uri}`
    );
  }

  try {
    const data = await congressApiService.getMemberSponsoredLegislation({
      bioguideId: bioguideId,
    });
    return { contents: formatSuccessResponse(uri, data) };
  } catch (error) {
    handleResourceError(uri, error);
  }
}

/**
 * Handle member cosponsored legislation resource requests.
 */
export async function handleMemberCosponsoredLegislationResource(
  uri: string,
  congressApiService: CongressApiService
): Promise<any> {
  logger.debug("Handling handleMemberCosponsoredLegislationResource", { uri });

  // Parse and validate the member URI
  const { bioguideId, subResource } = parseMemberUri(uri);

  // Validate that this is a cosponsored-legislation resource
  if (subResource !== "cosponsored-legislation") {
    throw new ResourceNotFoundError(
      `Expected 'cosponsored-legislation' sub-resource, got '${subResource}' in URI: ${uri}`
    );
  }

  try {
    const data = await congressApiService.getMemberCosponsoredLegislation({
      bioguideId: bioguideId,
    });
    return { contents: formatSuccessResponse(uri, data) };
  } catch (error) {
    handleResourceError(uri, error);
  }
}

/**
 * Handle members by state resource requests.
 */
export async function handleMembersByStateResource(
  uri: string,
  congressApiService: CongressApiService
): Promise<any> {
  logger.debug("Handling handleMembersByStateResource", { uri });

  // Parse stateCode from URI: congress-gov://member/state/{stateCode}
  const match = uri.match(/^congress-gov:\/\/member\/state\/([A-Z]{2})$/i);
  if (!match) {
    throw new ResourceNotFoundError(
      `Invalid members by state resource URI format: ${uri}`
    );
  }

  const stateCode = match[1].toUpperCase();

  // Valid US state and territory codes
  const validStateCodes = [
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
    "AS",
    "GU",
    "MP",
    "PR",
    "VI",
    "DC", // territories and DC
  ];

  if (!validStateCodes.includes(stateCode)) {
    throw new InvalidParameterError(
      `Invalid state code '${stateCode}'. Must be a valid US state or territory code.`
    );
  }

  try {
    const data = await congressApiService.getMembersByState({
      stateCode: stateCode,
    });
    return { contents: formatSuccessResponse(uri, data) };
  } catch (error) {
    handleResourceError(uri, error);
  }
}

/**
 * Handle members by district resource requests.
 */
export async function handleMembersByDistrictResource(
  uri: string,
  congressApiService: CongressApiService
): Promise<any> {
  logger.debug("Handling handleMembersByDistrictResource", { uri });

  // Parse from URI: congress-gov://member/state/{stateCode}/district/{district}
  const match = uri.match(
    /^congress-gov:\/\/member\/state\/([A-Z]{2})\/district\/(\d+)$/i
  );
  if (!match) {
    throw new ResourceNotFoundError(
      `Invalid members by district resource URI format: ${uri}`
    );
  }

  const stateCode = match[1].toUpperCase();
  const districtStr = match[2];
  const district = parseInt(districtStr, 10);

  // Basic validation - district should be between 0 and 60 (no state has more than 60 districts)
  if (isNaN(district) || district < 0 || district > 60) {
    throw new InvalidParameterError(
      `Invalid district number '${districtStr}'. Must be between 0 and 60.`
    );
  }

  try {
    const data = await congressApiService.getMembersByDistrict({
      stateCode: stateCode,
      district: district.toString(),
    });
    return { contents: formatSuccessResponse(uri, data) };
  } catch (error) {
    handleResourceError(uri, error);
  }
}

/**
 * Handle members by congress/state/district resource requests.
 */
export async function handleMembersByCongressStateDistrictResource(
  uri: string,
  congressApiService: CongressApiService
): Promise<any> {
  logger.debug("Handling handleMembersByCongressStateDistrictResource", {
    uri,
  });

  // Parse from URI: congress-gov://member/congress/{congress}/state/{stateCode}/district/{district}
  // First check if it has the right structure but potentially invalid congress
  const structureMatch = uri.match(
    /^congress-gov:\/\/member\/congress\/([^\/]+)\/state\/([A-Z]{2})\/district\/(\d+)$/i
  );
  if (!structureMatch) {
    throw new ResourceNotFoundError(
      `Invalid members by congress/state/district resource URI format: ${uri}`
    );
  }

  const congressStr = structureMatch[1];
  const stateCode = structureMatch[2];
  const district = structureMatch[3];

  // Validate congress number
  const congress = parseInt(congressStr, 10);
  if (isNaN(congress) || congress < 1 || congress > 200) {
    throw new InvalidParameterError(
      `Invalid congress number '${congressStr}'. Must be a valid congress number (1-200).`
    );
  }

  try {
    const data = await congressApiService.getMembersByCongressStateDistrict({
      congress: congress.toString(),
      stateCode: stateCode,
      district: district.toString(),
    });
    return { contents: formatSuccessResponse(uri, data) };
  } catch (error) {
    handleResourceError(uri, error);
  }
}

// ========== COMMITTEE SUBRESOURCE HANDLERS ==========

// Helper function to parse and validate committee URI with sub-resource support
function parseCommitteeUri(uri: string): {
  chamber: string;
  committeeCode: string;
  subResource: string;
} {
  // Match: congress-gov://committee/{chamber}/{committeeCode}/{subResource}
  // Also parse query parameters for congress if present
  const match = uri.match(
    /^congress-gov:\/\/committee\/([a-z]+)\/([a-z0-9]+)\/([a-z-]+)(?:\?.*)?$/i
  );
  if (!match) {
    throw new ResourceNotFoundError(
      `Invalid committee resource URI format: ${uri}`
    );
  }

  const [_, chamber, committeeCode, subResource] = match;

  // Validate chamber
  if (!["house", "senate"].includes(chamber.toLowerCase())) {
    throw new InvalidParameterError(
      `Invalid chamber '${chamber}'. Must be 'house' or 'senate'.`
    );
  }

  // Validate committee code format (basic validation)
  if (!/^[a-z]{2,4}[0-9]{2}$/i.test(committeeCode)) {
    throw new InvalidParameterError(
      `Invalid committee code format '${committeeCode}'.`
    );
  }

  return {
    chamber: chamber.toLowerCase(),
    committeeCode: committeeCode.toLowerCase(),
    subResource: subResource.toLowerCase(),
  };
}

/**
 * Handle committee bills resource requests.
 */
export async function handleCommitteeBillsResource(
  uri: string,
  congressApiService: CongressApiService
): Promise<any> {
  logger.debug("Handling handleCommitteeBillsResource", { uri });

  // Parse and validate the committee URI
  const { chamber, committeeCode, subResource } = parseCommitteeUri(uri);

  // Validate that this is a bills resource
  if (subResource !== "bills") {
    throw new ResourceNotFoundError(
      `Expected 'bills' sub-resource, got '${subResource}' in URI: ${uri}`
    );
  }

  try {
    const data = await congressApiService.getCommitteeBills({
      chamber: chamber,
      committeeCode: committeeCode,
    });
    return { contents: formatSuccessResponse(uri, data) };
  } catch (error) {
    handleResourceError(uri, error);
  }
}

/**
 * Handle committee reports resource requests.
 */
export async function handleCommitteeReportsResource(
  uri: string,
  congressApiService: CongressApiService
): Promise<any> {
  logger.debug("Handling handleCommitteeReportsResource", { uri });

  // Parse and validate the committee URI
  const { chamber, committeeCode, subResource } = parseCommitteeUri(uri);

  // Validate that this is a reports resource
  if (subResource !== "reports") {
    throw new ResourceNotFoundError(
      `Expected 'reports' sub-resource, got '${subResource}' in URI: ${uri}`
    );
  }

  try {
    const data = await congressApiService.getCommitteeReports({
      chamber: chamber,
      committeeCode: committeeCode,
    });
    return { contents: formatSuccessResponse(uri, data) };
  } catch (error) {
    handleResourceError(uri, error);
  }
}

/**
 * Handle committee nominations resource requests.
 */
export async function handleCommitteeNominationsResource(
  uri: string,
  congressApiService: CongressApiService
): Promise<any> {
  logger.debug("Handling handleCommitteeNominationsResource", { uri });

  // Parse and validate the committee URI
  const { chamber, committeeCode, subResource } = parseCommitteeUri(uri);

  // Validate that this is a nominations resource
  if (subResource !== "nominations") {
    throw new ResourceNotFoundError(
      `Expected 'nominations' sub-resource, got '${subResource}' in URI: ${uri}`
    );
  }

  try {
    const data = await congressApiService.getCommitteeNominations({
      chamber: chamber,
      committeeCode: committeeCode,
    });
    return { contents: formatSuccessResponse(uri, data) };
  } catch (error) {
    handleResourceError(uri, error);
  }
}

/**
 * Handle committee house communications resource requests.
 */
export async function handleCommitteeHouseCommunicationsResource(
  uri: string,
  congressApiService: CongressApiService
): Promise<any> {
  logger.debug("Handling handleCommitteeHouseCommunicationsResource", { uri });

  // Parse and validate the committee URI
  const { chamber, committeeCode, subResource } = parseCommitteeUri(uri);

  // Validate that this is a house-communication resource
  if (subResource !== "house-communication") {
    throw new ResourceNotFoundError(
      `Expected 'house-communication' sub-resource, got '${subResource}' in URI: ${uri}`
    );
  }

  try {
    const data = await congressApiService.getCommitteeHouseCommunications({
      chamber: chamber,
      committeeCode: committeeCode,
    });
    return { contents: formatSuccessResponse(uri, data) };
  } catch (error) {
    handleResourceError(uri, error);
  }
}

/**
 * Handle committee senate communications resource requests.
 */
export async function handleCommitteeSenateCommunicationsResource(
  uri: string,
  congressApiService: CongressApiService
): Promise<any> {
  logger.debug("Handling handleCommitteeSenateCommunicationsResource", { uri });

  // Parse and validate the committee URI
  const { chamber, committeeCode, subResource } = parseCommitteeUri(uri);

  // Validate that this is a senate-communication resource
  if (subResource !== "senate-communication") {
    throw new ResourceNotFoundError(
      `Expected 'senate-communication' sub-resource, got '${subResource}' in URI: ${uri}`
    );
  }

  try {
    const data = await congressApiService.getCommitteeSenateCommunications({
      chamber: chamber,
      committeeCode: committeeCode,
    });
    return { contents: formatSuccessResponse(uri, data) };
  } catch (error) {
    handleResourceError(uri, error);
  }
}

// ========== COMMITTEE DOCUMENT HANDLERS ==========

/**
 * Handle committee report resource requests.
 */
export async function handleCommitteeReportResource(
  uri: string,
  congressApiService: CongressApiService
): Promise<any> {
  logger.debug("Handling handleCommitteeReportResource", { uri });

  // Parse from URI: congress-gov://committee-report/{congress}/{reportType}/{reportNumber}
  const match = uri.match(
    /^congress-gov:\/\/committee-report\/(\d+)\/([a-z]+)\/(\d+)$/i
  );
  if (!match) {
    throw new ResourceNotFoundError(
      `Invalid committee report resource URI format: ${uri}`
    );
  }

  const congress = match[1];
  const reportType = match[2];
  const reportNumber = match[3];

  try {
    const data = await congressApiService.getCommitteeReportDetails({
      congress: congress,
      reportType: reportType,
      reportNumber: reportNumber,
    });
    return { contents: formatSuccessResponse(uri, data) };
  } catch (error) {
    handleResourceError(uri, error);
  }
}

/**
 * Handle committee print resource requests.
 */
export async function handleCommitteePrintResource(
  uri: string,
  congressApiService: CongressApiService
): Promise<any> {
  logger.debug("Handling handleCommitteePrintResource", { uri });

  // Parse from URI: congress-gov://committee-print/{congress}/{chamber}/{jacketNumber}
  const match = uri.match(
    /^congress-gov:\/\/committee-print\/(\d+)\/([a-z]+)\/(.+)$/i
  );
  if (!match) {
    throw new ResourceNotFoundError(
      `Invalid committee print resource URI format: ${uri}`
    );
  }

  const congress = match[1];
  const chamber = match[2];
  const jacketNumber = match[3];

  try {
    const data = await congressApiService.getCommitteePrintDetails({
      congress: congress,
      chamber: chamber,
      jacketNumber: jacketNumber,
    });
    return { contents: formatSuccessResponse(uri, data) };
  } catch (error) {
    handleResourceError(uri, error);
  }
}

/**
 * Handle committee meeting resource requests.
 */
export async function handleCommitteeMeetingResource(
  uri: string,
  congressApiService: CongressApiService
): Promise<any> {
  logger.debug("Handling handleCommitteeMeetingResource", { uri });

  // Parse from URI: congress-gov://committee-meeting/{congress}/{chamber}/{eventId}
  const match = uri.match(
    /^congress-gov:\/\/committee-meeting\/(\d+)\/([a-z]+)\/(.+)$/i
  );
  if (!match) {
    throw new ResourceNotFoundError(
      `Invalid committee meeting resource URI format: ${uri}`
    );
  }

  const congress = match[1];
  const chamber = match[2];
  const eventId = match[3];

  try {
    const data = await congressApiService.getCommitteeMeetingDetails({
      congress: congress,
      chamber: chamber,
      eventId: eventId,
    });
    return { contents: formatSuccessResponse(uri, data) };
  } catch (error) {
    handleResourceError(uri, error);
  }
}

/**
 * Handle committee hearing resource requests.
 */
export async function handleCommitteeHearingResource(
  uri: string,
  congressApiService: CongressApiService
): Promise<any> {
  logger.debug("Handling handleCommitteeHearingResource", { uri });

  // Parse from URI: congress-gov://hearing/{congress}/{chamber}/{jacketNumber}
  const match = uri.match(/^congress-gov:\/\/hearing\/(\d+)\/([a-z]+)\/(.+)$/i);
  if (!match) {
    throw new ResourceNotFoundError(
      `Invalid committee hearing resource URI format: ${uri}`
    );
  }

  const congress = match[1];
  const chamber = match[2];
  const jacketNumber = match[3];

  try {
    const data = await congressApiService.getCommitteeHearingDetails({
      congress: congress,
      chamber: chamber,
      jacketNumber: jacketNumber,
    });
    return { contents: formatSuccessResponse(uri, data) };
  } catch (error) {
    handleResourceError(uri, error);
  }
}

// ========== NOMINATION HANDLERS ==========

/**
 * Handle nomination resource requests.
 */
export async function handleNominationResource(
  uri: string,
  congressApiService: CongressApiService
): Promise<any> {
  logger.debug("Handling handleNominationResource", { uri });

  // Parse from URI: congress-gov://nomination/{congress}/{nominationNumber}
  const match = uri.match(/^congress-gov:\/\/nomination\/(\d+)\/(\d+)$/i);
  if (!match) {
    throw new ResourceNotFoundError(
      `Invalid nomination resource URI format: ${uri}`
    );
  }

  const congressStr = match[1];
  const nominationNumberStr = match[2];

  // Validate congress number (93-118)
  const congress = parseInt(congressStr, 10);
  if (isNaN(congress) || congress < 93 || congress > 118) {
    throw new InvalidParameterError(
      `Invalid congress number '${congressStr}'. Must be between 93 and 118.`
    );
  }

  // Validate nomination number
  const nominationNumber = parseInt(nominationNumberStr, 10);
  if (isNaN(nominationNumber) || nominationNumber < 1) {
    throw new InvalidParameterError(
      `Invalid nomination number '${nominationNumberStr}'. Must be a positive integer.`
    );
  }

  try {
    const data = await congressApiService.getNominationDetails({
      congress: congress.toString(),
      nominationNumber: nominationNumber.toString(),
    });
    return { contents: formatSuccessResponse(uri, data) };
  } catch (error) {
    handleResourceError(uri, error);
  }
}

/**
 * Handle nomination nominees resource requests.
 */
export async function handleNominationNomineesResource(
  uri: string,
  congressApiService: CongressApiService
): Promise<any> {
  logger.debug("Handling handleNominationNomineesResource", { uri });

  // Parse from URI: congress-gov://nomination/{congress}/{nominationNumber}/nominee/{ordinal}
  const match = uri.match(
    /^congress-gov:\/\/nomination\/(\d+)\/(\d+)\/nominee\/(\d+)$/i
  );
  if (!match) {
    throw new ResourceNotFoundError(
      `Invalid nomination nominees resource URI format: ${uri}`
    );
  }

  const congressStr = match[1];
  const nominationNumberStr = match[2];
  const ordinalStr = match[3];

  // Validate congress number (93-118)
  const congress = parseInt(congressStr, 10);
  if (isNaN(congress) || congress < 93 || congress > 118) {
    throw new InvalidParameterError(
      `Invalid congress number '${congressStr}'. Must be between 93 and 118.`
    );
  }

  // Validate nomination number
  const nominationNumber = parseInt(nominationNumberStr, 10);
  if (isNaN(nominationNumber) || nominationNumber < 1) {
    throw new InvalidParameterError(
      `Invalid nomination number '${nominationNumberStr}'. Must be a positive integer.`
    );
  }

  // Validate ordinal (must be positive)
  const ordinal = parseInt(ordinalStr, 10);
  if (isNaN(ordinal) || ordinal < 1) {
    throw new InvalidParameterError(
      `Invalid ordinal number '${ordinalStr}'. Must be a positive integer.`
    );
  }

  try {
    const data = await congressApiService.getNominationNominee({
      congress: congress.toString(),
      nominationNumber: nominationNumber.toString(),
      ordinal: ordinal.toString(),
    });
    return { contents: formatSuccessResponse(uri, data) };
  } catch (error) {
    handleResourceError(uri, error);
  }
}

/**
 * Handle nomination actions resource requests.
 */
export async function handleNominationActionsResource(
  uri: string,
  congressApiService: CongressApiService
): Promise<any> {
  logger.debug("Handling handleNominationActionsResource", { uri });

  // Parse from URI: congress-gov://nomination/{congress}/{nominationNumber}/actions
  const match = uri.match(
    /^congress-gov:\/\/nomination\/(\d+)\/(\d+)\/actions$/i
  );
  if (!match) {
    throw new ResourceNotFoundError(
      `Invalid nomination actions resource URI format: ${uri}`
    );
  }

  const congress = match[1];
  const nominationNumber = match[2];

  try {
    const data = await congressApiService.getNominationActions({
      congress: congress,
      nominationNumber: nominationNumber,
    });
    return { contents: formatSuccessResponse(uri, data) };
  } catch (error) {
    handleResourceError(uri, error);
  }
}

/**
 * Handle nomination committees resource requests.
 */
export async function handleNominationCommitteesResource(
  uri: string,
  congressApiService: CongressApiService
): Promise<any> {
  logger.debug("Handling handleNominationCommitteesResource", { uri });

  // Parse from URI: congress-gov://nomination/{congress}/{nominationNumber}/committees
  const match = uri.match(
    /^congress-gov:\/\/nomination\/(\d+)\/(\d+)\/committees$/i
  );
  if (!match) {
    throw new ResourceNotFoundError(
      `Invalid nomination committees resource URI format: ${uri}`
    );
  }

  const congress = match[1];
  const nominationNumber = match[2];

  try {
    const data = await congressApiService.getNominationCommittees({
      congress: congress,
      nominationNumber: nominationNumber,
    });
    return { contents: formatSuccessResponse(uri, data) };
  } catch (error) {
    handleResourceError(uri, error);
  }
}

/**
 * Handle nomination hearings resource requests.
 */
export async function handleNominationHearingsResource(
  uri: string,
  congressApiService: CongressApiService
): Promise<any> {
  logger.debug("Handling handleNominationHearingsResource", { uri });

  // Parse from URI: congress-gov://nomination/{congress}/{nominationNumber}/hearings
  const match = uri.match(
    /^congress-gov:\/\/nomination\/(\d+)\/(\d+)\/hearings$/i
  );
  if (!match) {
    throw new ResourceNotFoundError(
      `Invalid nomination hearings resource URI format: ${uri}`
    );
  }

  const congress = match[1];
  const nominationNumber = match[2];

  try {
    const data = await congressApiService.getNominationHearings({
      congress: congress,
      nominationNumber: nominationNumber,
    });
    return { contents: formatSuccessResponse(uri, data) };
  } catch (error) {
    handleResourceError(uri, error);
  }
}

// ========== CONGRESSIONAL RECORD HANDLERS ==========

/**
 * Handle congressional record resource requests.
 */
export async function handleCongressionalRecordResource(
  uri: string,
  congressApiService: CongressApiService
): Promise<any> {
  logger.debug("Handling handleCongressionalRecordResource", { uri });

  // Parse from URI: congress-gov://congressional-record
  const match = uri.match(/^congress-gov:\/\/congressional-record$/i);
  if (!match) {
    throw new ResourceNotFoundError(
      `Invalid congressional record resource URI format: ${uri}`
    );
  }

  try {
    const data = await congressApiService.getCongressionalRecord();
    return { contents: formatSuccessResponse(uri, data) };
  } catch (error) {
    handleResourceError(uri, error);
  }
}

/**
 * Handle daily congressional record resource requests.
 */
export async function handleDailyCongressionalRecordResource(
  uri: string,
  congressApiService: CongressApiService
): Promise<any> {
  logger.debug("Handling handleDailyCongressionalRecordResource", { uri });

  // Parse from URI: congress-gov://daily-congressional-record/{volumeNumber}/{issueNumber}
  const match = uri.match(
    /^congress-gov:\/\/daily-congressional-record\/(\d+)\/(\d+)$/i
  );
  if (!match) {
    throw new ResourceNotFoundError(
      `Invalid daily congressional record resource URI format: ${uri}`
    );
  }

  const volumeNumber = match[1];
  const issueNumber = match[2];

  try {
    const data = await congressApiService.getDailyCongressionalRecord({
      volumeNumber: volumeNumber,
      issueNumber: issueNumber,
    });
    return { contents: formatSuccessResponse(uri, data) };
  } catch (error) {
    handleResourceError(uri, error);
  }
}

/**
 * Handle daily congressional record articles resource requests.
 */
export async function handleDailyCongressionalRecordArticlesResource(
  uri: string,
  congressApiService: CongressApiService
): Promise<any> {
  logger.debug("Handling handleDailyCongressionalRecordArticlesResource", {
    uri,
  });

  // Parse from URI: congress-gov://daily-congressional-record/{volumeNumber}/{issueNumber}/articles
  const match = uri.match(
    /^congress-gov:\/\/daily-congressional-record\/(\d+)\/(\d+)\/articles$/i
  );
  if (!match) {
    throw new ResourceNotFoundError(
      `Invalid daily congressional record articles resource URI format: ${uri}`
    );
  }

  const volumeNumber = match[1];
  const issueNumber = match[2];

  try {
    const data = await congressApiService.getDailyCongressionalRecordArticles({
      volumeNumber: volumeNumber,
      issueNumber: issueNumber,
    });
    return { contents: formatSuccessResponse(uri, data) };
  } catch (error) {
    handleResourceError(uri, error);
  }
}

/**
 * Handle bound congressional record resource requests.
 */
export async function handleBoundCongressionalRecordResource(
  uri: string,
  congressApiService: CongressApiService
): Promise<any> {
  logger.debug("Handling handleBoundCongressionalRecordResource", { uri });

  // Parse from URI: congress-gov://bound-congressional-record/{year}/{month}/{day}
  const match = uri.match(
    /^congress-gov:\/\/bound-congressional-record\/(\d{4})\/(\d{2})\/(\d{2})$/i
  );
  if (!match) {
    throw new ResourceNotFoundError(
      `Invalid bound congressional record resource URI format: ${uri}`
    );
  }

  const year = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const day = parseInt(match[3], 10);

  // Validate date components
  if (year < 1900 || year > 2100) {
    throw new InvalidParameterError(
      `Invalid year '${year}'. Must be between 1900 and 2100.`
    );
  }
  if (month < 1 || month > 12) {
    throw new InvalidParameterError(
      `Invalid month '${month}'. Must be between 1 and 12.`
    );
  }
  if (day < 1 || day > 31) {
    throw new InvalidParameterError(
      `Invalid day '${day}'. Must be between 1 and 31.`
    );
  }

  // Additional date validation - check if it's a valid date
  const date = new Date(year, month - 1, day); // month is 0-based in Date constructor
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    throw new InvalidParameterError(
      `Invalid date '${year}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}'.`
    );
  }

  try {
    const data = await congressApiService.getBoundCongressionalRecord({
      year: year.toString(),
      month: month.toString().padStart(2, "0"),
      day: day.toString().padStart(2, "0"),
    });
    return { contents: formatSuccessResponse(uri, data) };
  } catch (error) {
    handleResourceError(uri, error);
  }
}

// ========== COMMUNICATION HANDLERS ==========

/**
 * Handle house communication resource requests.
 */
export async function handleHouseCommunicationResource(
  uri: string,
  congressApiService: CongressApiService
): Promise<any> {
  logger.debug("Handling handleHouseCommunicationResource", { uri });

  // Parse from URI: congress-gov://house-communication/{congress}/{communicationType}/{communicationNumber}
  const match = uri.match(
    /^congress-gov:\/\/house-communication\/(\d+)\/([a-z]+)\/(\d+)$/i
  );
  if (!match) {
    throw new ResourceNotFoundError(
      `Invalid house communication resource URI format: ${uri}`
    );
  }

  const congress = match[1];
  const communicationType = match[2];
  const communicationNumber = match[3];

  try {
    const data = await congressApiService.getHouseCommunicationDetails({
      congress: congress,
      communicationType: communicationType,
      communicationNumber: communicationNumber,
    });
    return { contents: formatSuccessResponse(uri, data) };
  } catch (error) {
    handleResourceError(uri, error);
  }
}

/**
 * Handle senate communication resource requests.
 */
export async function handleSenateCommunicationResource(
  uri: string,
  congressApiService: CongressApiService
): Promise<any> {
  logger.debug("Handling handleSenateCommunicationResource", { uri });

  // Parse from URI: congress-gov://senate-communication/{congress}/{communicationType}/{communicationNumber}
  const match = uri.match(
    /^congress-gov:\/\/senate-communication\/(\d+)\/([a-z]+)\/(\d+)$/i
  );
  if (!match) {
    throw new ResourceNotFoundError(
      `Invalid senate communication resource URI format: ${uri}`
    );
  }

  const congress = match[1];
  const communicationType = match[2];
  const communicationNumber = match[3];

  try {
    const data = await congressApiService.getSenateCommunicationDetails({
      congress: congress,
      communicationType: communicationType,
      communicationNumber: communicationNumber,
    });
    return { contents: formatSuccessResponse(uri, data) };
  } catch (error) {
    handleResourceError(uri, error);
  }
}

/**
 * Handle house requirement resource requests.
 */
export async function handleHouseRequirementResource(
  uri: string,
  congressApiService: CongressApiService
): Promise<any> {
  logger.debug("Handling handleHouseRequirementResource", { uri });

  // Parse from URI: congress-gov://house-requirement/{requirementNumber}
  const match = uri.match(/^congress-gov:\/\/house-requirement\/(\d+)$/i);
  if (!match) {
    throw new ResourceNotFoundError(
      `Invalid house requirement resource URI format: ${uri}`
    );
  }

  const requirementNumber = match[1];

  try {
    const data = await congressApiService.getHouseRequirementDetails({
      requirementNumber: requirementNumber,
    });
    return { contents: formatSuccessResponse(uri, data) };
  } catch (error) {
    handleResourceError(uri, error);
  }
}

/**
 * Handle house requirement matching communications resource requests.
 */
export async function handleHouseRequirementMatchingCommunicationsResource(
  uri: string,
  congressApiService: CongressApiService
): Promise<any> {
  logger.debug(
    "Handling handleHouseRequirementMatchingCommunicationsResource",
    { uri }
  );

  // Parse from URI: congress-gov://house-requirement/{requirementNumber}/matching-communications
  const match = uri.match(
    /^congress-gov:\/\/house-requirement\/(\d+)\/matching-communications$/i
  );
  if (!match) {
    throw new ResourceNotFoundError(
      `Invalid house requirement matching communications resource URI format: ${uri}`
    );
  }

  const requirementNumber = match[1];

  try {
    const data =
      await congressApiService.getHouseRequirementMatchingCommunications({
        requirementNumber: requirementNumber,
      });
    return { contents: formatSuccessResponse(uri, data) };
  } catch (error) {
    handleResourceError(uri, error);
  }
}
