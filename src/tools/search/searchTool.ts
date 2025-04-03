import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { McpError, ErrorCode, CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { RequestHandlerExtra } from "@modelcontextprotocol/sdk/shared/protocol.js"; // For handler signature
import { z } from "zod";
import { TOOL_NAME, TOOL_DESCRIPTION, TOOL_PARAMS, CongressSearchParams } from "./searchParams.js";
import congressApiServiceInstance from "../../services/CongressApiService.js"; // Use singleton instance
import { ApiError, NotFoundError, RateLimitError, ValidationError } from "../../utils/errors.js"; // Import custom errors
import { logger } from "../../utils/index.js";

// Interface for the parameters passed to the API service's search method
interface ApiSearchParams {
    collection: string;
    query: string;
    limit?: number;
    offset?: number;
    sort?: string;
    congress?: number;
    type?: string;
    fromDateTime?: string;
    toDateTime?: string;
    // Add other potential filter keys if needed
    [key: string]: string | number | undefined; // Index signature
}


/**
 * Registers and defines the handler for the congress_search tool.
 */
export const searchTool = (server: McpServer): void => {

    const processSearchRequest = async (args: CongressSearchParams, extra: RequestHandlerExtra): Promise<CallToolResult> => {
        // Updated logger call with context
        logger.debug(`Processing ${TOOL_NAME} request`, { args, sessionId: extra.sessionId });
        try {
            // Prepare parameters for the API service call
            const apiParams: ApiSearchParams = { // Use the defined interface
                collection: args.collection,
                query: args.query ?? '', // API might require empty string if no query
                limit: args.limit,
                offset: args.offset,
                sort: args.sort,
                // Add filters if the API service expects them flattened or structured differently
                // For now, assuming the API service handles the filters object directly if needed
                // or we pass them as top-level params if supported by the API endpoint
                ...(args.filters?.congress && { congress: args.filters.congress }),
                ...(args.filters?.type && { type: args.filters.type }),
                ...(args.filters?.fromDateTime && { fromDateTime: args.filters.fromDateTime }),
                ...(args.filters?.toDateTime && { toDateTime: args.filters.toDateTime }),
            };

            // Remove undefined optional params before sending to API service
            Object.keys(apiParams).forEach((key) => {
                if (apiParams[key] === undefined) {
                    delete apiParams[key];
                }
            });

            // Cast needed because search method expects specific type, but we built it dynamically
            const result = await congressApiServiceInstance.search(apiParams as any);

            // Format the successful output for MCP
            return {
                content: [{
                    type: "text" as const,
                    text: JSON.stringify(result, null, 2) // Pretty print JSON
                }]
            };

        } catch (error) {
            // Updated logger call with context and error
            logger.error(`Error processing ${TOOL_NAME}`, error, { args, sessionId: extra.sessionId });

            // Map errors to McpError
            if (error instanceof ValidationError) { // Assuming Zod throws ValidationError
                throw new McpError(ErrorCode.InvalidParams, `Validation failed: ${error.message}`, error.details);
            }
            if (error instanceof NotFoundError) { // Should not happen for search, but handle defensively
                throw new McpError(ErrorCode.InvalidRequest, `Search failed: ${error.message}`); // Use InvalidRequest
            }
            if (error instanceof RateLimitError) {
                throw new McpError(ErrorCode.InternalError, `Rate limit exceeded: ${error.message}`);
            }
            if (error instanceof ApiError) {
                throw new McpError(ErrorCode.InternalError, `API error during search: ${error.message}`, { statusCode: error.statusCode });
            }
            // Generic internal error
            throw new McpError(
                ErrorCode.InternalError,
                error instanceof Error ? error.message : 'An unexpected error occurred in congress_search.'
            );
        }
    };

    server.tool(
        TOOL_NAME,
        TOOL_DESCRIPTION,
        TOOL_PARAMS, // Pass the Zod schema directly
        processSearchRequest
    );

    logger.info(`Tool registered`, { toolName: TOOL_NAME }); // Added context
};
