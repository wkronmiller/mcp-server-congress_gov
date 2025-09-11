import { Router, Request, Response } from "express";
import { CongressApiService } from "../../services/CongressApiService.js";
import { CongressSearchParams, TOOL_PARAMS as SearchParams } from "../../tools/search/searchParams.js";
import { CongressGetSubResourceParams, TOOL_PARAMS as SubResourceParams } from "../../tools/subresource/getSubResourceParams.js";
import { handleApiError, sendSuccessResponse } from "../utils/responses.js";
import { logger } from "../../utils/index.js";
import { z } from "zod";
import { 
  ApiError,
  ValidationError 
} from "../../utils/errors.js";

const router = Router();
const congressApiService = new CongressApiService();

// Create Zod schemas for validation
const SearchSchema = z.object(SearchParams);
const SubResourceSchema = z.object(SubResourceParams);

/**
 * Helper function to extract data from MCP tool response
 */
function extractToolData(mcpResponse: any): any {
  if (mcpResponse && typeof mcpResponse === 'object') {
    // MCP tool responses typically have content array
    if (Array.isArray(mcpResponse.content) && mcpResponse.content.length > 0) {
      const content = mcpResponse.content[0];
      if (content.type === 'text' && content.text) {
        try {
          return JSON.parse(content.text);
        } catch (e) {
          logger.warn("Failed to parse tool response text as JSON", { error: e });
          return content.text;
        }
      }
    }
  }
  return mcpResponse;
}

// Search tool: POST /api/search
router.post("/search", async (req: Request, res: Response) => {
  try {
    logger.debug("Processing search request", { body: req.body });
    
    // Validate request body
    const validatedParams = SearchSchema.parse(req.body);
    
    // Use the CongressApiService directly since we're not going through MCP
    // Convert the validated params to SearchParams format
    const searchParams = {
      query: validatedParams.query,
      offset: validatedParams.offset,
      limit: validatedParams.limit,
      sort: validatedParams.sort,
      filters: validatedParams.filters
    };
    
    const result = await congressApiService.searchCollection(
      validatedParams.collection,
      searchParams
    );
    
    sendSuccessResponse(res, result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const validationError = new ValidationError("Request validation failed", error.errors);
      handleApiError(res, validationError, "search tool validation");
    } else {
      handleApiError(res, error, "search tool");
    }
  }
});

// Sub-resource tool: GET /api/subresource
// Using query parameters for RESTful approach
router.get("/subresource", async (req: Request, res: Response) => {
  try {
    logger.debug("Processing sub-resource request", { query: req.query });
    
    // Convert query parameters to the expected format
    const params = {
      parentUri: req.query.parentUri as string,
      subResource: req.query.subResource as string,
      limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
      offset: req.query.offset ? parseInt(req.query.offset as string, 10) : undefined
    };
    
    // Validate parameters
    const validatedParams = SubResourceSchema.parse(params);
    
    // Use the CongressApiService directly
    const result = await congressApiService.getSubResource(
      validatedParams.parentUri,
      validatedParams.subResource,
      {
        limit: validatedParams.limit,
        offset: validatedParams.offset
      }
    );
    
    sendSuccessResponse(res, result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const validationError = new ValidationError("Request validation failed", error.errors);
      handleApiError(res, validationError, "sub-resource tool validation");
    } else {
      handleApiError(res, error, "sub-resource tool");
    }
  }
});

// Alternative RESTful sub-resource endpoint pattern
// GET /api/:resourceType/:resourceId/:subResource
router.get("/:resourceType/:resourceId/:subResource", async (req: Request, res: Response) => {
  try {
    const { resourceType, resourceId, subResource } = req.params;
    
    // Construct the parent URI based on resource type
    let parentUri: string;
    
    switch (resourceType) {
      case "bills":
        // Expect resourceId format like "117-hr-3076" 
        const billParts = resourceId.split("-");
        if (billParts.length !== 3) {
          throw new ValidationError("Invalid bill resource ID format. Expected: {congress}-{billType}-{billNumber}");
        }
        parentUri = `congress-gov://bill/${billParts[0]}/${billParts[1]}/${billParts[2]}`;
        break;
      case "members":
        parentUri = `congress-gov://member/${resourceId}`;
        break;
      case "committees":
        // Expect resourceId format like "117-house-HSAG00"
        const committeeParts = resourceId.split("-");
        if (committeeParts.length !== 3) {
          throw new ValidationError("Invalid committee resource ID format. Expected: {congress}-{chamber}-{committeeCode}");
        }
        parentUri = `congress-gov://committee/${committeeParts[0]}/${committeeParts[1]}/${committeeParts[2]}`;
        break;
      case "amendments":
        // Similar pattern for amendments if needed
        parentUri = `congress-gov://amendment/${resourceId}`;
        break;
      case "nominations":
        parentUri = `congress-gov://nomination/${resourceId}`;
        break;
      case "treaties":
        parentUri = `congress-gov://treaty/${resourceId}`;
        break;
      default:
        throw new ValidationError(`Unsupported resource type: ${resourceType}`);
    }
    
    logger.debug("Processing RESTful sub-resource request", { 
      resourceType, 
      resourceId, 
      subResource, 
      parentUri 
    });
    
    // Validate the constructed parameters
    const params = {
      parentUri,
      subResource,
      limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
      offset: req.query.offset ? parseInt(req.query.offset as string, 10) : undefined
    };
    
    const validatedParams = SubResourceSchema.parse(params);
    
    // Use the CongressApiService directly
    const result = await congressApiService.getSubResource(
      validatedParams.parentUri,
      validatedParams.subResource,
      {
        limit: validatedParams.limit,
        offset: validatedParams.offset
      }
    );
    
    sendSuccessResponse(res, result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const validationError = new ValidationError("Request validation failed", error.errors);
      handleApiError(res, validationError, "RESTful sub-resource validation");
    } else {
      handleApiError(res, error, "RESTful sub-resource");
    }
  }
});

export { router as toolRoutes };