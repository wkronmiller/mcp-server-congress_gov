import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
  McpError,
  ErrorCode,
  CallToolResult,
} from "@modelcontextprotocol/sdk/types.js"; // Ensure ErrorCode is imported
import { RequestHandlerExtra } from "@modelcontextprotocol/sdk/shared/protocol.js"; // For handler signature
import { z } from "zod";
import {
  TOOL_NAME,
  TOOL_DESCRIPTION,
  TOOL_PARAMS,
  CongressSearchParams,
} from "./searchParams.js";
// Import the service class, not the singleton instance, if we instantiate it here or pass it in
import { CongressApiService } from "../../services/CongressApiService.js";
import {
  ApiError,
  NotFoundError,
  RateLimitError,
  ValidationError,
  InvalidParameterError,
} from "../../utils/errors.js"; // Import custom errors
import { logger } from "../../utils/index.js";
import { SearchParams } from "../../types/index.js"; // Import the SearchParams type

/**
 * Registers and defines the handler for the congress_search tool.
 * It validates input using Zod schema defined in searchParams.ts and calls
 * the CongressApiService.searchCollection method.
 */
export const searchTool = (
  server: McpServer,
  congressApiService: CongressApiService
): void => {
  // Inject service instance

  // Type assertion for args based on Zod schema
  const processSearchRequest = async (
    args: CongressSearchParams,
    extra: RequestHandlerExtra
  ): Promise<CallToolResult> => {
    logger.debug(`Processing ${TOOL_NAME} request`, {
      args,
    });
    try {
      // Directly map validated args to the SearchParams type expected by the service
      const searchParams: SearchParams = {
        query: args.query,
        filters: args.filters, // Pass the filters object directly
        sort: args.sort,
        limit: args.limit,
        offset: args.offset,
      };

      // Call the refactored service method
      const result = await congressApiService.searchCollection(
        args.collection,
        searchParams
      );

      // Format the successful output for MCP
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(result, null, 2), // Pretty print JSON
          },
        ],
      };
    } catch (error) {
      logger.error(`Error processing ${TOOL_NAME}`, {
        error: error instanceof Error ? error.message : String(error),
        args,
      });

      // Map errors to McpError
      if (error instanceof InvalidParameterError) {
        // Check if this is specifically about congress filtering to provide enhanced guidance
        if (error.message.includes("congress")) {
          throw new McpError(
            ErrorCode.InvalidParams,
            `${error.message}\n\n*** CRITICAL API LIMITATION ***\nThe Congress.gov API does not support 'congress' filtering in general searches. This is a fundamental API architecture limitation:\n- ❌ Not supported: /v3/bill?congress=117\n- ✅ Supported: /v3/bill/117 (congress-specific endpoint)\n\nTo search within a specific congress, you need to:\n1. Use this search tool WITHOUT congress filters\n2. Manually filter results by the 'congress' field in the response\n3. Or use congress-specific API endpoints (not available in this tool)`
          );
        }
        // Handle other invalid filters/sort from service
        throw new McpError(ErrorCode.InvalidParams, error.message);
      }
      if (error instanceof ValidationError) {
        // Should be caught by Zod before handler, but handle defensively
        // Check if this is a Zod validation error about congress filtering
        if (
          error.message.includes("congress") ||
          error.message.includes("Unrecognized key")
        ) {
          throw new McpError(
            ErrorCode.InvalidParams,
            `Validation failed: ${error.message}\n\n*** CONGRESS FILTERING NOT SUPPORTED ***\nThe 'congress' parameter is intentionally excluded from search filters because the Congress.gov API does not support congress filtering in general collection searches. This is enforced by strict schema validation.\n\nAlternatives:\n1. Search without congress filters and filter results manually\n2. Use congress-specific API endpoints (requires different tooling)\n\nSee tool description for more details about this API limitation.`,
            error.details
          );
        }
        throw new McpError(
          ErrorCode.InvalidParams,
          `Validation failed: ${error.message}`,
          error.details
        );
      }
      if (error instanceof NotFoundError) {
        // Should not happen for list search, but handle defensively
        // Use InvalidRequest for a search that finds nothing, or InternalError if it's unexpected
        throw new McpError(
          ErrorCode.InvalidRequest,
          `Search failed: ${error.message}`
        );
      }
      if (error instanceof RateLimitError) {
        // Use InternalError for rate limits, as the server itself isn't unavailable, just the upstream API
        // Or potentially a custom error code if the spec allowed, but InternalError is safest.
        throw new McpError(
          ErrorCode.InternalError,
          `Rate limit exceeded: ${error.message}`
        );
      }
      if (error instanceof ApiError) {
        throw new McpError(
          ErrorCode.InternalError,
          `API error during search: ${error.message}`,
          { statusCode: error.statusCode }
        );
      }
      // Generic internal error
      throw new McpError(
        ErrorCode.InternalError,
        error instanceof Error
          ? error.message
          : "An unexpected error occurred in congress_search."
      );
    }
  };

  server.tool(
    TOOL_NAME,
    TOOL_DESCRIPTION,
    TOOL_PARAMS, // Pass the Zod schema directly
    processSearchRequest as any // Cast to any to satisfy SDK handler type if needed, ensure signature matches
  );

  logger.info(`Tool registered`, { toolName: TOOL_NAME });
};

// Note: Removed direct import/use of singleton. Service instance should be passed in.
