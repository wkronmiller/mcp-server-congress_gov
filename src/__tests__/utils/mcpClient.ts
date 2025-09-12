import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
  ListResourcesResult,
  ReadResourceResult,
  CallToolResult,
  ListToolsResult,
} from "@modelcontextprotocol/sdk/types.js";
import { ResourceNotFoundError } from "../../utils/errors.js";

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
    // Access the server's registered tools (internal but stable in SDK)
    const registered = (this.server as any)._registeredTools as Record<
      string,
      any
    >;
    const tools = Object.entries(registered).map(([name, tool]) => ({
      name,
      description: tool.description,
      inputSchema: tool.inputSchema,
    }));
    return { tools };
  }

  /**
   * Call a tool by name with arguments
   */
  async callTool(
    name: string,
    arguments_: Record<string, any>
  ): Promise<CallToolResult> {
    // Call the registered tool callback directly
    const registered = (this.server as any)._registeredTools as Record<
      string,
      any
    >;
    const tool = registered[name];
    if (!tool) throw new Error(`Tool ${name} not found`);
    // The SDK normally validates args against tool.inputSchema before invoking callback.
    // Tests provide valid inputs; invoke the callback directly.
    const result = await tool.callback(arguments_, {});
    return result as CallToolResult;
  }

  /**
   * List available resources
   */
  async listResources(): Promise<ListResourcesResult> {
    // Combine fixed and template resources (templates returned via list callback when available)
    const registeredResources = (this.server as any)
      ._registeredResources as Record<string, any>;
    const fixed = Object.entries(registeredResources).map(([uri, res]) => ({
      uri,
      name: res.name,
      ...(res.metadata || {}),
    }));
    // Templates require list callback to enumerate; omit here for simplicity
    return { resources: fixed };
  }

  /**
   * Read a resource by URI
   */
  async readResource(uri: string): Promise<ReadResourceResult> {
    const url = new URL(uri);
    // Check exact resources first
    const registeredResources = (this.server as any)
      ._registeredResources as Record<string, any>;
    const exact = registeredResources[url.toString()];
    if (exact) {
      const res = await exact.readCallback(url, {});
      return res as ReadResourceResult;
    }
    // Then check templates for a match
    const templates = (this.server as any)
      ._registeredResourceTemplates as Record<string, any>;
    for (const template of Object.values(templates)) {
      let variables = template.resourceTemplate.uriTemplate.match(
        url.toString()
      );
      // Fallback: attempt match ignoring query string
      if (!variables) {
        const noQuery = uri.split("?")[0];
        variables = template.resourceTemplate.uriTemplate.match(noQuery);
      }
      if (variables) {
        const res = await template.readCallback(url, variables, {});
        return res as ReadResourceResult;
      }
    }
    throw new ResourceNotFoundError(
      `No resource handler found for URI: ${uri}`
    );
  }
}

/**
 * Create a test MCP client (no initialization needed for direct access)
 */
export function createTestClient(server: McpServer): TestMcpClient {
  return new TestMcpClient(server);
}
