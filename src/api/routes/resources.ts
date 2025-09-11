import { Router, Request, Response } from "express";
import { CongressApiService } from "../../services/CongressApiService.js";
import { 
  handleBillResource,
  handleMemberResource,
  handleCongressResource,
  handleCommitteeResource,
  handleInfoOverviewResource,
  handleInfoCurrentCongressResource 
} from "../../resourceHandlers.js";
import { handleApiError, sendSuccessResponse } from "../utils/responses.js";
import { logger } from "../../utils/index.js";

const router = Router();
const congressApiService = new CongressApiService();

/**
 * Helper function to extract clean JSON data from MCP resource response
 */
function extractResourceData(mcpResponse: any): any {
  // Handle array format from resource handlers
  if (Array.isArray(mcpResponse)) {
    if (mcpResponse.length > 0) {
      const resource = mcpResponse[0];
      if (resource && resource.text) {
        try {
          return JSON.parse(resource.text);
        } catch (e) {
          logger.warn("Failed to parse resource text as JSON", { error: e });
          return { content: resource.text };
        }
      }
    }
    return { contents: mcpResponse };
  }
  
  // Handle object format with contents array
  if (mcpResponse && mcpResponse.contents && Array.isArray(mcpResponse.contents)) {
    if (mcpResponse.contents.length > 0) {
      const resource = mcpResponse.contents[0];
      if (resource && resource.text) {
        try {
          return JSON.parse(resource.text);
        } catch (e) {
          logger.warn("Failed to parse resource text as JSON", { error: e });
          return { content: resource.text };
        }
      }
    }
    return mcpResponse;
  }
  
  // Return as-is if it's already clean data
  return mcpResponse;
}

// Bill resource: GET /api/bills/:congress/:billType/:billNumber
router.get("/bills/:congress/:billType/:billNumber", async (req: Request, res: Response) => {
  try {
    const { congress, billType, billNumber } = req.params;
    const uri = `congress-gov://bill/${congress}/${billType}/${billNumber}`;
    
    logger.debug("Processing bill resource request", { congress, billType, billNumber });
    
    const mcpResponse = await handleBillResource(uri, congressApiService);
    const data = extractResourceData(mcpResponse);
    
    sendSuccessResponse(res, data);
  } catch (error) {
    handleApiError(res, error, "bill resource");
  }
});

// Member resource: GET /api/members/:memberId
router.get("/members/:memberId", async (req: Request, res: Response) => {
  try {
    const { memberId } = req.params;
    const uri = `congress-gov://member/${memberId}`;
    
    logger.debug("Processing member resource request", { memberId });
    
    const mcpResponse = await handleMemberResource(uri, congressApiService);
    const data = extractResourceData(mcpResponse);
    
    sendSuccessResponse(res, data);
  } catch (error) {
    handleApiError(res, error, "member resource");
  }
});

// Congress resource: GET /api/congress/:congress
router.get("/congress/:congress", async (req: Request, res: Response) => {
  try {
    const { congress } = req.params;
    const uri = `congress-gov://congress/${congress}`;
    
    logger.debug("Processing congress resource request", { congress });
    
    const mcpResponse = await handleCongressResource(uri, congressApiService);
    const data = extractResourceData(mcpResponse);
    
    sendSuccessResponse(res, data);
  } catch (error) {
    handleApiError(res, error, "congress resource");
  }
});

// Committee resource: GET /api/committees/:congress/:chamber/:committeeCode
router.get("/committees/:congress/:chamber/:committeeCode", async (req: Request, res: Response) => {
  try {
    const { congress, chamber, committeeCode } = req.params;
    const uri = `congress-gov://committee/${congress}/${chamber}/${committeeCode}`;
    
    logger.debug("Processing committee resource request", { congress, chamber, committeeCode });
    
    const mcpResponse = await handleCommitteeResource(uri, congressApiService);
    const data = extractResourceData(mcpResponse);
    
    sendSuccessResponse(res, data);
  } catch (error) {
    handleApiError(res, error, "committee resource");
  }
});

// Info overview: GET /api/info/overview
router.get("/info/overview", async (req: Request, res: Response) => {
  try {
    const uri = "congress-gov://info/overview";
    
    logger.debug("Processing info overview request");
    
    const mcpResponse = await handleInfoOverviewResource(uri);
    const data = extractResourceData(mcpResponse);
    
    sendSuccessResponse(res, data);
  } catch (error) {
    handleApiError(res, error, "info overview");
  }
});

// Current congress info: GET /api/info/current-congress
router.get("/info/current-congress", async (req: Request, res: Response) => {
  try {
    const uri = "congress-gov://info/current-congress";
    
    logger.debug("Processing current congress info request");
    
    const mcpResponse = await handleInfoCurrentCongressResource(uri);
    const data = extractResourceData(mcpResponse);
    
    sendSuccessResponse(res, data);
  } catch (error) {
    handleApiError(res, error, "current congress info");
  }
});

export { router as resourceRoutes };