import {getTool, getToolHandler} from '../tools/toolRegistry';
import {StepConfig, WorkflowContext} from '../types';
import {validateInputWithParameters} from "../utils/validateParameters";

export async function runToolStep({step, context, parameters}: {
  step: StepConfig,
  context: WorkflowContext,
  parameters: Record<string, any>
}) {
  const tool = getTool(step?.tool!);

  const validInput = validateInputWithParameters(parameters, tool?.parameters!);
  if (!validInput.valid) {
    return {
      error: {
        name: "Invalid input",
        message: validInput.errors
      }
    }

  }
  return await tool?.execute({
    params: parameters,
    context
  });
}
