import { AgentConfig } from '../types';
import {validateParametersSchema} from "../utils/validateParameters";

const agents = new Map<string, AgentConfig>();

export function registerAgent<TParams extends Record<string, any>>(
  agent: AgentConfig<TParams>
) {

  if (agents.has(agent.name)) {
    throw new Error(`Agent "${agent.name}" already registered`);
  }
  const error = validateParametersSchema(agent.parameters);
  if (
    error.length > 0
  ) {
    throw new Error(`Agent "${agent.name}" has invalid parameters: ${error.join(", ")}`);
  }
  agents.set(agent.name, agent);
}

export function getAgent(name: string): AgentConfig {
  const agent = agents.get(name);
  if (!agent) throw new Error(`Agent "${name}" not found`);
  return agent;
}
