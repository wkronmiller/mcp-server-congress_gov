import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
  ListResourcesResult,
  ReadResourceResult,
  CallToolResult,
  ListToolsResult,
} from "@modelcontextprotocol/sdk/types.js";

/**
 * A simplified test client that directly calls server methods
 * This bypasses the transport layer for easier testing
 */
export class TestMcpClient {
  private server: McpServer;

  constructor(server: McpServer) {
    this.server = server;
  }

  /**
   * List available tools
   */
  async listTools(): Promise<ListToolsResult> {
    // Access the server's internal tool registry
    const tools = Array.from((this.server as any)._tools.values()).map(
      (tool: any) => ({
        name: tool.name,
        description: tool.description,
        inputSchema: tool.inputSchema,
      })
    );

    return { tools };
  }

  /**
   * Call a tool by name with arguments
   */
  async callTool(
    name: string,
    arguments_: Record<string, any>
  ): Promise<CallToolResult> {
    // Get the tool handler from the server
    const tool = (this.server as any)._tools.get(name);
    if (!tool) {
      throw new Error(`Tool ${name} not found`);
    }

    // Call the tool handler directly
    const result = await tool.handler(arguments_, {});
    return result;
  }

  /**
   * List available resources
   */
  async listResources(): Promise<ListResourcesResult> {
    // Access the server's internal resource registry
    const resources = Array.from((this.server as any)._resources.values()).map(
      (resource: any) => ({
        uri: resource.uri,
        name: resource.name,
        description: resource.description,
        mimeType: resource.mimeType,
      })
    );

    return { resources };
  }

  /**
   * Read a resource by URI
   */
  async readResource(uri: string): Promise<ReadResourceResult> {
    // Find the resource handler that matches this URI
    const resourceHandlers =
      (this.server as any)._resourceHandlers || new Map();

    for (const [pattern, handler] of resourceHandlers) {
      if (typeof pattern === "string" && uri.startsWith(pattern)) {
        const result = await handler(uri);
        return result;
      } else if (pattern instanceof RegExp && pattern.test(uri)) {
        const result = await handler(uri);
        return result;
      }
    }

    throw new Error(`No resource handler found for URI: ${uri}`);
  }
}

/**
 * Create a test MCP client (no initialization needed for direct access)
 */
export function createTestClient(server: McpServer): TestMcpClient {
  return new TestMcpClient(server);
}
