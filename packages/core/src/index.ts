import express from 'express';
import { loadAllTools } from './tools/loadAllTools';
import { loadAllAgents } from './agents/loadAllAgents';
import {registerAllHttpWorkflows} from "./http/registerAllHttpWorkflows";
import {config} from 'dotenv';
import {registerAllHttpChats} from "./chat/registerAllChats";
import {loadAllClients} from "./chat/loadAllClient";
import {loadAllMCP} from "./mcp/loadAllMCP";
import {serveMCP} from "./mcp/mcpRunner";

export async function createKitAgent(projectDir = process.cwd()) {
  console.log('⚙️ Initializing KitAgent...');

  config()

  const app = express();
  app.use(express.json());

  await loadAllTools(projectDir);
  await loadAllAgents(projectDir);
  await registerAllHttpWorkflows(app, projectDir);
  await loadAllClients(projectDir);
  await registerAllHttpChats(app, projectDir);
  await loadAllMCP(projectDir)
  await serveMCP(app)



  const port = process.env.PORT || 3001;
  app.listen(port, () => {
    console.log(`🚀 KitAgent running at http://localhost:${port}`);
  });
}

// Agents
export { registerAgent, getAgent } from './agents/agentRegistry';
export type { AgentConfig } from './types';

// Tools
export { registerTool, getToolHandler } from './tools/toolRegistry';

// Workflows
export { runWorkflow } from './workflows/engine/runner';
export { loadWorkflowFromYaml } from './workflows/loaders/yamlLoader';
export type { WorkflowConfig, StepConfig, Tool } from './types';

// Chat
export { registerChatClient, getChatClient } from './chat/clientRegistry'
export type { ChatClient, ChatMessage, ChatConfig } from './types';

// Utils
export {convertTools} from "./utils/convertTools";
export {validateWithZod, zodToJsonSchema} from "./utils/zodUtils";

// Re-export zod for convenience
export { z } from 'zod';