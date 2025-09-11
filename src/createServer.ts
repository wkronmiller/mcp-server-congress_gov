import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js"; // Import ResourceTemplate
import {
  // ListResourcesRequestSchema, // No longer needed directly here
  // ReadResourceRequestSchema, // No longer needed directly here
  ErrorCode,
  McpError,
  ResourceContents,
  ReadResourceRequest, // Keep for type hints if needed elsewhere, maybe not
  ReadResourceResult, // Needed for callback signatures
  // RequestHandlerExtra, // Needed for callback signatures - Import from specific path
  // Variables // Needed for template callback signatures - Import from specific path
} from "@modelcontextprotocol/sdk/types.js";
// Import potentially internal types from specific paths based on mcp.d.ts
import { RequestHandlerExtra } from "@modelcontextprotocol/sdk/shared/protocol.js";
import { Variables } from "@modelcontextprotocol/sdk/shared/uriTemplate.js";
import { ConfigurationManager } from "./config/ConfigurationManager.js";
import { logger } from "./utils/index.js";
// Import custom errors - will be used inside handlers later
import {
  ResourceNotFoundError,
  ResourceError,
  ApiError,
  RateLimitError,
} from "./utils/errors.js";
// Import for tool registration
import { registerTools } from "./tools/index.js";
import { CongressApiService } from "./services/CongressApiService.js"; // Import service class
// Resource Handlers (excluding search)
import {
  handleBillResource,
  handleBillActionsResource,
  handleBillAmendmentsResource,
  handleBillCommitteesResource,
  handleBillCosponsorsResource,
  handleBillRelatedBillsResource,
  handleBillSubjectsResource,
  handleBillSummariesResource,
  handleBillTextResource,
  handleBillTitlesResource,
  handleMemberResource,
  handleCongressResource,
  handleCommitteeResource,
  handleAmendmentResource,
  handleAmendmentActionsResource,
  handleAmendmentCosponsorsResource,
  handleAmendmentAmendmentsResource,
  handleAmendmentTextResource,
  handleLawResource,
  // handleSearchResource, // Removed - functionality moved to tool
  handleInfoOverviewResource,
  handleInfoCurrentCongressResource,
} from "./resourceHandlers.js"; // Placeholder import for resource handlers

/**
 * Creates and configures an MCP server instance for the Congress.gov API.
 * This server exposes API data via MCP Resources.
 * @returns {McpServer} The configured MCP server instance
 */
