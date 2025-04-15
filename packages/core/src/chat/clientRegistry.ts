import {ChatClient} from "../types";

const clients: Record<string, ChatClient> = {};

export function registerChatClient(name: string, client: ChatClient) {
  clients[name] = client;
}

export function getChatClient(name: string): ChatClient {
  if (!clients[name]) throw new Error(`Client ${name} not registered`);
  return clients[name];
}
