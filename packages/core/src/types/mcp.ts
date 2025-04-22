import {McpServer} from "@modelcontextprotocol/sdk/server/mcp"

export interface Mcp {
  name: string;
  description: string;
  version: string;
  path: string;
  tools?: string[];
  server: (
    {
      server,
    }:
    {
      server: McpServer,
    }) => Promise<void>;
}


