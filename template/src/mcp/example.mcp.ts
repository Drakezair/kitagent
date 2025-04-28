import {McpServer} from '@modelcontextprotocol/sdk/server/mcp';
import {registerMCP, z} from "kitagent";

const exampleMcp = {
  name: 'example-mcp',
  description: 'Example MCP for calculator service',
  version: '1.0.0',
  path: '/mcp/calculator',
  tools: ["calculator"],
  server: async ({server}: { server: McpServer }) => {
    // Additional server setup can be done here if needed
    server.tool(
      "calcr",
      {a: z.number(), b: z.number()},
      async () => {
        return {
          content: [
            {type: "text", text: "Hello World"},
          ]
        }
      }
    )
  }
};

registerMCP(exampleMcp);

export default exampleMcp;