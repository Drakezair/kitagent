import {ChatMessage, SessionData, SessionStore} from "../types";

const memory: Record<string, SessionData> = {};

export class MemorySessionStore implements SessionStore {
  async getSession(id: string): Promise<SessionData> {
    if (!memory[id]) memory[id] = { id, messages: [] };
    return memory[id];
  }

  async saveMessage(id: string, msg: ChatMessage): Promise<void> {
    const session = await this.getSession(id);
    session.messages.push(msg);
  }


  async clearSession(id: string): Promise<void> {
    delete memory[id];
  }
}
