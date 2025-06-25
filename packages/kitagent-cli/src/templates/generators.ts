import fs from 'fs-extra';
import path from 'path';

/**
 * Templates for generating the project files
 */
export const templates = {
  // Root files
  packageJson: (projectName: string) => `{
  "name": "${projectName}",
  "version": "0.1.0",
  "description": "A workflow-based API project using KitAgent",
  "scripts": {
    "dev": "tsx src/index.ts",
    "dev:watch": "nodemon",
    "build": "tsc",
    "start": "node dist/index.js"
  },
  "type": "module",
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.10.1",
    "axios": "^1.9.0",
    "dotenv": "^16.4.7",
    "express": "^5.1.0",
    "is-glob": "^4.0.3",
    "kitagent": "^1.0.18",
    "openai": "^4.92.1",
    "tsx": "^4.19.3",
    "uuid": "^11.1.0",
    "zod": "^3.24.3",
    "zod-to-json-schema": "^3.24.5"
  },
  "devDependencies": {
    "@types/node": "^22.14.0",
    "nodemon": "^3.1.9",
    "ts-node": "^10.9.2",
    "typescript": "^5.8.3"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}`,

  tsconfig: () => `{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "Node",
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true,
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": [
    "src"
  ]
}`,

  readme: (projectName: string) => `# ${projectName}

A ticket management system built with KitAgent, showcasing workflows, tools, agents, and AI integration.

## Getting Started

1. Copy \`.env.example\` to \`.env\` and fill in your OpenAI API key:

\`\`\`bash
cp .env.example .env
\`\`\`

2. Install dependencies:

\`\`\`bash
npm install
\`\`\`

3. Start the development server:

\`\`\`bash
npm run dev
\`\`\`

The API will be available at http://localhost:3001.

## Project Structure

- **models/** - Data models and storage
- **tools/** - Tools for performing operations (create/read/update tickets)
- **workflows/** - API endpoints defined as YAML workflows
- **agents/** - AI agents that use tools to perform complex tasks
- **clients/** - Chat clients for communication with AI services
- **mcp/** - Model Context Protocol implementations

## API Endpoints

- POST \`/api/ticket\` - Create a new ticket
- GET \`/api/ticket\` - Get all tickets
- GET \`/api/ticket/:id\` - Get a ticket by ID
- POST \`/api/generate-ticket\` - Generate a ticket from a user story
- POST \`/chat/pm-assistant\` - Chat with the project management assistant

## Development

To run the server with automatic restart on file changes:

\`\`\`bash
npm run dev:watch
\`\`\`

## Building for Production

\`\`\`bash
npm run build
npm start
\`\`\`

## License

MIT
`,

  gitignore: () => `node_modules
.env
.idea
dist
`,

  envExample: () => `PORT=3001
OPENAI_API_KEY=sk-...`,

  nodemon: () => `{
  "watch": ["src"],
  "ext": "ts,tsx,yml",
  "exec": "tsx src/index.ts"
}`,

  // Source files
  indexTs: () => `import { createKitAgent } from 'kitagent';

createKitAgent("./src");`,

  // Models
  ticketsModel: () => `// models/ticket.model.ts
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';

// Define ticket schema for validation
export const TicketSchema = {
  id: z.string().optional().describe("Unique identifier for the ticket"),
  title: z.string().describe("Title"),
  description: z.string().describe("Description"),
  status: z.enum(['open', 'in-progress', 'closed']).describe("Status of the ticket (open, in-progress, closed)"),
  priority: z.enum(['low', 'medium', 'high']).describe("Priority of the ticket (open, in-progress, closed)"),
};

// Type derived from the schema
export type Ticket = z.infer<typeof TicketSchema>;

// In-memory storage for tickets
export class TicketStore {
  private static tickets: Map<string, Ticket> = new Map();

  static addTicket(ticket: Ticket): Ticket {
    // Generate ID if not provided
    ticket.id = uuidv4();

    this.tickets.set(ticket.id!, ticket);
    return ticket;
  }

  static getTicket(id: string): Ticket | undefined {
    return this.tickets.get(id);
  }

  static getTicketByTitle(title: string): Ticket | undefined {
    for (const ticket of this.tickets.values()) {
      if (ticket.title === title) {
        return ticket;
      }
    }
    return undefined;
  }

  static updateTicket(id: string, updates: Partial<Ticket>): Ticket | undefined {
    const ticket = this.tickets.get(id);
    if (!ticket) return undefined;

    const updatedTicket = { ...ticket, ...updates };
    this.tickets.set(id, updatedTicket);
    return updatedTicket;
  }

  static deleteTicket(id: string): boolean {
    return this.tickets.delete(id);
  }

  static getAllTickets(): Ticket[] {
    return Array.from(this.tickets.values());
  }
}`,

  // Tools
  createTicketTool: () => `import { registerTool, Tool } from "kitagent";
import { z } from "zod";
import { TicketSchema, TicketStore } from "../models/tickets";

const createTicketTool: Tool = {
  name: "createTicket",
  description: "Create a ticket",
  parameters: TicketSchema,
  execute: async ({params, context}) => {
    let data;
    if (context?.previousStepResult())
      data = context?.previousStepResult();
    else
      data = params;

    const ticket = TicketStore.addTicket(data);

    // Simulate ticket creation
    return {
      status: "success",
      message: \`Ticket "\${params.title}" created successfully!\`,
      ticket
    };
  }
};

registerTool(createTicketTool);`,

  getTicketByIdTool: () => `import { registerTool, Tool } from "kitagent";
import { z } from "zod";
import { TicketStore } from "../models/tickets";

const GetTicketByIdTool: Tool = {
  name: "getTicketById",
  description: "Get a ticket by ID",
  parameters: {
    id: z.string().describe("The ID of the ticket to retrieve")
  },
  execute: async ({params, context}) => {
    let id;
    if(context?.previousStepResult())
      id = context?.previousStepResult();
    else
      id = params.id;

    // Fetch ticket by ID
    const ticket = TicketStore.getTicket(id);
    if (!ticket) {
      throw new Error(\`Ticket with ID "\${params.id}" not found\`);
    }
    return ticket;
  }
};

registerTool(GetTicketByIdTool);`,

  getTicketByTitleTool: () => `import { registerTool, Tool } from "kitagent";
import { z } from "zod";
import { TicketStore } from "../models/tickets";

const GetTicketByTitleTool: Tool = {
  name: "getTicketByTitle",
  description: "Get a ticket by title",
  parameters: {
    title: z.string().describe("The title of the ticket to retrieve")
  },
  execute: async ({params, context}) => {
    let title;
    if (context?.previousStepResult())
      title = context?.previousStepResult();
    else
      title = params.title;

    // Simulate fetching a ticket by title
    const ticket = TicketStore.getTicketByTitle(title);
    if (!ticket) {
      throw new Error(\`Ticket with title "\${params.title}" not found\`);
    }
    return ticket;
  }
};

registerTool(GetTicketByTitleTool);`,

  getTicketsTool: () => `import { registerTool, Tool } from "kitagent";
import { TicketStore } from "../models/tickets";
import { z } from "zod";

const getTicketsTool: Tool = {
  name: "getTickets",
  description: "Get a list of tickets",
  parameters: {},
  execute: async ({params, context}) => {
    const tickets = TicketStore.getAllTickets();
    return tickets;
  },
};

registerTool(getTicketsTool);`,

  updateTicketTool: () => `import { registerTool, Tool } from "kitagent";
import { TicketSchema, TicketStore } from "../models/tickets";

const updateTicketTool: Tool = {
  name: "updateTicket",
  description: "Update a ticket",
  parameters: TicketSchema,
  execute: async ({params, context}) => {
    let data;
    if (context?.previousStepResult())
      data = context?.previousStepResult();
    else
      data = params;

    const ticket = TicketStore.updateTicket(data.id!, data);

    // Simulate ticket creation
    return {
      status: "success",
      message: \`Ticket "\${params.title}" updated successfully!\`,
      ticket
    };
  }
};

registerTool(updateTicketTool);`,

  // Workflows
  createTicketWorkflow: () => `name: create-ticket
http:
  method: post
  path: /api/ticket

steps:
  - name: createTicket
    tool: createTicket`,

  getTicketWorkflow: () => `name: get-ticket
http:
  method: get
  path: /api/ticket/:id

steps:
  - name: getTicketById
    tool: getTicketById`,

  getAllTicketsWorkflow: () => `name: get-all-tickets
http:
  method: get
  path: /api/ticket

steps:
  - name: getTickets
    tool: getTickets`,

  generateTicketWorkflow: () => `name: generate-ticket
http:
  method: post
  path: /api/generate-ticket

steps:
  - name: generateTicket
    agent:
      name: generateTicket
      tools:
        - createTicket`,

  // Agents
  generateTicketAgent: () => `import { registerAgent, z } from 'kitagent';
import OpenAI from 'openai';
import { zodToJsonSchema } from "zod-to-json-schema";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const generateTicketAgent = {
  name: 'generateTicket',
  description: 'Generates a ticket based on the provided story',
  parameters: {
    story: z.string().describe('The story to be formatted'),
  },
  task: async ({params, tools}: any) => {
    const {story} = params;

    // Convert all tools to OpenAI function format
    const availableTools = Object.values(tools).map(tool => ({
      type: 'function',
      function: {
        name: tool.name,
        description: tool.description,
        parameters: zodToJsonSchema(z.object(tool.parameters), tool.name).definitions?.[tool.name]?.anyOf?.[1] || {},
      }
    }));

    const messages = [
      {
        role: 'system',
        content: 'You are a helpful assistant that generates a ticket based on the provided story. ' +
          'Always add documentation or reference documentation if available for the library. For example, ' +
          'if the ticket uses an external library, put the URL of the library and its version in the description. ' +
          'Example: For "We need to create a new critical feature to implement payment with Square in our checkout," ' +
          'add into description: https://developer.squareup.com/docs'
      },
      {
        role: 'user',
        content: \`Generate a ticket based on the following story: \${story}.\`
      }
    ];

    // Call OpenAI to format the result
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages,
      tools: availableTools as any,
      tool_choice: "auto"
    });

    const toolsResults = [];

    for (const toolCall of completion.choices[0].message.tool_calls || []) {
      const name = toolCall.function.name;
      const args = JSON.parse(toolCall.function.arguments);

      const result = await tools[name].execute({ params: args });
      toolsResults.push({ [name]: result });

      messages.push({
        role: "assistant",
        tool_call_id: toolCall.id,
        content: JSON.stringify(result),
      });
    }

    const finalResponse = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [
        ...messages,
      ],
    });

    return {
      message: finalResponse.choices[0].message?.content || 'No result provided',
      toolsResults,
    };
  }
};

registerAgent(generateTicketAgent);`,

  // Clients
  openaiClient: () => `import { registerChatClient, convertTools, z } from 'kitagent';
import OpenAI from 'openai';
import { zodToJsonSchema } from "zod-to-json-schema";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const openaiClient = async () => {
  registerChatClient('openai', {
    chat: async ({ session, tools }) => {
      // Convert tools to OpenAI format if any are provided
      const availableTools = Object.values(tools).map(tool => ({
        type: 'function',
        function: {
          name: tool.name,
          description: tool.description,
          parameters: zodToJsonSchema(z.object(tool.parameters), tool.name).definitions?.[tool.name]?.anyOf?.[1] || {},
        }
      })) as any;

      // Map session messages to OpenAI format
      const messages: any = session.messages.map(msg => ({
        role: msg.role as 'user' | 'assistant' | 'system',
        content: msg.content
      }));

      // Call OpenAI with the messages and tools
      const response = await openai.chat.completions.create({
        model: 'gpt-4-turbo',
        messages,
        tools: availableTools as any,
        temperature: 0.2,
      });

      // Parse any tool calls if they exist
      let toolsResults = [];
      if (response.choices[0]?.finish_reason === "tool_calls" && response.choices[0]?.message.tool_calls && response.choices[0]?.message.tool_calls.length > 0) {
        const toolCalls = response.choices[0].message.tool_calls;

        let finalResponse = response.choices[0].message.content || '';

        // Process each tool call
        for (const toolCall of toolCalls) {
          const toolName = toolCall.function.name;
          const toolArguments = JSON.parse(toolCall.function.arguments);

          if (tools && tools[toolName]) {
            try {
              // Execute the tool
              const toolResult = await tools[toolName].execute({
                params: toolArguments,
              });
              toolsResults.push({ toolName, toolResult });
              // Add tool result to the conversation
              const toolResultStr = JSON.stringify(toolResult, null, 2);
              finalResponse += \`\n\nTool Result (\${toolName}):\n\${toolResultStr}\`;

            } catch (error) {
              console.error(\`Error executing tool \${toolName}:\`, error);
              finalResponse += \`\n\nError executing tool \${toolName}: \${error.message}\`;
            }
          } else {
            finalResponse += \`\n\nTool \${toolName} not found\`;
          }
        }

        // Add the tool results to the messages
        messages.push({
          role: 'assistant',
          content: finalResponse,
        });
        // Call OpenAI again with the updated messages
       const finalResponseAI = await openai.chat.completions.create({
        model: 'gpt-4-turbo',
        messages: [
          ...messages,
          {
            role: 'assistant',
            content: JSON.stringify(toolsResults),
          },
        ],
        temperature: 0.2,
       })

        return finalResponseAI.choices[0]?.message?.content || 'No response generated';

      }

      // Return the response content
      return response.choices[0]?.message?.content || 'No response generated';
    }
  });
};

export default openaiClient;`,

  // Chats
  exampleChat: () => `name: pm-assistant
type: chat
description: A chat-based assistant for project management tasks.
client: openai
tools:
  - createTicket
  - getTickets
http:
  path: /chat/pm-assistant
  method: post`,

  // MCP
  exampleMcp: () => `import { registerMCP, getToolHandler } from "kitagent";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

const exampleMcp = {
  name: 'example-mcp',
  description: 'Example MCP for ticket management service',
  version: '1.0.0',
  path: '/mcp/pm-assistant',
  tools: ["createTicket", "updateTicket", "getTickets"],
  server: async ({server}: { server: McpServer }) => {
    // Additional server setup can be done here if needed
    server.resource(
      "pm-assistant",
      "pm-assistant://tickets",
      async (uri) => {
        const getTickets = getToolHandler("getTickets");
        const response = await getTickets({params: {}});
        return {
          contents: [{
            uri: uri.href,
            text: JSON.stringify(response),
          }]
        };
      }
    );
  }
};

registerMCP(exampleMcp);`,
};

