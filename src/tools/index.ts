import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ConfigurationManager } from "../config/ConfigurationManager.js";
import { logger } from "../utils/index.js";

// Import tool registration functions
import { searchTool } from "./search/searchTool.js";
import { getSubResourceTool } from "./subresource/getSubResourceTool.js";

/**
 * Register all defined tools with the MCP server instance.
 */
export function registerTools(server: McpServer): void {
    logger.info("Registering tools...");
    const configManager = ConfigurationManager.getInstance();

    // Register each tool
    searchTool(server); // Config is handled internally by service singleton
    getSubResourceTool(server); // Config is handled internally by service singleton

    logger.info("All tools registered.");
}
