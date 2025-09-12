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
  Request,
  Notification,
  ServerRequest, // Import for type parameters
  ServerNotification, // Import for type parameters
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
  handleMemberSponsoredLegislationResource,
  handleMemberCosponsoredLegislationResource,
  handleMembersByStateResource,
  handleMembersByDistrictResource,
  handleMembersByCongressStateDistrictResource,
  handleCongressResource,
  handleCommitteeResource,
  handleCommitteeBillsResource,
  handleCommitteeReportsResource,
  handleCommitteeNominationsResource,
  handleCommitteeHouseCommunicationsResource,
  handleCommitteeSenateCommunicationsResource,
  handleAmendmentResource,
  handleAmendmentActionsResource,
  handleAmendmentCosponsorsResource,
  handleAmendmentAmendmentsResource,
  handleAmendmentTextResource,
  handleLawResource,
  handleCommitteeReportResource,
  handleCommitteePrintResource,
  handleCommitteeMeetingResource,
  handleCommitteeHearingResource,
  handleNominationResource,
  handleNominationNomineesResource,
  handleNominationActionsResource,
  handleNominationCommitteesResource,
  handleNominationHearingsResource,
  // handleSearchResource, // Removed - functionality moved to tool
  handleInfoOverviewResource,
  handleInfoCurrentCongressResource,
  handleCongressionalRecordResource,
  handleDailyCongressionalRecordResource,
  handleDailyCongressionalRecordArticlesResource,
  handleBoundCongressionalRecordResource,
  handleHouseCommunicationResource,
  handleSenateCommunicationResource,
  handleHouseRequirementResource,
  handleHouseRequirementMatchingCommunicationsResource,
  handleTreatyResource,
  handleTreatyActionsResource,
  handleTreatyCommitteesResource,
  handleCRSReportResource,
  handleSummariesResource,
  handleHouseVoteResource,
  handleHouseVoteMembersResource,
  handleBillTypesResource,
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
    extra: RequestHandlerExtra<ServerRequest, ServerNotification>
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
    extra: RequestHandlerExtra<ServerRequest, ServerNotification>
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
    extra: RequestHandlerExtra<ServerRequest, ServerNotification>
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
    extra: RequestHandlerExtra<ServerRequest, ServerNotification>
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
    extra: RequestHandlerExtra<ServerRequest, ServerNotification>
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
    extra: RequestHandlerExtra<ServerRequest, ServerNotification>
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
    extra: RequestHandlerExtra<ServerRequest, ServerNotification>
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
    extra: RequestHandlerExtra<ServerRequest, ServerNotification>
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
    extra: RequestHandlerExtra<ServerRequest, ServerNotification>
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
    extra: RequestHandlerExtra<ServerRequest, ServerNotification>
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
    extra: RequestHandlerExtra<ServerRequest, ServerNotification>
  ): Promise<ReadResourceResult> => {
    logger.debug("Handling readMemberCallback", {
      uri: uri.toString(),
      variables,
    });
    return handleMemberResource(uri.toString(), congressApiService);
  };

  // Member sub-resource callbacks
  const readMemberSponsoredLegislationCallback = async (
    uri: URL,
    variables: Variables,
    extra: RequestHandlerExtra<ServerRequest, ServerNotification>
  ): Promise<ReadResourceResult> => {
    logger.debug("Handling readMemberSponsoredLegislationCallback", {
      uri: uri.toString(),
      variables,
    });
    return handleMemberSponsoredLegislationResource(
      uri.toString(),
      congressApiService
    );
  };

  const readMemberCosponsoredLegislationCallback = async (
    uri: URL,
    variables: Variables,
    extra: RequestHandlerExtra<ServerRequest, ServerNotification>
  ): Promise<ReadResourceResult> => {
    logger.debug("Handling readMemberCosponsoredLegislationCallback", {
      uri: uri.toString(),
      variables,
    });
    return handleMemberCosponsoredLegislationResource(
      uri.toString(),
      congressApiService
    );
  };

  const readMembersByStateCallback = async (
    uri: URL,
    variables: Variables,
    extra: RequestHandlerExtra<ServerRequest, ServerNotification>
  ): Promise<ReadResourceResult> => {
    logger.debug("Handling readMembersByStateCallback", {
      uri: uri.toString(),
      variables,
    });
    return handleMembersByStateResource(uri.toString(), congressApiService);
  };

  const readMembersByDistrictCallback = async (
    uri: URL,
    variables: Variables,
    extra: RequestHandlerExtra<ServerRequest, ServerNotification>
  ): Promise<ReadResourceResult> => {
    logger.debug("Handling readMembersByDistrictCallback", {
      uri: uri.toString(),
      variables,
    });
    return handleMembersByDistrictResource(uri.toString(), congressApiService);
  };

  const readMembersByCongressStateDistrictCallback = async (
    uri: URL,
    variables: Variables,
    extra: RequestHandlerExtra<ServerRequest, ServerNotification>
  ): Promise<ReadResourceResult> => {
    logger.debug("Handling readMembersByCongressStateDistrictCallback", {
      uri: uri.toString(),
      variables,
    });
    return handleMembersByCongressStateDistrictResource(
      uri.toString(),
      congressApiService
    );
  };

  const readCongressCallback = async (
    uri: URL,
    variables: Variables,
    extra: RequestHandlerExtra<ServerRequest, ServerNotification>
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
    extra: RequestHandlerExtra<ServerRequest, ServerNotification>
  ): Promise<ReadResourceResult> => {
    logger.debug("Handling readCommitteeCallback", {
      uri: uri.toString(),
      variables,
    });
    // Note: Committee handler might need congress from variables if URI template changes
    return handleCommitteeResource(uri.toString(), congressApiService);
  };

  // Committee sub-resource callbacks
  const readCommitteeBillsCallback = async (
    uri: URL,
    variables: Variables,
    extra: RequestHandlerExtra<ServerRequest, ServerNotification>
  ): Promise<ReadResourceResult> => {
    logger.debug("Handling readCommitteeBillsCallback", {
      uri: uri.toString(),
      variables,
    });
    return handleCommitteeBillsResource(uri.toString(), congressApiService);
  };

  const readCommitteeReportsCallback = async (
    uri: URL,
    variables: Variables,
    extra: RequestHandlerExtra<ServerRequest, ServerNotification>
  ): Promise<ReadResourceResult> => {
    logger.debug("Handling readCommitteeReportsCallback", {
      uri: uri.toString(),
      variables,
    });
    return handleCommitteeReportsResource(uri.toString(), congressApiService);
  };

  const readCommitteeNominationsCallback = async (
    uri: URL,
    variables: Variables,
    extra: RequestHandlerExtra<ServerRequest, ServerNotification>
  ): Promise<ReadResourceResult> => {
    logger.debug("Handling readCommitteeNominationsCallback", {
      uri: uri.toString(),
      variables,
    });
    return handleCommitteeNominationsResource(
      uri.toString(),
      congressApiService
    );
  };

  const readCommitteeHouseCommunicationsCallback = async (
    uri: URL,
    variables: Variables,
    extra: RequestHandlerExtra<ServerRequest, ServerNotification>
  ): Promise<ReadResourceResult> => {
    logger.debug("Handling readCommitteeHouseCommunicationsCallback", {
      uri: uri.toString(),
      variables,
    });
    return handleCommitteeHouseCommunicationsResource(
      uri.toString(),
      congressApiService
    );
  };

  const readCommitteeSenateCommunicationsCallback = async (
    uri: URL,
    variables: Variables,
    extra: RequestHandlerExtra<ServerRequest, ServerNotification>
  ): Promise<ReadResourceResult> => {
    logger.debug("Handling readCommitteeSenateCommunicationsCallback", {
      uri: uri.toString(),
      variables,
    });
    return handleCommitteeSenateCommunicationsResource(
      uri.toString(),
      congressApiService
    );
  };

  // Amendment callbacks
  const readAmendmentCallback = async (
    uri: URL,
    variables: Variables,
    extra: RequestHandlerExtra<ServerRequest, ServerNotification>
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
    extra: RequestHandlerExtra<ServerRequest, ServerNotification>
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
    extra: RequestHandlerExtra<ServerRequest, ServerNotification>
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
    extra: RequestHandlerExtra<ServerRequest, ServerNotification>
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
    extra: RequestHandlerExtra<ServerRequest, ServerNotification>
  ): Promise<ReadResourceResult> => {
    logger.debug("Handling readAmendmentTextCallback", {
      uri: uri.toString(),
      variables,
    });
    return handleAmendmentTextResource(uri.toString(), congressApiService);
  };

  const readInfoOverviewCallback = async (
    uri: URL,
    extra: RequestHandlerExtra<ServerRequest, ServerNotification>
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
    extra: RequestHandlerExtra<ServerRequest, ServerNotification>
  ): Promise<ReadResourceResult> => {
    logger.debug("Handling readLawCallback", {
      uri: uri.toString(),
      variables,
    });
    return handleLawResource(uri.toString(), congressApiService);
  };

  const readInfoCurrentCongressCallback = async (
    uri: URL,
    extra: RequestHandlerExtra<ServerRequest, ServerNotification>
  ): Promise<ReadResourceResult> => {
    logger.debug("Handling readInfoCurrentCongressCallback", {
      uri: uri.toString(),
    });
    return handleInfoCurrentCongressResource(uri.toString());
  };

  // Committee Document callbacks
  const readCommitteeReportCallback = async (
    uri: URL,
    variables: Variables,
    extra: RequestHandlerExtra<ServerRequest, ServerNotification>
  ): Promise<ReadResourceResult> => {
    logger.debug("Handling readCommitteeReportCallback", {
      uri: uri.toString(),
      variables,
    });
    return handleCommitteeReportResource(uri.toString(), congressApiService);
  };

  const readCommitteePrintCallback = async (
    uri: URL,
    variables: Variables,
    extra: RequestHandlerExtra<ServerRequest, ServerNotification>
  ): Promise<ReadResourceResult> => {
    logger.debug("Handling readCommitteePrintCallback", {
      uri: uri.toString(),
      variables,
    });
    return handleCommitteePrintResource(uri.toString(), congressApiService);
  };

  const readCommitteeMeetingCallback = async (
    uri: URL,
    variables: Variables,
    extra: RequestHandlerExtra<ServerRequest, ServerNotification>
  ): Promise<ReadResourceResult> => {
    logger.debug("Handling readCommitteeMeetingCallback", {
      uri: uri.toString(),
      variables,
    });
    return handleCommitteeMeetingResource(uri.toString(), congressApiService);
  };

  const readCommitteeHearingCallback = async (
    uri: URL,
    variables: Variables,
    extra: RequestHandlerExtra<ServerRequest, ServerNotification>
  ): Promise<ReadResourceResult> => {
    logger.debug("Handling readCommitteeHearingCallback", {
      uri: uri.toString(),
      variables,
    });
    return handleCommitteeHearingResource(uri.toString(), congressApiService);
  };

  // Nomination callbacks
  const readNominationCallback = async (
    uri: URL,
    variables: Variables,
    extra: RequestHandlerExtra<ServerRequest, ServerNotification>
  ): Promise<ReadResourceResult> => {
    logger.debug("Handling readNominationCallback", {
      uri: uri.toString(),
      variables,
    });
    return handleNominationResource(uri.toString(), congressApiService);
  };

  const readNominationNomineesCallback = async (
    uri: URL,
    variables: Variables,
    extra: RequestHandlerExtra<ServerRequest, ServerNotification>
  ): Promise<ReadResourceResult> => {
    logger.debug("Handling readNominationNomineesCallback", {
      uri: uri.toString(),
      variables,
    });
    return handleNominationNomineesResource(uri.toString(), congressApiService);
  };

  const readNominationActionsCallback = async (
    uri: URL,
    variables: Variables,
    extra: RequestHandlerExtra<ServerRequest, ServerNotification>
  ): Promise<ReadResourceResult> => {
    logger.debug("Handling readNominationActionsCallback", {
      uri: uri.toString(),
      variables,
    });
    return handleNominationActionsResource(uri.toString(), congressApiService);
  };

  const readNominationCommitteesCallback = async (
    uri: URL,
    variables: Variables,
    extra: RequestHandlerExtra<ServerRequest, ServerNotification>
  ): Promise<ReadResourceResult> => {
    logger.debug("Handling readNominationCommitteesCallback", {
      uri: uri.toString(),
      variables,
    });
    return handleNominationCommitteesResource(
      uri.toString(),
      congressApiService
    );
  };

  const readNominationHearingsCallback = async (
    uri: URL,
    variables: Variables,
    extra: RequestHandlerExtra<ServerRequest, ServerNotification>
  ): Promise<ReadResourceResult> => {
    logger.debug("Handling readNominationHearingsCallback", {
      uri: uri.toString(),
      variables,
    });
    return handleNominationHearingsResource(uri.toString(), congressApiService);
  };

  // Congressional Record callbacks
  const readCongressionalRecordCallback = async (
    uri: URL,
    extra: RequestHandlerExtra<ServerRequest, ServerNotification>
  ): Promise<ReadResourceResult> => {
    logger.debug("Handling readCongressionalRecordCallback", {
      uri: uri.toString(),
    });
    return handleCongressionalRecordResource(
      uri.toString(),
      congressApiService
    );
  };

  const readDailyCongressionalRecordCallback = async (
    uri: URL,
    variables: Variables,
    extra: RequestHandlerExtra<ServerRequest, ServerNotification>
  ): Promise<ReadResourceResult> => {
    logger.debug("Handling readDailyCongressionalRecordCallback", {
      uri: uri.toString(),
      variables,
    });
    return handleDailyCongressionalRecordResource(
      uri.toString(),
      congressApiService
    );
  };

  const readDailyCongressionalRecordArticlesCallback = async (
    uri: URL,
    variables: Variables,
    extra: RequestHandlerExtra<ServerRequest, ServerNotification>
  ): Promise<ReadResourceResult> => {
    logger.debug("Handling readDailyCongressionalRecordArticlesCallback", {
      uri: uri.toString(),
      variables,
    });
    return handleDailyCongressionalRecordArticlesResource(
      uri.toString(),
      congressApiService
    );
  };

  const readBoundCongressionalRecordCallback = async (
    uri: URL,
    variables: Variables,
    extra: RequestHandlerExtra<ServerRequest, ServerNotification>
  ): Promise<ReadResourceResult> => {
    return handleBoundCongressionalRecordResource(
      uri.toString(),
      congressApiService
    );
  };

  // Communication resource callbacks
  const readHouseCommunicationCallback = async (
    uri: URL,
    variables: Variables,
    extra: RequestHandlerExtra<ServerRequest, ServerNotification>
  ): Promise<ReadResourceResult> => {
    return handleHouseCommunicationResource(uri.toString(), congressApiService);
  };

  const readSenateCommunicationCallback = async (
    uri: URL,
    variables: Variables,
    extra: RequestHandlerExtra<ServerRequest, ServerNotification>
  ): Promise<ReadResourceResult> => {
    return handleSenateCommunicationResource(
      uri.toString(),
      congressApiService
    );
  };

  const readHouseRequirementCallback = async (
    uri: URL,
    variables: Variables,
    extra: RequestHandlerExtra<ServerRequest, ServerNotification>
  ): Promise<ReadResourceResult> => {
    return handleHouseRequirementResource(uri.toString(), congressApiService);
  };

  const readHouseRequirementMatchingCommunicationsCallback = async (
    uri: URL,
    variables: Variables,
    extra: RequestHandlerExtra<ServerRequest, ServerNotification>
  ): Promise<ReadResourceResult> => {
    return handleHouseRequirementMatchingCommunicationsResource(
      uri.toString(),
      congressApiService
    );
  };

  // Treaty callbacks
  const readTreatyCallback = async (
    uri: URL,
    variables: Variables,
    extra: RequestHandlerExtra<ServerRequest, ServerNotification>
  ): Promise<ReadResourceResult> => {
    return handleTreatyResource(uri.toString(), congressApiService);
  };

  const readTreatyActionsCallback = async (
    uri: URL,
    variables: Variables,
    extra: RequestHandlerExtra<ServerRequest, ServerNotification>
  ): Promise<ReadResourceResult> => {
    return handleTreatyActionsResource(uri.toString(), congressApiService);
  };

  const readTreatyCommitteesCallback = async (
    uri: URL,
    variables: Variables,
    extra: RequestHandlerExtra<ServerRequest, ServerNotification>
  ): Promise<ReadResourceResult> => {
    return handleTreatyCommitteesResource(uri.toString(), congressApiService);
  };

  // CRS Report callback
  const readCRSReportCallback = async (
    uri: URL,
    variables: Variables,
    extra: RequestHandlerExtra<ServerRequest, ServerNotification>
  ): Promise<ReadResourceResult> => {
    return handleCRSReportResource(uri.toString(), congressApiService);
  };

  // Summaries callback
  const readSummariesCallback = async (
    uri: URL,
    variables: Variables,
    extra: RequestHandlerExtra<ServerRequest, ServerNotification>
  ): Promise<ReadResourceResult> => {
    return handleSummariesResource(uri.toString(), congressApiService);
  };

  // House Vote callbacks
  const readHouseVoteCallback = async (
    uri: URL,
    variables: Variables,
    extra: RequestHandlerExtra<ServerRequest, ServerNotification>
  ): Promise<ReadResourceResult> => {
    return handleHouseVoteResource(uri.toString(), congressApiService);
  };

  const readHouseVoteMembersCallback = async (
    uri: URL,
    variables: Variables,
    extra: RequestHandlerExtra<ServerRequest, ServerNotification>
  ): Promise<ReadResourceResult> => {
    return handleHouseVoteMembersResource(uri.toString(), congressApiService);
  };

  const readBillTypesCallback = async (
    uri: URL,
    extra: RequestHandlerExtra<ServerRequest, ServerNotification>
  ): Promise<ReadResourceResult> => {
    logger.debug("Handling readBillTypesCallback", {
      uri: uri.toString(),
    });
    return handleBillTypesResource(uri.toString());
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
    "Bill Summary",
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

  // Member Sub-Resources
  server.resource(
    "Member Sponsored Legislation",
    new ResourceTemplate(
      "congress-gov://member/{bioguideId}/sponsored-legislation",
      {
        list: undefined,
      }
    ),
    {
      description: "Legislation sponsored by a specific member of Congress",
      mimeType: "application/json",
    },
    readMemberSponsoredLegislationCallback
  );

  server.resource(
    "Member Cosponsored Legislation",
    new ResourceTemplate(
      "congress-gov://member/{bioguideId}/cosponsored-legislation",
      {
        list: undefined,
      }
    ),
    {
      description: "Legislation cosponsored by a specific member of Congress",
      mimeType: "application/json",
    },
    readMemberCosponsoredLegislationCallback
  );

  server.resource(
    "Members by State",
    new ResourceTemplate("congress-gov://member/state/{stateCode}", {
      list: undefined,
    }),
    {
      description: "Members of Congress from a specific state",
      mimeType: "application/json",
    },
    readMembersByStateCallback
  );

  server.resource(
    "Members by District",
    new ResourceTemplate(
      "congress-gov://member/state/{stateCode}/district/{district}",
      {
        list: undefined,
      }
    ),
    {
      description: "Members of Congress from a specific state and district",
      mimeType: "application/json",
    },
    readMembersByDistrictCallback
  );

  server.resource(
    "Members by Congress/State/District",
    new ResourceTemplate(
      "congress-gov://member/congress/{congress}/state/{stateCode}/district/{district}",
      {
        list: undefined,
      }
    ),
    {
      description:
        "Members of Congress from a specific congress, state, and district",
      mimeType: "application/json",
    },
    readMembersByCongressStateDistrictCallback
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
    new ResourceTemplate("congress-gov://committee/{chamber}/{committeeCode}", {
      list: undefined,
    }),
    {
      description: "Information about a specific committee",
      mimeType: "application/json",
    },
    readCommitteeCallback
  );

  // Committee Sub-Resources
  server.resource(
    "Committee Bills",
    new ResourceTemplate(
      "congress-gov://committee/{chamber}/{committeeCode}/bills",
      { list: undefined }
    ),
    {
      description: "Bills associated with a specific committee",
      mimeType: "application/json",
    },
    readCommitteeBillsCallback
  );

  server.resource(
    "Committee Reports",
    new ResourceTemplate(
      "congress-gov://committee/{chamber}/{committeeCode}/reports",
      { list: undefined }
    ),
    {
      description: "Reports published by a specific committee",
      mimeType: "application/json",
    },
    readCommitteeReportsCallback
  );

  server.resource(
    "Committee Nominations",
    new ResourceTemplate(
      "congress-gov://committee/{chamber}/{committeeCode}/nominations",
      { list: undefined }
    ),
    {
      description: "Nominations reviewed by a specific committee",
      mimeType: "application/json",
    },
    readCommitteeNominationsCallback
  );

  server.resource(
    "Committee House Communications",
    new ResourceTemplate(
      "congress-gov://committee/{chamber}/{committeeCode}/house-communication",
      { list: undefined }
    ),
    {
      description: "House communications related to a specific committee",
      mimeType: "application/json",
    },
    readCommitteeHouseCommunicationsCallback
  );

  server.resource(
    "Committee Senate Communications",
    new ResourceTemplate(
      "congress-gov://committee/{chamber}/{committeeCode}/senate-communication",
      { list: undefined }
    ),
    {
      description: "Senate communications related to a specific committee",
      mimeType: "application/json",
    },
    readCommitteeSenateCommunicationsCallback
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

  // Committee Document Resources
  server.resource(
    "Committee Report Information",
    new ResourceTemplate(
      "congress-gov://committee-report/{congress}/{reportType}/{reportNumber}",
      { list: undefined }
    ),
    {
      description:
        "Information about a specific committee report by Congress, type, and number",
      mimeType: "application/json",
    },
    readCommitteeReportCallback
  );

  server.resource(
    "Committee Report Text",
    new ResourceTemplate(
      "congress-gov://committee-report/{congress}/{reportType}/{reportNumber}/text",
      { list: undefined }
    ),
    {
      description: "Full text of a specific committee report",
      mimeType: "application/json",
    },
    readCommitteeReportCallback
  );

  server.resource(
    "Committee Print Information",
    new ResourceTemplate(
      "congress-gov://committee-print/{congress}/{chamber}/{jacketNumber}",
      { list: undefined }
    ),
    {
      description:
        "Information about a specific committee print by Congress, chamber, and jacket number",
      mimeType: "application/json",
    },
    readCommitteePrintCallback
  );

  server.resource(
    "Committee Print Text",
    new ResourceTemplate(
      "congress-gov://committee-print/{congress}/{chamber}/{jacketNumber}/text",
      { list: undefined }
    ),
    {
      description: "Full text of a specific committee print",
      mimeType: "application/json",
    },
    readCommitteePrintCallback
  );

  server.resource(
    "Committee Meeting Information",
    new ResourceTemplate(
      "congress-gov://committee-meeting/{congress}/{chamber}/{eventId}",
      { list: undefined }
    ),
    {
      description:
        "Information about a specific committee meeting by Congress, chamber, and event ID",
      mimeType: "application/json",
    },
    readCommitteeMeetingCallback
  );

  server.resource(
    "Committee Hearing Information",
    new ResourceTemplate(
      "congress-gov://hearing/{congress}/{chamber}/{jacketNumber}",
      { list: undefined }
    ),
    {
      description:
        "Information about a specific committee hearing by Congress, chamber, and jacket number",
      mimeType: "application/json",
    },
    readCommitteeHearingCallback
  );

  // Nomination Resources
  server.resource(
    "Nomination Information",
    new ResourceTemplate(
      "congress-gov://nomination/{congress}/{nominationNumber}",
      { list: undefined }
    ),
    {
      description:
        "Information about a specific presidential nomination by Congress and nomination number",
      mimeType: "application/json",
    },
    readNominationCallback
  );

  server.resource(
    "Nomination Individual Nominee",
    new ResourceTemplate(
      "congress-gov://nomination/{congress}/{nominationNumber}/nominee/{ordinal}",
      { list: undefined }
    ),
    {
      description: "Information about a specific nominee within a nomination",
      mimeType: "application/json",
    },
    readNominationNomineesCallback
  );

  server.resource(
    "Nomination Actions",
    new ResourceTemplate(
      "congress-gov://nomination/{congress}/{nominationNumber}/actions",
      { list: undefined }
    ),
    {
      description: "Actions taken on a specific nomination",
      mimeType: "application/json",
    },
    readNominationActionsCallback
  );

  server.resource(
    "Nomination Committees",
    new ResourceTemplate(
      "congress-gov://nomination/{congress}/{nominationNumber}/committees",
      { list: undefined }
    ),
    {
      description: "Committees associated with a specific nomination",
      mimeType: "application/json",
    },
    readNominationCommitteesCallback
  );

  server.resource(
    "Nomination Hearings",
    new ResourceTemplate(
      "congress-gov://nomination/{congress}/{nominationNumber}/hearings",
      { list: undefined }
    ),
    {
      description: "Hearings related to a specific nomination",
      mimeType: "application/json",
    },
    readNominationHearingsCallback
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

  // Congressional Record Resources
  server.resource(
    "Congressional Record",
    "congress-gov://congressional-record",
    {
      description: "List of recent Congressional Record issues",
      mimeType: "application/json",
    },
    readCongressionalRecordCallback
  );

  server.resource(
    "Daily Congressional Record",
    new ResourceTemplate(
      "congress-gov://daily-congressional-record/{volumeNumber}/{issueNumber}",
      { list: undefined }
    ),
    {
      description: "Daily Congressional Record by volume and issue number",
      mimeType: "application/json",
    },
    readDailyCongressionalRecordCallback
  );

  server.resource(
    "Daily Congressional Record Articles",
    new ResourceTemplate(
      "congress-gov://daily-congressional-record/{volumeNumber}/{issueNumber}/articles",
      { list: undefined }
    ),
    {
      description: "Articles within a Daily Congressional Record issue",
      mimeType: "application/json",
    },
    readDailyCongressionalRecordArticlesCallback
  );

  server.resource(
    "Bound Congressional Record",
    new ResourceTemplate(
      "congress-gov://bound-congressional-record/{year}/{month}/{day}",
      { list: undefined }
    ),
    {
      description: "Bound Congressional Record by date (YYYY/MM/DD)",
      mimeType: "application/json",
    },
    readBoundCongressionalRecordCallback
  );

  // Communication Resources
  server.resource(
    "House Communication",
    new ResourceTemplate(
      "congress-gov://house-communication/{congress}/{communicationType}/{communicationNumber}",
      { list: undefined }
    ),
    {
      description:
        "Information about a specific House communication by Congress, type, and number",
      mimeType: "application/json",
    },
    readHouseCommunicationCallback
  );

  server.resource(
    "Senate Communication",
    new ResourceTemplate(
      "congress-gov://senate-communication/{congress}/{communicationType}/{communicationNumber}",
      { list: undefined }
    ),
    {
      description:
        "Information about a specific Senate communication by Congress, type, and number",
      mimeType: "application/json",
    },
    readSenateCommunicationCallback
  );

  server.resource(
    "House Requirement",
    new ResourceTemplate(
      "congress-gov://house-requirement/{requirementNumber}",
      { list: undefined }
    ),
    {
      description:
        "Information about a specific House requirement by requirement number",
      mimeType: "application/json",
    },
    readHouseRequirementCallback
  );

  server.resource(
    "House Requirement Matching Communications",
    new ResourceTemplate(
      "congress-gov://house-requirement/{requirementNumber}/matching-communications",
      { list: undefined }
    ),
    {
      description: "Matching communications for a specific House requirement",
      mimeType: "application/json",
    },
    readHouseRequirementMatchingCommunicationsCallback
  );

  // Treaty Resources
  server.resource(
    "Treaty Information",
    new ResourceTemplate("congress-gov://treaty/{congress}/{treatyNumber}", {
      list: undefined,
    }),
    {
      description:
        "Information about a specific treaty by Congress and treaty number",
      mimeType: "application/json",
    },
    readTreatyCallback
  );

  server.resource(
    "Treaty with Suffix",
    new ResourceTemplate(
      "congress-gov://treaty/{congress}/{treatyNumber}/suffix/{treatySuffix}",
      { list: undefined }
    ),
    {
      description: "Information about a partitioned treaty with suffix",
      mimeType: "application/json",
    },
    readTreatyCallback
  );

  server.resource(
    "Treaty Actions",
    new ResourceTemplate(
      "congress-gov://treaty/{congress}/{treatyNumber}/actions",
      { list: undefined }
    ),
    {
      description: "Actions taken on a specific treaty",
      mimeType: "application/json",
    },
    readTreatyActionsCallback
  );

  server.resource(
    "Treaty Committees",
    new ResourceTemplate(
      "congress-gov://treaty/{congress}/{treatyNumber}/committees",
      { list: undefined }
    ),
    {
      description: "Committees associated with a specific treaty",
      mimeType: "application/json",
    },
    readTreatyCommitteesCallback
  );

  // CRS Report Resources
  server.resource(
    "CRS Report Information",
    new ResourceTemplate("congress-gov://crsreport/{reportNumber}", {
      list: undefined,
    }),
    {
      description:
        "Information about a specific CRS (Congressional Research Service) report",
      mimeType: "application/json",
    },
    readCRSReportCallback
  );

  // Summaries Resources
  server.resource(
    "Bill Summaries",
    new ResourceTemplate("congress-gov://summaries/{congress}/{billType}", {
      list: undefined,
    }),
    {
      description: "Bill summaries for a specific congress and bill type",
      mimeType: "application/json",
    },
    readSummariesCallback
  );

  // House Vote Resources (Beta)
  server.resource(
    "House Vote Information",
    new ResourceTemplate(
      "congress-gov://house-vote/{congress}/{session}/{voteNumber}",
      { list: undefined }
    ),
    {
      description: "Information about a specific House vote (Beta)",
      mimeType: "application/json",
    },
    readHouseVoteCallback
  );

  server.resource(
    "House Vote Members",
    new ResourceTemplate(
      "congress-gov://house-vote/{congress}/{session}/{voteNumber}/members",
      { list: undefined }
    ),
    {
      description: "Member votes for a specific House vote (Beta)",
      mimeType: "application/json",
    },
    readHouseVoteMembersCallback
  );

  // Reference Resources
  server.resource(
    "Bill Types Reference",
    "congress-gov://bill-types",
    {
      description:
        "Complete list of valid bill types with descriptions and examples",
      mimeType: "application/json",
    },
    readBillTypesCallback
  );

  // Errors will be handled within the read callbacks by throwing McpError

  // Register Tools (search and subresource)
  registerTools(server);

  logger.info("MCP server instance configured successfully"); // Removed capabilities logging
  return server;
}
