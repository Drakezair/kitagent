import { z } from 'zod';

export type Tool<T = any> = {
  name: string;
  description: string;
  parameters: any;
  execute: ToolHandler<T>;
};

export type StepConfig<T = any> = {
  name: string;
  agent?: AgentConfig;
  tool?: string;
};

export type WorkflowHttpConfig = {
  method?: string; // GET, POST, etc.
  path: string;    // ruta del endpoint
};

export type WorkflowConfig = {
  name: string;
  steps: StepConfig[];
  globals?: Record<string, any>;
  http?: WorkflowHttpConfig;
};

export type ToolHandler<T = any> = ({params, context}: {
  params: Partial<T>,
  context?: WorkflowContext
}) => Promise<Record<any, any>>;

export type AgentConfig<T = any> = {
  name: string;
  description: string;
  parameters: any;
  tools?: string[];
  task: ({params, context, tools}: {
    params: Partial<T>, context: WorkflowContext, tools: Record<any, Tool>
  }) => Promise<Record<any, any>>;
};

export interface WorkflowContext {
  get<T = any>(key: string): T | undefined;
  set<T = any>(key: string, value: T): void;
  has(key: string): boolean;
  merge(data: Record<string, any>): void;
  toJSON(): Record<string, any>;
  previousStepResult(): any;
  getWorkflowGlobals(): any;
  setWorkflowGlobals(workflow: any): void;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  [key: string]: any;
}

export interface SessionData {
  id: string;
  messages: ChatMessage[];
}

export interface SessionStore {
  getSession(id: string): Promise<SessionData>;
  saveMessage(sessionId: string, message: ChatMessage): Promise<void>;
  clearSession(id: string): Promise<void>;
}

export interface ChatClient {
  chat(args: {
    sessionId: string;
    session: {
      id: string;
      messages: {
        role: 'user' | 'assistant' | 'system' | 'tool';
        content: string;
        [key: string]: any;
      }[];
    };
    tools?: Record<any, any>;
    context: Record<string, any>;
    store: SessionStore;
  }): Promise<string>;
}

export type ChatConfig = {
  name: string;
  description?: string;
  type: 'chat';
  client: string;
  tools?: string[];
  globals?: Record<string, any>;
  http?: {
    method?: 'get' | 'post' | 'put' | 'delete';
    path?: string;
  };
};