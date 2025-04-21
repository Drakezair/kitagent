import { getTool } from '../tools/toolRegistry';
import { StepConfig, WorkflowContext } from '../types';
import { validateWithZod } from '../utils/zodUtils';

export async function runToolStep({step, context, parameters}: {
  step: StepConfig,
  context: WorkflowContext,
  parameters: Record<string, any>
}) {
  const tool = getTool(step?.tool!);

  // Validate with Zod
  const validation = validateWithZod(tool!.parameters, parameters);
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

  // Execute the tool with validated data
  return await tool?.execute({
    params: validation.data,
    context
  });
}