export function createServer(): McpServer {
  logger.info("Creating MCP server instance"); // Updated log message

  // Initialize the server with Resource capabilities
  const server = new McpServer(
    {
      name: "congress-gov-mcp-server",
      version: "1.0.0", // Consider updating version
      description: "MCP Server exposing the Congress.gov API as Resources",
    },
    {
      capabilities: {
        resources: {}, // Keep resource capability
        tools: {}, // Add tool capability back
      },
    }
  );

  // Get configuration
  const configManager = ConfigurationManager.getInstance();
  // Instantiate the service here to pass to handlers
  const congressApiService = new CongressApiService();

  // --- Register Resources ---

  // Define read callbacks that accept and pass the service instance
  // Signatures need to match ReadResourceCallback / ReadResourceTemplateCallback

  const readBillCallback = async (
    uri: URL,
    variables: Variables,
    extra: RequestHandlerExtra
  ): Promise<ReadResourceResult> => {
    logger.debug("Handling readBillCallback", {
      uri: uri.toString(),
      variables,
    });
    // Pass the service instance to the handler
    return handleBillResource(uri.toString(), congressApiService);
  };

  // Bill sub-resource callbacks
  const readBillActionsCallback = async (
    uri: URL,
    variables: Variables,
    extra: RequestHandlerExtra
  ): Promise<ReadResourceResult> => {
    logger.debug("Handling readBillActionsCallback", {
      uri: uri.toString(),
      variables,
    });
    return handleBillActionsResource(uri.toString(), congressApiService);
  };

  const readBillAmendmentsCallback = async (
    uri: URL,
    variables: Variables,
    extra: RequestHandlerExtra
  ): Promise<ReadResourceResult> => {
    logger.debug("Handling readBillAmendmentsCallback", {
      uri: uri.toString(),
      variables,
    });
    return handleBillAmendmentsResource(uri.toString(), congressApiService);
  };

  const readBillCommitteesCallback = async (
    uri: URL,
    variables: Variables,
    extra: RequestHandlerExtra
  ): Promise<ReadResourceResult> => {
    logger.debug("Handling readBillCommitteesCallback", {
      uri: uri.toString(),
      variables,
    });
    return handleBillCommitteesResource(uri.toString(), congressApiService);
  };

  const readBillCosponsorsCallback = async (
    uri: URL,
    variables: Variables,
    extra: RequestHandlerExtra
  ): Promise<ReadResourceResult> => {
    logger.debug("Handling readBillCosponsorsCallback", {
      uri: uri.toString(),
      variables,
    });
    return handleBillCosponsorsResource(uri.toString(), congressApiService);
  };

  const readBillRelatedBillsCallback = async (
    uri: URL,
    variables: Variables,
    extra: RequestHandlerExtra
  ): Promise<ReadResourceResult> => {
    logger.debug("Handling readBillRelatedBillsCallback", {
      uri: uri.toString(),
      variables,
    });
    return handleBillRelatedBillsResource(uri.toString(), congressApiService);
  };

  const readBillSubjectsCallback = async (
    uri: URL,
    variables: Variables,
    extra: RequestHandlerExtra
  ): Promise<ReadResourceResult> => {
    logger.debug("Handling readBillSubjectsCallback", {
      uri: uri.toString(),
      variables,
    });
    return handleBillSubjectsResource(uri.toString(), congressApiService);
  };

  const readBillSummariesCallback = async (
    uri: URL,
    variables: Variables,
    extra: RequestHandlerExtra
  ): Promise<ReadResourceResult> => {
    logger.debug("Handling readBillSummariesCallback", {
      uri: uri.toString(),
      variables,
    });
    return handleBillSummariesResource(uri.toString(), congressApiService);
  };

  const readBillTextCallback = async (
    uri: URL,
    variables: Variables,
    extra: RequestHandlerExtra
  ): Promise<ReadResourceResult> => {
    logger.debug("Handling readBillTextCallback", {
      uri: uri.toString(),
      variables,
    });
    return handleBillTextResource(uri.toString(), congressApiService);
  };

  const readBillTitlesCallback = async (
    uri: URL,
    variables: Variables,
    extra: RequestHandlerExtra
  ): Promise<ReadResourceResult> => {
    logger.debug("Handling readBillTitlesCallback", {
      uri: uri.toString(),
      variables,
    });
    return handleBillTitlesResource(uri.toString(), congressApiService);
  };

  const readMemberCallback = async (
    uri: URL,
    variables: Variables,
    extra: RequestHandlerExtra
  ): Promise<ReadResourceResult> => {
    logger.debug("Handling readMemberCallback", {
      uri: uri.toString(),
      variables,
    });
    return handleMemberResource(uri.toString(), congressApiService);
  };

  const readCongressCallback = async (
    uri: URL,
    variables: Variables,
    extra: RequestHandlerExtra
  ): Promise<ReadResourceResult> => {
    logger.debug("Handling readCongressCallback", {
      uri: uri.toString(),
      variables,
    });
    return handleCongressResource(uri.toString(), congressApiService);
  };

  const readCommitteeCallback = async (
    uri: URL,
    variables: Variables,
    extra: RequestHandlerExtra
  ): Promise<ReadResourceResult> => {
    logger.debug("Handling readCommitteeCallback", {
      uri: uri.toString(),
      variables,
    });
    // Note: Committee handler might need congress from variables if URI template changes
    return handleCommitteeResource(uri.toString(), congressApiService);
  };

  // Amendment callbacks
  const readAmendmentCallback = async (
    uri: URL,
    variables: Variables,
    extra: RequestHandlerExtra
  ): Promise<ReadResourceResult> => {
    logger.debug("Handling readAmendmentCallback", {
      uri: uri.toString(),
      variables,
    });
    return handleAmendmentResource(uri.toString(), congressApiService);
  };

  const readAmendmentActionsCallback = async (
    uri: URL,
    variables: Variables,
    extra: RequestHandlerExtra
  ): Promise<ReadResourceResult> => {
    logger.debug("Handling readAmendmentActionsCallback", {
      uri: uri.toString(),
      variables,
    });
    return handleAmendmentActionsResource(uri.toString(), congressApiService);
  };

  const readAmendmentCosponsorsCallback = async (
    uri: URL,
    variables: Variables,
    extra: RequestHandlerExtra
  ): Promise<ReadResourceResult> => {
    logger.debug("Handling readAmendmentCosponsorsCallback", {
      uri: uri.toString(),
      variables,
    });
    return handleAmendmentCosponsorsResource(
      uri.toString(),
      congressApiService
    );
  };

  const readAmendmentAmendmentsCallback = async (
    uri: URL,
    variables: Variables,
    extra: RequestHandlerExtra
  ): Promise<ReadResourceResult> => {
    logger.debug("Handling readAmendmentAmendmentsCallback", {
      uri: uri.toString(),
      variables,
    });
    return handleAmendmentAmendmentsResource(
      uri.toString(),
      congressApiService
    );
  };

  const readAmendmentTextCallback = async (
    uri: URL,
    variables: Variables,
    extra: RequestHandlerExtra
  ): Promise<ReadResourceResult> => {
    logger.debug("Handling readAmendmentTextCallback", {
      uri: uri.toString(),
      variables,
    });
    return handleAmendmentTextResource(uri.toString(), congressApiService);
  };

  const readInfoOverviewCallback = async (
    uri: URL,
    extra: RequestHandlerExtra
  ): Promise<ReadResourceResult> => {
    logger.debug("Handling readInfoOverviewCallback", {
      uri: uri.toString(),
    });
    // Static handlers don't need the service instance
    return handleInfoOverviewResource(uri.toString());
  };

  const readLawCallback = async (
    uri: URL,
    variables: Variables,
    extra: RequestHandlerExtra
  ): Promise<ReadResourceResult> => {
    logger.debug("Handling readLawCallback", {
      uri: uri.toString(),
      variables,
    });
    return handleLawResource(uri.toString(), congressApiService);
  };

  const readInfoCurrentCongressCallback = async (
    uri: URL,
    extra: RequestHandlerExtra
  ): Promise<ReadResourceResult> => {
    logger.debug("Handling readInfoCurrentCongressCallback", {
      uri: uri.toString(),
    });
    return handleInfoCurrentCongressResource(uri.toString());
  };

  // Register Resource Templates (excluding search)
  server.resource(
    "Bill Information",
    new ResourceTemplate(
      "congress-gov://bill/{congress}/{billType}/{billNumber}",
      { list: undefined }
    ),
    {
      description:
        "Information about a specific bill by Congress, type, and number",
      mimeType: "application/json",
    },
    readBillCallback
  );

  // Bill Sub-Resources
  server.resource(
    "Bill Actions",
    new ResourceTemplate(
      "congress-gov://bill/{congress}/{billType}/{billNumber}/actions",
      { list: undefined }
    ),
    {
      description: "Actions taken on a specific bill",
      mimeType: "application/json",
    },
    readBillActionsCallback
  );

  server.resource(
    "Bill Amendments",
    new ResourceTemplate(
      "congress-gov://bill/{congress}/{billType}/{billNumber}/amendments",
      { list: undefined }
    ),
    {
      description: "Amendments to a specific bill",
      mimeType: "application/json",
    },
    readBillAmendmentsCallback
  );

  server.resource(
    "Bill Committees",
    new ResourceTemplate(
      "congress-gov://bill/{congress}/{billType}/{billNumber}/committees",
      { list: undefined }
    ),
    {
      description: "Committees that have worked on a specific bill",
      mimeType: "application/json",
    },
    readBillCommitteesCallback
  );

  server.resource(
    "Bill Cosponsors",
    new ResourceTemplate(
      "congress-gov://bill/{congress}/{billType}/{billNumber}/cosponsors",
      { list: undefined }
    ),
    {
      description: "Cosponsors of a specific bill",
      mimeType: "application/json",
    },
    readBillCosponsorsCallback
  );

  server.resource(
    "Bill Related Bills",
    new ResourceTemplate(
      "congress-gov://bill/{congress}/{billType}/{billNumber}/relatedbills",
      { list: undefined }
    ),
    {
      description: "Bills related to a specific bill",
      mimeType: "application/json",
    },
    readBillRelatedBillsCallback
  );

  server.resource(
    "Bill Subjects",
    new ResourceTemplate(
      "congress-gov://bill/{congress}/{billType}/{billNumber}/subjects",
      { list: undefined }
    ),
    {
      description: "Subject areas and policy topics of a specific bill",
      mimeType: "application/json",
    },
    readBillSubjectsCallback
  );

  server.resource(
    "Bill Summaries",
    new ResourceTemplate(
      "congress-gov://bill/{congress}/{billType}/{billNumber}/summaries",
      { list: undefined }
    ),
    {
      description: "Summaries of a specific bill",
      mimeType: "application/json",
    },
    readBillSummariesCallback
  );

  server.resource(
    "Bill Text",
    new ResourceTemplate(
      "congress-gov://bill/{congress}/{billType}/{billNumber}/text",
      { list: undefined }
    ),
    {
      description: "Full text of a specific bill",
      mimeType: "application/json",
    },
    readBillTextCallback
  );

  server.resource(
    "Bill Titles",
    new ResourceTemplate(
      "congress-gov://bill/{congress}/{billType}/{billNumber}/titles",
      { list: undefined }
    ),
    {
      description: "Titles of a specific bill",
      mimeType: "application/json",
    },
    readBillTitlesCallback
  );

  server.resource(
    "Member Information",
    new ResourceTemplate("congress-gov://member/{memberId}", {
      list: undefined,
    }),
    {
      description: "Information about a specific member of Congress by ID",
      mimeType: "application/json",
    },
    readMemberCallback
  );

  server.resource(
    "Congress Information",
    new ResourceTemplate("congress-gov://congress/{congress}", {
      list: undefined,
    }),
    {
      description: "Information about a specific Congress by number",
      mimeType: "application/json",
    },
    readCongressCallback
  );

  server.resource(
    "Committee Information",
    new ResourceTemplate(
      "congress-gov://committee/{congress}/{chamber}/{committeeCode}",
      { list: undefined }
    ),
    {
      description: "Information about a specific committee",
      mimeType: "application/json",
    },
    readCommitteeCallback
  );

  // Amendment Resources
  server.resource(
    "Amendment Information",
    new ResourceTemplate(
      "congress-gov://amendment/{congress}/{amendmentType}/{amendmentNumber}",
      { list: undefined }
    ),
    {
      description:
        "Information about a specific amendment by Congress, type, and number",
      mimeType: "application/json",
    },
    readAmendmentCallback
  );

  server.resource(
    "Amendment Actions",
    new ResourceTemplate(
      "congress-gov://amendment/{congress}/{amendmentType}/{amendmentNumber}/actions",
      { list: undefined }
    ),
    {
      description: "Actions taken on a specific amendment",
      mimeType: "application/json",
    },
    readAmendmentActionsCallback
  );

  server.resource(
    "Amendment Cosponsors",
    new ResourceTemplate(
      "congress-gov://amendment/{congress}/{amendmentType}/{amendmentNumber}/cosponsors",
      { list: undefined }
    ),
    {
      description: "Cosponsors of a specific amendment",
      mimeType: "application/json",
    },
    readAmendmentCosponsorsCallback
  );

  server.resource(
    "Amendment Amendments",
    new ResourceTemplate(
      "congress-gov://amendment/{congress}/{amendmentType}/{amendmentNumber}/amendments",
      { list: undefined }
    ),
    {
      description: "Amendments to a specific amendment",
      mimeType: "application/json",
    },
    readAmendmentAmendmentsCallback
  );

  server.resource(
    "Amendment Text",
    new ResourceTemplate(
      "congress-gov://amendment/{congress}/{amendmentType}/{amendmentNumber}/text",
      { list: undefined }
    ),
    {
      description: "Text of a specific amendment",
      mimeType: "application/json",
    },
    readAmendmentTextCallback
  );

  // Law Resources
  server.resource(
    "Law Information",
    new ResourceTemplate(
      "congress-gov://law/{congress}/{lawType}/{lawNumber}",
      { list: undefined }
    ),
    {
      description:
        "Information about a specific law by Congress, type, and number",
      mimeType: "application/json",
    },
    readLawCallback
  );

  server.resource(
    "Laws by Congress and Type",
    new ResourceTemplate("congress-gov://law/{congress}/{lawType}", {
      list: undefined,
    }),
    {
      description: "List of laws by Congress and type (public/private)",
      mimeType: "application/json",
    },
    readLawCallback
  );

  server.resource(
    "Laws by Congress",
    new ResourceTemplate("congress-gov://law/{congress}", { list: undefined }),
    {
      description: "List of all laws by Congress number",
      mimeType: "application/json",
    },
    readLawCallback
  );

  // REMOVED search resource registrations

  // Register Static Resources (Based on Feature Spec Section 3.1)
  server.resource(
    "Congress.gov API Overview",
    "congress-gov://info/overview",
    {
      description: "General information about the Congress.gov API",
      mimeType: "application/json",
    },
    readInfoOverviewCallback
  );

  server.resource(
    "Current Congress Information",
    "congress-gov://info/current-congress",
    {
      description: "Information about the current congressional session",
      mimeType: "application/json",
    },
    readInfoCurrentCongressCallback
  );

  // Errors will be handled within the read callbacks by throwing McpError

  // Register Tools (search and subresource)
  registerTools(server);

  logger.info("MCP server instance configured successfully"); // Removed capabilities logging
  return server;
}
