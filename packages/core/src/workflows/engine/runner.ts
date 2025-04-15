import {WorkflowConfig} from "../../types";
import {runToolStep} from "../../tools/toolStep";
import {Context} from "./context";
import {getAgent} from "../../agents/agentRegistry";
import {interpolate} from "../../utils/interpolate";
import {runAgentStep} from "../../agents/agentStep";

export async function runWorkflow(config: WorkflowConfig, parameters: Record<string, any> = {}): Promise<any> {
  const context = new Context();
  context.setWorkflowGlobals(config.globals);

  for (const step of config.steps) {
    if (step.agent && step.tool) {
      throw new Error(`Step ${step.name} cannot have both agent and tool defined`);
    }
    if (step.agent) {
      const agent = getAgent(step.agent.name);

      const result = await runAgentStep({
        step,
        context,
        parameters,
      })
      context.set(step.name, result);
      context.setPreviousStepResult(result);
      continue;
    }
    const result = await runToolStep({
      step,
      context,
      parameters,
    });
    context.set(step.name, result);
    context.setPreviousStepResult(result);
  }

  return context.previousStepResult();
}
