"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name2 in all)
    __defProp(target, name2, { get: all[name2], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  createKitAgent: () => createKitAgent,
  getAgent: () => getAgent,
  getChatClient: () => getChatClient,
  getToolHandler: () => getToolHandler,
  loadWorkflowFromYaml: () => loadWorkflowFromYaml,
  registerAgent: () => registerAgent,
  registerChatClient: () => registerChatClient,
  registerTool: () => registerTool,
  runWorkflow: () => runWorkflow
});
module.exports = __toCommonJS(index_exports);
var import_express = __toESM(require("express"));

// src/tools/loadAllTools.ts
var import_fast_glob = __toESM(require("fast-glob"));
async function loadAllTools(projectDir) {
  const toolFiles = await (0, import_fast_glob.default)(["**/*.tool.{ts,js}"], {
    cwd: projectDir,
    absolute: true
  });
  for (const file of toolFiles) {
    try {
      await import(file);
      console.log(`\u{1F527} Tool loaded: ${file}`);
    } catch (err) {
      console.error(`\u274C Failed to load tool from ${file}:`, err);
    }
  }
}

// src/agents/loadAllAgents.ts
var import_fast_glob2 = __toESM(require("fast-glob"));
async function loadAllAgents(projectDir) {
  const toolFiles = await (0, import_fast_glob2.default)(["**/*.agent.{ts,js}"], {
    cwd: projectDir,
    absolute: true
  });
  for (const file of toolFiles) {
    try {
      await import(file);
      console.log(`\u{1F916} Agent loaded: ${file}`);
    } catch (err) {
      console.error(`\u274C Failed to load tool from ${file}:`, err);
    }
  }
}

// src/http/registerAllHttpWorkflows.ts
var import_fast_glob3 = __toESM(require("fast-glob"));

// src/workflows/loaders/yamlLoader.ts
var import_fs = __toESM(require("fs"));
var import_js_yaml = __toESM(require("js-yaml"));
function loadWorkflowFromYaml(path) {
  const file = import_fs.default.readFileSync(path, "utf-8");
  const data = import_js_yaml.default.load(file);
  return data;
}
function loadChatFromYaml(path) {
  const file = import_fs.default.readFileSync(path, "utf-8");
  const data = import_js_yaml.default.load(file);
  return data;
}

