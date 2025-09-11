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
  // TODO: Add validation for billType if needed
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
