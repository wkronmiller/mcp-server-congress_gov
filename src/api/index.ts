import { Router } from "express";
import { logger } from "../utils/index.js";
import { resourceRoutes } from "./routes/resources.js";
import { toolRoutes } from "./routes/tools.js";

/**
 * Creates and configures the main API router with all routes.
 */
export function createApiRouter(): Router {
  logger.info("Creating API router");
  
  const router = Router();
  
  // Mount resource routes
  router.use("/", resourceRoutes);
  
  // Mount tool routes  
  router.use("/", toolRoutes);
  
  // API info endpoint
  router.get("/", (req, res) => {
    res.json({
      name: "Congress.gov MCP API",
      version: "1.0.0",
      description: "REST API for Congress.gov data",
      endpoints: {
        resources: {
          "GET /api/bills/{congress}/{billType}/{billNumber}": "Get bill information",
          "GET /api/members/{memberId}": "Get member information", 
          "GET /api/congress/{congress}": "Get congress information",
          "GET /api/committees/{congress}/{chamber}/{committeeCode}": "Get committee information",
          "GET /api/info/overview": "Get API overview",
          "GET /api/info/current-congress": "Get current congress info"
        },
        tools: {
          "POST /api/search": "Search across collections",
          "GET /api/{resourceType}/{resourceId}/{subResource}": "Get sub-resource data"
        }
      }
    });
  });
  
  logger.info("API router created successfully");
  return router;
}