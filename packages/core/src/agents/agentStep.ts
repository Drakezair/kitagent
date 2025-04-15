import {StepConfig, Tool, WorkflowContext} from '../types';
import {validateInputWithParameters} from "../utils/validateParameters";
import {getAgent} from "./agentRegistry";
import {getTool} from "../tools/toolRegistry";

export async function runAgentStep({step, context, parameters}: {
  step: StepConfig,
  context: WorkflowContext,
  parameters: Record<string, any>
}) {
  const agent = getAgent(step?.agent!.name);

  if(!agent) {
    return {
      error: {
        name: "Agent not found",
        message: `Agent "${step.agent?.name}" not found`
      }
    }
  }

  const validInput = validateInputWithParameters(parameters, agent?.parameters!);
  if (!validInput.valid) {
    return {
      error: {
        name: "Invalid input",
        message: validInput.errors
      }
    }

  }

  // return tool in object format with reduce
  const tools = step?.agent?.tools?.reduce((acc, toolName) => {
    const tool = getTool(toolName);
    if (tool) {
      acc[tool.name] = tool;
    }
    return acc;
  }, {} as Record<string, Tool>) || {};

  return await agent?.task({
    params: parameters,
    context,
    tools: tools,
  });
}
