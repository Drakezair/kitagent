type ParameterSchema = StringParameter | NumberParameter | BooleanParameter | ArrayParameter | ObjectParameter | AnyParameter | EnumParameter;
interface StringParameter {
    type: "string";
    description?: string;
    nullable?: boolean;
    format?: "date-time";
}
interface NumberParameter {
    type: "number";
    description?: string;
    nullable?: boolean;
}
interface BooleanParameter {
    type: "boolean";
    description?: string;
    nullable?: boolean;
}
interface ArrayParameter {
    type: "array";
    items: ParameterSchema;
    description?: string;
    nullable?: boolean;
}
interface ObjectParameter {
    type: "object";
    properties: Record<string, ParameterSchema>;
    required?: string[];
    description?: string;
    nullable?: boolean;
}
interface EnumParameter {
    type: "enum";
    values: string[];
    description?: string;
    nullable?: boolean;
}
interface AnyParameter {
    type: "any";
    description?: string;
    nullable?: boolean;
}
type ParametersDefinition = Record<string, ParameterSchema>;

type Tool<T = any> = {
    name: string;
    description: string;
    parameters: ParametersDefinition;
    execute: ToolHandler<T>;
};
type StepConfig<T = any> = {
    name: string;
    agent?: AgentConfig;
    tool?: string;
};
type WorkflowHttpConfig = {
    method?: string;
    path: string;
};
type WorkflowConfig = {
    name: string;
    steps: StepConfig[];
    globals?: Record<string, any>;
    http?: WorkflowHttpConfig;
};
type ToolHandler<T = any> = ({ params, context }: {
    params: Partial<T>;
    context: WorkflowContext;
}) => Promise<Record<any, any>>;
type AgentConfig<T = any> = {
    name: string;
    description: string;
    parameters: ParametersDefinition;
    tools?: string[];
    task: ({ params, context, tools }: {
        params: Partial<T>;
        context: WorkflowContext;
        tools: Record<any, Tool>;
    }) => Promise<Record<any, any>>;
};
interface WorkflowContext {
    get<T = any>(key: string): T | undefined;
    set<T = any>(key: string, value: T): void;
    has(key: string): boolean;
    merge(data: Record<string, any>): void;
    toJSON(): Record<string, any>;
    previousStepResult(): any;
    getWorkflowGlobals(): any;
    setWorkflowGlobals(workflow: any): void;
}
interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
    [key: string]: any;
}
interface SessionData {
    id: string;
    messages: ChatMessage[];
}
interface SessionStore {
    getSession(id: string): Promise<SessionData>;
    saveMessage(sessionId: string, message: ChatMessage): Promise<void>;
    clearSession(id: string): Promise<void>;
}
interface ChatClient {
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
type ChatConfig = {
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

declare function registerAgent<TParams extends Record<string, any>>(agent: AgentConfig<TParams>): void;
declare function getAgent(name: string): AgentConfig;

declare function registerTool<T extends Record<string, any>>(tool: Tool<T>): void;
declare function getToolHandler(name: string): ToolHandler;

declare function runWorkflow(config: WorkflowConfig, parameters?: Record<string, any>): Promise<any>;

declare function loadWorkflowFromYaml(path: string): WorkflowConfig;

declare function registerChatClient(name: string, client: ChatClient): void;
declare function getChatClient(name: string): ChatClient;

declare function createKitAgent(projectDir?: string): Promise<void>;

export { type AgentConfig, type ChatClient, type ChatConfig, type ChatMessage, type StepConfig, type WorkflowConfig, createKitAgent, getAgent, getChatClient, getToolHandler, loadWorkflowFromYaml, registerAgent, registerChatClient, registerTool, runWorkflow };