// src/utils/validateParameters.ts
function validateInputWithParameters(input, parameters) {
  const errors = [];
  const validate = (key, schema, value, path) => {
    const currentPath = path ? `${path}.${key}` : key;
    if (value === void 0 || value === null) {
      if ("nullable" in schema && schema.nullable) return;
      if ("required" in schema && schema.required?.includes(key)) {
        errors.push(`Missing required property: ${currentPath}`);
      } else if (!("nullable" in schema)) {
        errors.push(`Property ${currentPath} is required and cannot be null`);
      }
      return;
    }
    switch (schema.type) {
      case "any":
        return;
      case "string":
        if (typeof value !== "string") {
          errors.push(`Expected string at ${currentPath}, got ${typeof value}`);
        } else if (schema.format === "date-time" && isNaN(Date.parse(value))) {
          errors.push(`Invalid date-time format at ${currentPath}`);
        }
        break;
      case "number":
        if (typeof value !== "number") {
          errors.push(`Expected number at ${currentPath}, got ${typeof value}`);
        }
        break;
      case "boolean":
        if (typeof value !== "boolean") {
          errors.push(`Expected boolean at ${currentPath}, got ${typeof value}`);
        }
        break;
      case "array":
        if (!Array.isArray(value)) {
          errors.push(`Expected array at ${currentPath}, got ${typeof value}`);
        } else {
          value.forEach(
            (item, idx) => validate(`[${idx}]`, schema.items, item, currentPath)
          );
        }
        break;
      case "object":
        if (typeof value !== "object" || Array.isArray(value)) {
          errors.push(`Expected object at ${currentPath}, got ${typeof value}`);
        } else {
          const requiredFields = schema.required || [];
          for (const [propKey, propSchema] of Object.entries(schema.properties)) {
            if (requiredFields.includes(propKey) && !(propKey in value)) {
              errors.push(`Missing required property: ${currentPath}.${propKey}`);
            } else {
              validate(propKey, propSchema, value[propKey], currentPath);
            }
          }
        }
        break;
      case "enum":
        if (!schema.values.includes(value)) {
          errors.push(`Invalid value at ${currentPath}. Expected one of: ${schema.values.join(", ")}`);
        }
        break;
      default:
        errors.push(`Unknown type for property ${currentPath}`);
    }
  };
  for (const [key, schema] of Object.entries(parameters)) {
    validate(key, schema, input[key], "");
  }
  return { valid: errors.length === 0, errors };
}
function validateParametersSchema(parameters) {
  const errors = [];
  const validate = (key, schema, path = key) => {
    if (!schema || typeof schema !== "object") {
      errors.push(`\u274C Parameter '${path}' must be an object`);
      return;
    }
    if (schema.type === "any") {
      return;
    }
    if (!("type" in schema)) {
      errors.push(`\u274C Parameter '${path}' is missing 'type'`);
      return;
    }
    switch (schema.type) {
      case "string":
        break;
      case "number":
      case "boolean":
        break;
      case "array":
        if (!("items" in schema)) {
          errors.push(`\u274C Parameter '${path}' of type 'array' must include 'items'`);
        } else {
          validate(`${path}[]`, schema.items);
        }
        break;
      case "object":
        if (!schema.properties || typeof schema.properties !== "object") {
          errors.push(`\u274C Parameter '${path}' of type 'object' must include 'properties'`);
        } else {
          for (const [subKey, subSchema] of Object.entries(schema.properties)) {
            validate(subKey, subSchema, `${path}.${subKey}`);
          }
        }
        break;
      case "enum":
        if (!("values" in schema) || !Array.isArray(schema.values) || !schema.values.every((v) => typeof v === "string")) {
          errors.push(`\u274C Parameter '${path}' of type 'enum' must have a 'values' array of strings`);
        }
        break;
      default:
        errors.push(`\u274C Parameter '${path}' has unknown type '${schema.type}'`);
    }
  };
  for (const [key, schema] of Object.entries(parameters)) {
    validate(key, schema);
  }
  return errors;
}

// src/tools/toolRegistry.ts
var toolRegistry = /* @__PURE__ */ new Map();
function registerTool(tool) {
  const error = validateParametersSchema(tool.parameters);
  if (error.length > 0) {
    throw new Error(`Tool "${tool.name}" has invalid parameters: ${error.join(", ")}`);
  }
  if (toolRegistry.has(tool.name)) {
    throw new Error(`Tool "${name}" already registered`);
  }
  toolRegistry.set(tool.name, tool);
}
function getToolHandler(name2) {
  const tool = toolRegistry.get(name2);
  if (!tool) throw new Error(`Tool "${name2}" not found`);
  return tool.execute;
}
function getTool(name2) {
  if (!toolRegistry.has(name2)) {
    throw new Error(`Tool "${name2}" not found`);
  }
  return toolRegistry.get(name2);
}

// src/tools/toolStep.ts
async function runToolStep({ step, context, parameters }) {
  const tool = getTool(step?.tool);
  const validInput = validateInputWithParameters(parameters, tool?.parameters);
  if (!validInput.valid) {
    return {
      error: {
        name: "Invalid input",
        message: validInput.errors
      }
    };
  }
  return await tool?.execute({
    params: parameters,
    context
  });
}

// src/workflows/engine/context.ts
var Context = class {
  constructor(initialValues) {
    this.store = {};
    this.workflowGlobals = null;
    if (initialValues) {
      this.store = { ...initialValues };
    }
  }
  get(key) {
    return this.store[key];
  }
  set(key, value) {
    this.store[key] = value;
  }
  has(key) {
    return key in this.store;
  }
  merge(data) {
    this.store = {
      ...this.store,
      ...data
    };
  }
  toJSON() {
    return { ...this.store };
  }
  previousStepResult() {
    return this.prevStepResult;
  }
  setPreviousStepResult(result) {
    this.prevStepResult = result;
  }
  setWorkflowGlobals(workflow) {
    this.workflowGlobals = workflow;
  }
  getWorkflowGlobals() {
    return this.workflowGlobals;
  }
};

