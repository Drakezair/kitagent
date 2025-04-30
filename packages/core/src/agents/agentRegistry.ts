import { Agent } from '../types';
import { z } from 'zod';

const agents = new Map<string, Agent>();

export function registerAgent<TParams extends Record<string, any>>(
  agent: Agent<TParams>
) {

  if (agents.has(agent.name)) {
    throw new Error(`Agent "${agent.name}" already registered`);
  }

  agents.set(agent.name, agent);
}

export function getAgent(name: string): Agent {
  const agent = agents.get(name);
  if (!agent) throw new Error(`Agent "${name}" not found`);
  return agent;
}