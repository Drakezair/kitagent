import {getSessionStore} from './storeManager';
import {getTool} from '../tools/toolRegistry';
import {getChatClient} from './clientRegistry';
import {ChatMessage} from "../types";

export async function runChat(
  {
    sessionId,
    message,
    role,
    client,
    tools,
    context,
  }: {
    sessionId: string;
    message: string;
    client: string;
    tools?: string[];
    context: any;
    role?: ChatMessage["role"];
  }) {
  const store = getSessionStore();

  // Guardamos el mensaje del usuario
  await store.saveMessage(sessionId, {role: role ? role : "system", content: message});

  // Obtenemos el historial de la sesión
  const session = await store.getSession(sessionId);

  // Creamos los toolHandlers
  const toolInstances: Record<string, any> = {};
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

  // Obtenemos el cliente configurado
  const clientInstance = getChatClient(client);

  // Ejecutamos el cliente con acceso completo al contexto
  const response = await clientInstance.chat({
    sessionId,
    session,
    tools: toolInstances,
    context,
    store,
  });

  // Guardamos la respuesta del asistente
  await store.saveMessage(sessionId, {role: 'assistant', content: response});

  return response;
}
