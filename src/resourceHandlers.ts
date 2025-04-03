import { ResourceContents, McpError, ErrorCode, ReadResourceResult } from "@modelcontextprotocol/sdk/types.js"; // Keep ResourceContents for now
import { Variables } from "@modelcontextprotocol/sdk/shared/uriTemplate.js";
import congressApiServiceInstance from "./services/CongressApiService.js";
import { ResourceNotFoundError, ResourceError, NotFoundError, ApiError, RateLimitError } from "./utils/errors.js";
import { logger } from "./utils/logger.js";
import { BillResourceParams, MemberResourceParams } from "./types/index.js";

// Define types for other params inline or import if defined elsewhere
interface CongressResourceParams { congress: string; }
interface CommitteeResourceParams { congress: string; chamber: string; committeeCode: string; }
// Search params are handled via URLSearchParams

/**
 * Formats successful API data into the MCP ResourceContents structure (array).
 */
function formatSuccessResponse(uri: string, data: any): any[] { // Use any[] return type
    return [{ // Return the array directly
        uri: uri,
        mimeType: "application/json",
        text: JSON.stringify(data, null, 2)
    }];
}

/**
 * Handles errors during resource fetching, throwing appropriate McpErrors.
 */
function handleResourceError(uri: string, error: unknown): never {
    // Use structured logging for errors
    logger.error(`Error handling resource`, error, { uri });

    if (error instanceof ResourceNotFoundError || error instanceof NotFoundError) {
        // URI parsing error or 404 from API
        throw new McpError(ErrorCode.InvalidRequest, `Resource not found: ${uri}. Details: ${error.message}`);
    } else if (error instanceof RateLimitError || (error instanceof Error && error.name === 'RateLimitError')) {
        // Rate limit error from API service
        throw new McpError(ErrorCode.InternalError, `Rate limit exceeded for ${uri}. Details: ${error instanceof Error ? error.message : 'Rate Limit'} `);
    } else if (error instanceof ApiError) {
        // Other specific API errors
        throw new McpError(ErrorCode.InternalError, `API error fetching resource ${uri}: ${error.message}`, { statusCode: error.statusCode, details: error.details });
    } else if (error instanceof ResourceError) {
        // Other resource handling errors (e.g., invalid params in URI)
        throw new McpError(ErrorCode.InvalidRequest, `Invalid resource request for ${uri}: ${error.message}`, error.details);
    } else if (error instanceof Error) {
        // Unexpected JS errors
        throw new McpError(ErrorCode.InternalError, `Unexpected error processing resource ${uri}: ${error.message}`, error.stack);
    } else {
        // Fallback for non-Error throws
        throw new McpError(ErrorCode.InternalError, `Unknown error processing resource ${uri}`, error);
    }
}

// --- Resource Handler Implementations ---

export async function handleBillResource(uri: string): Promise<any> { // Use Promise<any>
    logger.debug("Handling handleBillResource", { uri });
    const match = uri.match(/^congress-gov:\/\/bill\/(\d+)\/([a-z]+)\/(\d+)$/i);
    if (!match) throw new ResourceNotFoundError(`Invalid bill resource URI format: ${uri}`);
    const [_, congress, billType, billNumber] = match;
    const params: BillResourceParams = { congress, billType: billType.toLowerCase(), billNumber };
    try {
        const billData = await congressApiServiceInstance.getBill(params);
        return { contents: formatSuccessResponse(uri, billData) }; // Return object { contents: [...] }
    } catch (error) { handleResourceError(uri, error); }
}

export async function handleMemberResource(uri: string): Promise<any> { // Use Promise<any>
    logger.debug("Handling handleMemberResource", { uri });
    const match = uri.match(/^congress-gov:\/\/member\/([A-Z0-9]+)$/i);
    if (!match) throw new ResourceNotFoundError(`Invalid member resource URI format: ${uri}`);
    const [_, memberId] = match;
    const params: MemberResourceParams = { memberId };
    try {
        const memberData = await congressApiServiceInstance.getMember(params);
        return { contents: formatSuccessResponse(uri, memberData) }; // Return object { contents: [...] }
    } catch (error) { handleResourceError(uri, error); }
}

export async function handleCongressResource(uri: string): Promise<any> { // Use Promise<any>
    logger.debug("Handling handleCongressResource", { uri });
    const match = uri.match(/^congress-gov:\/\/congress\/(\d+)$/);
    if (!match) throw new ResourceNotFoundError(`Invalid congress resource URI format: ${uri}`);
    const [_, congress] = match;
    const params: CongressResourceParams = { congress };
    try {
        const congressData = await congressApiServiceInstance.getCongress(params);
        return { contents: formatSuccessResponse(uri, congressData) }; // Return object { contents: [...] }
    } catch (error) { handleResourceError(uri, error); }
}

export async function handleCommitteeResource(uri: string): Promise<any> { // Use Promise<any>
    logger.debug("Handling handleCommitteeResource", { uri });
    const match = uri.match(/^congress-gov:\/\/committee\/(\d+)\/([a-z]+)\/([a-z0-9]+)$/i);
    if (!match) throw new ResourceNotFoundError(`Invalid committee resource URI format: ${uri}`);
    const [_, congress, chamber, committeeCode] = match;
    const params: CommitteeResourceParams = { congress, chamber: chamber.toLowerCase(), committeeCode: committeeCode.toLowerCase() };
    try {
        const committeeData = await congressApiServiceInstance.getCommittee(params);
        return { contents: formatSuccessResponse(uri, committeeData) }; // Return object { contents: [...] }
    } catch (error) { handleResourceError(uri, error); }
}

// REMOVED handleSearchResource function - functionality moved to congress_search tool

// --- Static Info Handlers ---
export async function handleInfoOverviewResource(): Promise<any> { // Use Promise<any>
    const uri = "congress-gov://info/overview";
    logger.debug("Handling handleInfoOverviewResource", { uri });
    try {
        const overviewData = { message: "Congress.gov API provides access to legislative data.", version: "v3", documentation: "https://api.congress.gov/" };
        return { contents: formatSuccessResponse(uri, overviewData) }; // Return object { contents: [...] }
    } catch (error) { handleResourceError(uri, error); }
}

export async function handleInfoCurrentCongressResource(): Promise<any> { // Use Promise<any>
    const uri = "congress-gov://info/current-congress";
    logger.debug("Handling handleInfoCurrentCongressResource", { uri });
    try {
        const currentCongressData = { number: 118, startDate: "2023-01-03", endDate: "2025-01-03" };
        return { contents: formatSuccessResponse(uri, currentCongressData) }; // Return object { contents: [...] }
    } catch (error) { handleResourceError(uri, error); }
}
