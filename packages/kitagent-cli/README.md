# create-kitagent

A CLI tool for quickly scaffolding KitAgent projects.

## Overview

`create-kitagent` is a CLI tool designed to help you get started with [KitAgent](https://github.com/Drakezair/kitagent) - a workflow-based API framework powered by YAML and AI agents. It generates a complete project structure with all the necessary files, configurations, and examples to help you build powerful API applications with minimal setup.

## Features

- 🚀 Quick project setup with a single command
- 📦 Complete project structure with all necessary files and configurations
- 🤖 Ready-to-use AI agent integration with OpenAI
- 🔄 Workflow-based API endpoints
- 🧰 Built-in tools for CRUD operations
- 💬 Chat interface setup
- 📋 Model Context Protocol (MCP) integration
- 🎯 Real-world example of a ticket management system

## Usage

### Create a new project

```bash
# Using npx (recommended)
npx create-kitagent my-project

# Or install globally
npm install -g create-kitagent
create-kitagent my-project
```

### Options

```bash
# Create a project in current directory
npx create-kitagent .

# Skip git initialization
npx create-kitagent my-project --skip-git

# Skip dependencies installation
npx create-kitagent my-project --skip-install

# Show help
npx create-kitagent --help
```

## Generated Project Structure

The generated project includes:

```
my-project/
├── src/
│   ├── index.ts           # Entry point
│   ├── models/            # Data models
│   │   └── tickets.ts     # Ticket model and storage
│   ├── tools/             # Tools for operations
│   │   ├── create-ticket.tool.ts
│   │   ├── get-ticket-by-id.tool.ts
│   │   ├── get-ticket-by-title.tool.ts
│   │   ├── get-tickets.tool.ts
│   │   └── update-ticket.tool.ts
│   ├── workflows/         # API endpoints
│   │   ├── create-ticket.wf.yml
│   │   ├── generate-ticket.wf.yml
│   │   ├── get-all-tickets.wf.yml
│   │   └── get-ticket.wf.yml
│   ├── agents/            # AI agents
│   │   └── generate-ticket.agent.ts
│   ├── clients/           # Chat clients
│   │   └── openai.client.ts
│   ├── chats/             # Chat definitions
│   │   └── example.chat.yml
│   └── mcp/               # Model Context Protocol
│       └── example.mcp.ts
├── .env.example           # Environment variables template
├── .gitignore             # Git ignore file
├── nodemon.json           # Nodemon configuration
├── package.json           # Project dependencies
├── README.md              # Project documentation
└── tsconfig.json          # TypeScript configuration
```

## Getting Started with Your New Project

After creating a project:

1. Navigate to the project directory:
   ```bash
   cd my-project
   ```

2. Copy `.env.example` to `.env` and fill in your OpenAI API key:
   ```bash
   cp .env.example .env
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

The API will be available at http://localhost:3001 with the following endpoints:

- `POST /api/ticket` - Create a new ticket
- `GET /api/ticket` - Get all tickets
- `GET /api/ticket/:id` - Get a ticket by ID
- `POST /api/generate-ticket` - Generate a ticket from a user story
- `POST /chat/pm-assistant` - Chat with the project management assistant

## Requirements

- Node.js >= 18.0.0
- npm, yarn, or pnpm

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT