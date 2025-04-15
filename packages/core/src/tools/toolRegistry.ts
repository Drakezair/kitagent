import {Tool, ToolHandler} from '../types';
import {validateParametersSchema} from "../utils/validateParameters";

const toolRegistry = new Map<string, Tool>();

export function registerTool<T extends Record<string, any>>(
  tool: Tool<T>,
) {
  const error = validateParametersSchema(tool.parameters);
  if (
    error.length > 0
  ) {
    throw new Error(`Tool "${tool.name}" has invalid parameters: ${error.join(", ")}`);
  }
  if (toolRegistry.has(tool.name)) {
    throw new Error(`Tool "${name}" already registered`);
  }
  toolRegistry.set(tool.name, tool);
}

export function getToolHandler(name: string): ToolHandler {
  const tool = toolRegistry.get(name);
  if (!tool) throw new Error(`Tool "${name}" not found`);
  return tool.execute;
}

export function getTool(name: string): Tool | undefined {
  if (!toolRegistry.has(name)) {
    throw new Error(`Tool "${name}" not found`);
  }
  return toolRegistry.get(name);
}
