import { Tool } from "../types";
import { zodToJsonSchema } from "./zodUtils";

export function convertTools(tools: Record<any, Tool>) {
  return Object.entries(tools)
    .map(([name, tool]) => {
      // Convert Zod schema to JSON Schema format
      const parametersSchema = zodToJsonSchema(tool.parameters);

      return {
        type: "function",
        function: {
          name: tool.name,
          description: tool.description,
          parameters: parametersSchema,
        },
      };
    });
}