// src/agents/agentRegistry.ts
var agents = /* @__PURE__ */ new Map();
function registerAgent(agent) {
  if (agents.has(agent.name)) {
    throw new Error(`Agent "${agent.name}" already registered`);
  }
  const error = validateParametersSchema(agent.parameters);
  if (error.length > 0) {
    throw new Error(`Agent "${agent.name}" has invalid parameters: ${error.join(", ")}`);
  }
  agents.set(agent.name, agent);
}
function getAgent(name2) {
  const agent = agents.get(name2);
  if (!agent) throw new Error(`Agent "${name2}" not found`);
  return agent;
}

// src/agents/agentStep.ts
async function runAgentStep({ step, context, parameters }) {
  const agent = getAgent(step?.agent.name);
  if (!agent) {
    return {
      error: {
        name: "Agent not found",
        message: `Agent "${step.agent?.name}" not found`
      }
    };
  }
  const validInput = validateInputWithParameters(parameters, agent?.parameters);
  if (!validInput.valid) {
    return {
      error: {
        name: "Invalid input",
        message: validInput.errors
      }
    };
  }
  const tools = step?.agent?.tools?.reduce((acc, toolName) => {
    const tool = getTool(toolName);
    if (tool) {
      acc[tool.name] = tool;
    }
    return acc;
  }, {}) || {};
  return await agent?.task({
    params: parameters,
    context,
    tools
  });
}

// src/workflows/engine/runner.ts
async function runWorkflow(config2, parameters = {}) {
  const context = new Context();
  context.setWorkflowGlobals(config2.globals);
  for (const step of config2.steps) {
    if (step.agent && step.tool) {
      throw new Error(`Step ${step.name} cannot have both agent and tool defined`);
    }
    if (step.agent) {
      const agent = getAgent(step.agent.name);
      const result2 = await runAgentStep({
        step,
        context,
        parameters
      });
      context.set(step.name, result2);
      context.setPreviousStepResult(result2);
      continue;
    }
    const result = await runToolStep({
      step,
      context,
      parameters
    });
    context.set(step.name, result);
    context.setPreviousStepResult(result);
  }
  return context.previousStepResult();
}

// src/http/registerAllHttpWorkflows.ts
var import_multer = __toESM(require("multer"));
var upload = (0, import_multer.default)({ storage: import_multer.default.memoryStorage() });
async function registerAllHttpWorkflows(app, projectDir) {
  const workflowFiles = await (0, import_fast_glob3.default)(["**/*.wf.yml"], {
    cwd: projectDir,
    absolute: true
  });
  for (const file of workflowFiles) {
    try {
      const config2 = loadWorkflowFromYaml(file);
      if (!config2.http) continue;
      const method = (config2.http.method || "post").toLowerCase();
      const route = config2.http.path;
      app[method](route, upload.any(), async (req, res) => {
        try {
          const context = { ...config2.globals, body: req.body, queryParams: { ...req.query }, files: req.files, headers: req.headers };
          console.log("\u{1F3C3}\u200D\u2642\uFE0F\u200D\u27A1\uFE0F Running Workflow: ", JSON.stringify(config2, null, 2));
          const result = await runWorkflow({ ...config2, globals: context }, { ...req.body, ...req.query });
          res.json(result);
        } catch (err) {
          console.error(`\u274C Error in workflow "${config2.name}":`, err);
          res.status(500).json({ error: "Failed to execute workflow", message: err.message });
        }
      });
      console.log(`\u{1F517} Workflow registered: [${method.toUpperCase()}] ${route}`);
    } catch (err) {
      console.error(`\u274C Failed to load workflow ${file}:`, err);
    }
  }
}

// src/index.ts
var import_dotenv = require("dotenv");

// src/chat/registerAllChats.ts
var import_fast_glob4 = __toESM(require("fast-glob"));

// src/chat/memory.ts
var memory = {};
var MemorySessionStore = class {
  async getSession(id) {
    if (!memory[id]) memory[id] = { id, messages: [] };
    return memory[id];
  }
  async saveMessage(id, msg) {
    const session = await this.getSession(id);
    session.messages.push(msg);
  }
  async clearSession(id) {
    delete memory[id];
  }
};

// src/chat/storeManager.ts
var activeStore = new MemorySessionStore();
function getSessionStore() {
  return activeStore;
}

