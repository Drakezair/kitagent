import {getAllMCP} from "./registryMCP";
import {McpServer} from "@modelcontextprotocol/sdk/server/mcp";
import {getTool} from "../tools/toolRegistry";
import {StreamableHTTPServerTransport} from "@modelcontextprotocol/sdk/server/streamableHttp";
import express from "express";


export async function serveMCP(app: express.Express) {
  const mcps = getAllMCP();
  await Promise.all(
    mcps.map(async (mcp) => {
      const server = new McpServer({
        name: mcp.name,
        description: mcp.description,
        version: mcp.version
      });

      // Register tools if they exist
      if (mcp?.tools?.length && mcp?.tools?.length > 0) {
        mcp.tools.forEach(toolName => {
          const tool = getTool(toolName);
          if (!tool) {
            throw new Error(`Tool ${toolName} not found`);
          }

          server.tool(
            tool.name,
            tool.parameters as any,
            // @ts-ignore
            async (params: Record<string, any>) => {
              // Execute the tool and return its result
              const result = await tool.execute({
                params,
              });

              return {
                content: [{
                  type: "text",
                  text: JSON.stringify(result)
                }]
              }
            }
          );
        });
      }

      // Configure the server if custom configuration is needed
      await mcp.server({server});

      // Create transport
      const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: undefined
      });

      // Connect server to transport

      // Handle POST requests
      app.post(mcp.path, async (req: express.Request, res: express.Response) => {
        console.log('Received MCP requests:', req.body);
        try {
          await transport.handleRequest(req, res, req.body);
        } catch (error) {
          console.error('Error handling MCP request:', error);
          if (!res.headersSent) {
            res.status(500).json({
              jsonrpc: '2.0',
              error: {
                code: -32603,
                message: 'Internal server error',
              },
              id: null,
            });
          }
        }
      });

      // Handle GET requests - Method not allowed
      app.get(mcp.path, async (_req: express.Request, res: express.Response) => {
        try {
          res.status(200).json({})
        } catch (error) {
          console.error('Error handling MCP request:', error);
          if (!res.headersSent) {
            res.status(500).json({
              jsonrpc: '2.0',
              error: {
                code: -32603,
                message: 'Internal server error',
              },
              id: null,
            });
          }
        }
      });

      // Handle DELETE requests - Method not allowed
      app.delete(mcp.path, async (_req: express.Request, res: express.Response) => {
        console.log('Received DELETE MCP request');
        res.status(405).json({
          jsonrpc: "2.0",
          error: {
            code: -32000,
            message: "Method not allowed."
          },
          id: null
        });
      });

      await server.connect(transport);

    }));
}