import {Mcp} from "../types/mcp";

const mcpRegistry = new Map<string, Mcp>();

export function registerMCP<T extends Record<string, any>>(
  mcp: Mcp,
) {

  if (mcpRegistry.has(mcp.name)) {
    throw new Error(`Tool "${mcp.name}" already registered`);
  }

  mcpRegistry.set(mcp.name, mcp);
}


export function getMCP(name: string): Mcp | undefined {
  if (!mcpRegistry.has(name)) {
    throw new Error(`Tool "${name}" not found`);
  }
  return mcpRegistry.get(name);
}

export function getAllMCP(): Mcp[] {
  return Array.from(mcpRegistry.values());
}