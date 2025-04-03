import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { McpError, ErrorCode, CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { RequestHandlerExtra } from "@modelcontextprotocol/sdk/shared/protocol.js";
import { z } from "zod";
import { TOOL_NAME, TOOL_DESCRIPTION, TOOL_PARAMS, CongressGetSubResourceParams } from "./getSubResourceParams.js";
import congressApiServiceInstance from "../../services/CongressApiService.js";
import { ApiError, NotFoundError, RateLimitError, ValidationError, ResourceError } from "../../utils/errors.js";
import { logger } from "../../utils/index.js";

/**
 * Parses the parent URI and extracts the base API path segment.
 * e.g., "congress-gov://bill/117/hr/3076" -> "/bill/117/hr/3076"
 * e.g., "congress-gov://member/P000197" -> "/member/P000197"
 * Throws ResourceError if the URI format is invalid.
 */
function getApiPathFromParentUri(parentUri: string): string { // Renamed for clarity
    try {
        const url = new URL(parentUri);
        if (url.protocol !== 'congress-gov:') {
            throw new Error('Invalid protocol');
        }
        // Hostname is the collection type (e.g., "bill", "member")
        const collection = url.hostname;
        // Pathname contains the specific identifiers (e.g., "/117/hr/3076", "/P000197")
        const path = url.pathname;

        if (!collection) {
            throw new Error('Missing collection type (hostname) in URI');
        }
        // Path might be just "/" for some simple cases, but usually needs identifiers
        if (!path) {
            throw new Error('Missing path component in URI');
        }

        // Construct the API path segment: /collection/identifiers
        // Ensure path doesn't have leading/trailing slashes before joining
        const cleanPath = path.startsWith('/') ? path.substring(1) : path;
        const apiPath = `/${collection}${cleanPath ? '/' + cleanPath : ''}`;

        // TODO: Add regex checks for specific valid parent paths if needed
        logger.debug(`Parsed API path from ${parentUri}: ${apiPath}`);
        return apiPath;
    } catch (e) {
        throw new ResourceError(`Invalid parentUri format or structure: ${parentUri}. ${(e as Error).message}`);
    }
}

/**
 * Registers and defines the handler for the congress_getSubResource tool.
 */
export const getSubResourceTool = (server: McpServer): void => {

    const processGetSubResourceRequest = async (args: CongressGetSubResourceParams, extra: RequestHandlerExtra): Promise<CallToolResult> => {
        // Updated logger call with context
        logger.debug(`Processing ${TOOL_NAME} request`, { args, sessionId: extra.sessionId });
        try {
            // 1. Parse parent URI to get API path segment
            const parentApiPath = getApiPathFromParentUri(args.parentUri); // Use renamed function

            // 2. Construct the full sub-resource endpoint path
            // Note: Need to handle potential variations like member legislation endpoints
            let subResourcePath = args.subResource;
            // Special handling for member legislation if API uses different path structure
            if (parentApiPath.startsWith('/member/')) { // Corrected variable name
                if (args.subResource === 'sponsored-legislation' || args.subResource === 'cosponsored-legislation') {
                    // API uses /member/{id}/sponsored-legislation, etc.
                    subResourcePath = args.subResource;
                }
                // Add checks here if other member sub-resources have different paths
            }
            // Add more specific path adjustments if needed based on parent/sub combinations

            const endpoint = `${parentApiPath}/${subResourcePath}`; // Use the parsed API path

            // 3. Prepare query parameters (limit, offset)
            const apiParams: { limit?: number; offset?: number } = {};
            if (args.limit !== undefined) {
                apiParams.limit = args.limit;
            }
            if (args.offset !== undefined) {
                apiParams.offset = args.offset;
            }

            // 4. Call the API service
            // Using makeRequest directly as we constructed the full path
            const result = await congressApiServiceInstance.makeRequest(endpoint, apiParams);

            // 5. Format the successful output
            return {
                content: [{
                    type: "text" as const,
                    text: JSON.stringify(result, null, 2)
                }]
            };

        } catch (error) {
            // Updated logger call with context and error
            logger.error(`Error processing ${TOOL_NAME}`, error, { args, sessionId: extra.sessionId });

            // Map errors to McpError
            if (error instanceof ValidationError || error instanceof ResourceError) {
                throw new McpError(ErrorCode.InvalidParams, `Invalid parameters: ${error.message}`, error.details);
            }
            if (error instanceof NotFoundError) {
                throw new McpError(ErrorCode.InvalidRequest, `Sub-resource or parent not found: ${error.message}`); // Use InvalidRequest
            }
            if (error instanceof RateLimitError) {
                throw new McpError(ErrorCode.InternalError, `Rate limit exceeded: ${error.message}`);
            }
            if (error instanceof ApiError) {
                throw new McpError(ErrorCode.InternalError, `API error fetching sub-resource: ${error.message}`, { statusCode: error.statusCode });
            }
            // Generic internal error
            throw new McpError(
                ErrorCode.InternalError,
                error instanceof Error ? error.message : `An unexpected error occurred in ${TOOL_NAME}.`
            );
        }
    };

    server.tool(
        TOOL_NAME,
        TOOL_DESCRIPTION,
        TOOL_PARAMS,
        processGetSubResourceRequest
    );

    logger.info(`Tool registered`, { toolName: TOOL_NAME }); // Added context
};
