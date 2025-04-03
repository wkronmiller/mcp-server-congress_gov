import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ConfigurationManager } from "../config/ConfigurationManager.js";
import { logger } from "../utils/index.js";

// Import tool registration functions
import { CongressApiService } from "../services/CongressApiService.js"; // Import the service class
import { searchTool } from "./search/searchTool.js";
import { getSubResourceTool } from "./subresource/getSubResourceTool.js";

/**
 * Register all defined tools with the MCP server instance.
 * Instantiates required services and injects them into the tool registration functions.
 */
export function registerTools(server: McpServer): void {
    logger.info("Registering tools...");
    const configManager = ConfigurationManager.getInstance();

    // Instantiate services needed by tools
    // Pass config explicitly if needed, or let service use ConfigurationManager internally
    const congressApiService = new CongressApiService(); // Instantiate the service

    // Register each tool, passing the service instance
    searchTool(server, congressApiService);
    getSubResourceTool(server, congressApiService);

    logger.info("All tools registered.");
}
