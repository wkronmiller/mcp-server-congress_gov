import express, { Request, Response } from "express";
import { createServer } from "./createServer.js";
import { logger } from "./utils/index.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";

const main = async () => {
  try {
    // Get port from environment variable or use default
    const port = parseInt(process.env.PORT || "3000", 10);

    logger.info("Starting MCP server with Streamable HTTP transport", { port });

    // Create Express app for HTTP server
    const app = express();

    // Store active server instances by session ID
    const servers = new Map();

    // Handle SSE connection establishment (GET /sse)
    app.get("/sse", async (req: Request, res: Response) => {
      logger.info("New SSE connection established");

      try {
        // Create transport with message endpoint
        const transport = new SSEServerTransport("/message", res);

        // Create server instance
        const server = createServer();

        // Store server by session ID for message routing
        servers.set(transport.sessionId, { server, transport });

        // Set up cleanup on connection close
        transport.onclose = () => {
          logger.info("SSE connection closed", {
            sessionId: transport.sessionId,
          });
          servers.delete(transport.sessionId);
        };

        // Set up error handling
        transport.onerror = (error) => {
          logger.error("SSE transport error", {
            error,
            sessionId: transport.sessionId,
          });
        };

        // Connect server to transport
        await server.connect(transport);

        logger.info("MCP Server connected to SSE transport", {
          sessionId: transport.sessionId,
          totalConnections: servers.size,
        });
      } catch (error) {
        logger.error("Failed to establish SSE connection", error);
        res.status(500).end("Failed to establish SSE connection");
      }
    });

    // Handle incoming messages (POST /message)
    app.post("/message", async (req: Request, res: Response) => {
      const sessionId = req.query.sessionId as string;

      if (!sessionId) {
        res.status(400).send("Missing sessionId parameter");
        return;
      }

      const serverInstance = servers.get(sessionId);
      if (!serverInstance) {
        res.status(404).send("Session not found");
        return;
      }

      logger.debug("Received message for session", { sessionId });

      try {
        await serverInstance.transport.handlePostMessage(req, res);
      } catch (error) {
        logger.error("Failed to handle POST message", { error, sessionId });
        if (!res.headersSent) {
          res.status(500).send("Failed to process message");
        }
      }
    });

    // Start HTTP server
    app.listen(port, () => {
      logger.info("MCP Server with Streamable HTTP transport started", {
        port,
        sseEndpoint: `http://localhost:${port}/sse`,
        messageEndpoint: `http://localhost:${port}/message`,
      });
    });
  } catch (error) {
    logger.error("Failed to start server", error);
    process.exit(1);
  }
};

main();
