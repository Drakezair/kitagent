import {Tool} from "../types";

export function convertTools(tools: Record<any, Tool>){

  return Object.entries(tools)
    .map(([name, tool]) => ({
      type: "function",
      function: {
        name: tool.name,
        description: tool.description,
        parameters: {type: "object", properties: tool.parameters},
      },
    }));
}