/**
 * Generates a project at the specified path with the given name
 */
export async function generateProject(targetDir: string, projectName: string): Promise<void> {
  // Create directory structure
  const directories = [
    '',
    'src',
    'src/models',
    'src/tools',
    'src/workflows',
    'src/agents',
    'src/clients',
    'src/chats',
    'src/mcp'
  ];

  // Create directories
  for (const dir of directories) {
    await fs.ensureDir(path.join(targetDir, dir));
  }

  // Create root files
  await fs.writeFile(
    path.join(targetDir, 'package.json'),
    templates.packageJson(projectName)
  );

  await fs.writeFile(
    path.join(targetDir, 'tsconfig.json'),
    templates.tsconfig()
  );

  await fs.writeFile(
    path.join(targetDir, 'README.md'),
    templates.readme(projectName)
  );

  await fs.writeFile(
    path.join(targetDir, '.gitignore'),
    templates.gitignore()
  );

  await fs.writeFile(
    path.join(targetDir, '.env.example'),
    templates.envExample()
  );

  await fs.writeFile(
    path.join(targetDir, 'nodemon.json'),
    templates.nodemon()
  );

  // Create source files
  await fs.writeFile(
    path.join(targetDir, 'src', 'index.ts'),
    templates.indexTs()
  );

  // Create models
  await fs.writeFile(
    path.join(targetDir, 'src', 'models', 'tickets.ts'),
    templates.ticketsModel()
  );

  // Create tools
  await fs.writeFile(
    path.join(targetDir, 'src', 'tools', 'create-ticket.tool.ts'),
    templates.createTicketTool()
  );

  await fs.writeFile(
    path.join(targetDir, 'src', 'tools', 'get-ticket-by-id.tool.ts'),
    templates.getTicketByIdTool()
  );

  await fs.writeFile(
    path.join(targetDir, 'src', 'tools', 'get-ticket-by-title.tool.ts'),
    templates.getTicketByTitleTool()
  );

  await fs.writeFile(
    path.join(targetDir, 'src', 'tools', 'get-tickets.tool.ts'),
    templates.getTicketsTool()
  );

  await fs.writeFile(
    path.join(targetDir, 'src', 'tools', 'update-ticket.tool.ts'),
    templates.updateTicketTool()
  );

  // Create workflows
  await fs.writeFile(
    path.join(targetDir, 'src', 'workflows', 'create-ticket.wf.yml'),
    templates.createTicketWorkflow()
  );

  await fs.writeFile(
    path.join(targetDir, 'src', 'workflows', 'get-ticket.wf.yml'),
    templates.getTicketWorkflow()
  );

  await fs.writeFile(
    path.join(targetDir, 'src', 'workflows', 'get-all-tickets.wf.yml'),
    templates.getAllTicketsWorkflow()
  );

  await fs.writeFile(
    path.join(targetDir, 'src', 'workflows', 'generate-ticket.wf.yml'),
    templates.generateTicketWorkflow()
  );

  // Create agents
  await fs.writeFile(
    path.join(targetDir, 'src', 'agents', 'generate-ticket.agent.ts'),
    templates.generateTicketAgent()
  );

  // Create clients
  await fs.writeFile(
    path.join(targetDir, 'src', 'clients', 'openai.client.ts'),
    templates.openaiClient()
  );

  // Create chats
  await fs.writeFile(
    path.join(targetDir, 'src', 'chats', 'example.chat.yml'),
    templates.exampleChat()
  );

  // Create MCP
  await fs.writeFile(
    path.join(targetDir, 'src', 'mcp', 'example.mcp.ts'),
    templates.exampleMcp()
  );
}