import { AgentConfig } from '../types';
import { z } from 'zod';

const agents = new Map<string, AgentConfig>();

export function registerAgent<TParams extends Record<string, any>>(
  agent: AgentConfig<TParams>
) {
  // Check if the agent schema is valid
  if (!(agent.parameters instanceof z.ZodObject)) {
    throw new Error(`Agent "${agent.name}" parameters must be a Zod object schema`);
  }

  if (agents.has(agent.name)) {
    throw new Error(`Agent "${agent.name}" already registered`);
  }

  agents.set(agent.name, agent);
}

export function getAgent(name: string): AgentConfig {
  const agent = agents.get(name);
  if (!agent) throw new Error(`Agent "${name}" not found`);
  return agent;
}