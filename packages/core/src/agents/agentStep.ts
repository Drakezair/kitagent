import { StepConfig, Tool, WorkflowContext } from '../types';
import { getAgent } from "./agentRegistry";
import { getTool } from "../tools/toolRegistry";
import { validateWithZod } from "../utils/zodUtils";
import {z} from "zod";

export async function runAgentStep({step, context, parameters}: {
  step: StepConfig,
  context: WorkflowContext,
  parameters: z.ZodRawShape
}) {
  const agent = getAgent(step?.agent!.name);

  if (!agent) {
    return {
      error: {
        name: "Agent not found",
        message: `Agent "${step.agent?.name}" not found`
      }
    };
  }

  // Validate with Zod
  const validation = validateWithZod(agent.parameters, parameters);
  if (!validation.success) {
    return {
      error: {
        name: "Invalid input",
        message: validation.errors.errors.map(err =>
          `${err.path.join('.')}: ${err.message}`
        ).join(', ')
      }
    };
  }

  // Get tools
  const tools = step?.agent?.tools?.reduce((acc, toolName) => {
    const tool = getTool(toolName);
    if (tool) {
      acc[tool.name] = tool;
    }
    return acc;
  }, {} as Record<string, Tool>) || {};

  // Execute the agent task with validated data
  return await agent?.task({
    params: validation.data as any,
    context,
    tools: tools,
  });
}