// src/chat/clientRegistry.ts
var clients = {};
function registerChatClient(name2, client) {
  clients[name2] = client;
}
function getChatClient(name2) {
  if (!clients[name2]) throw new Error(`Client ${name2} not registered`);
  return clients[name2];
}

// src/chat/runner.ts
async function runChat({
  sessionId,
  message,
  role,
  client,
  tools,
  context
}) {
  const store = getSessionStore();
  await store.saveMessage(sessionId, { role: role ? role : "system", content: message });
  const session = await store.getSession(sessionId);
  const toolInstances = {};
  if (tools) {
    for (const toolName of tools) {
      console.log(`[${toolName}] ${toolName}`);
      const tool = getTool(toolName);
      if (!tool) {
        throw new Error(`Tool "${toolName}" not found`);
      }
      toolInstances[toolName] = tool;
    }
  }
  const clientInstance = getChatClient(client);
  const response = await clientInstance.chat({
    sessionId,
    session,
    tools: toolInstances,
    context,
    store
  });
  await store.saveMessage(sessionId, { role: "assistant", content: response });
  return response;
}

// src/chat/registerAllChats.ts
var import_multer2 = __toESM(require("multer"));
var import_crypto = __toESM(require("crypto"));
var upload2 = (0, import_multer2.default)({ storage: import_multer2.default.memoryStorage() });
async function registerAllHttpChats(app, projectDir) {
  const chatFiles = await (0, import_fast_glob4.default)(["**/*.chat.yml"], {
    cwd: projectDir,
    absolute: true
  });
  for (const file of chatFiles) {
    try {
      const config2 = await loadChatFromYaml(file);
      if (!config2.http) continue;
      const method = (config2.http.method || "post").toLowerCase();
      const route = config2.http.path || `/chat/${config2.name}`;
      app[method](route, upload2.any(), async (req, res) => {
        try {
          const sessionId = req.headers["x-session-id"] || import_crypto.default.randomUUID();
          const context = {
            ...config2.globals,
            workflowConfig: config2,
            body: req.body,
            queryParams: req.query,
            files: req.files,
            headers: req.headers
          };
          const result = await runChat({
            sessionId,
            message: req.body.message,
            client: config2.client,
            role: req.body.role,
            tools: config2.tools,
            context
          });
          res.json({
            sessionId,
            // 💡 Devolvemos sessionId en la respuesta
            response: result
          });
        } catch (err) {
          console.error(`\u274C Error in chat "${config2.name}":`, err);
          res.status(500).json({ error: "Failed to execute chat" });
        }
      });
      console.log(`\u{1F4AC} Chat registered: [${method.toUpperCase()}] ${route}`);
    } catch (err) {
      console.error(`\u274C Failed to load chat ${file}:`, err);
    }
  }
}

// src/chat/loadAllClient.ts
var import_fast_glob5 = __toESM(require("fast-glob"));
async function loadAllClients(projectDir) {
  const toolFiles = await (0, import_fast_glob5.default)(["**/*.client.{ts,js}"], {
    cwd: projectDir,
    absolute: true
  });
  for (const file of toolFiles) {
    try {
      const mod = await import(file);
      if (typeof mod.default === "function") {
        mod.default();
        console.log(`\u{1F310} Client loaded: ${file}`);
      } else {
        console.error(`\u274C client in ${file} does not export a default function`);
      }
    } catch (err) {
      console.error(`\u274C Failed to load client from ${file}:`, err);
    }
  }
}

// src/index.ts
async function createKitAgent(projectDir = process.cwd()) {
  console.log("\u2699\uFE0F Initializing KitAgent...");
  (0, import_dotenv.config)();
  const app = (0, import_express.default)();
  app.use(import_express.default.json());
  await loadAllTools(projectDir);
  await loadAllAgents(projectDir);
  await registerAllHttpWorkflows(app, projectDir);
  await loadAllClients(projectDir);
  await registerAllHttpChats(app, projectDir);
  const port = process.env.PORT || 3e3;
  app.listen(port, () => {
    console.log(`\u{1F680} KitAgent running at http://localhost:${port}`);
  });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  createKitAgent,
  getAgent,
  getChatClient,
  getToolHandler,
  loadWorkflowFromYaml,
  registerAgent,
  registerChatClient,
  registerTool,
  runWorkflow
});
