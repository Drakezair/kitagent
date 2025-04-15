import { MemorySessionStore } from './memory';
import {SessionStore} from "../types";

let activeStore: SessionStore = new MemorySessionStore();

export function setSessionStore(store: SessionStore) {
  activeStore = store;
}

export function getSessionStore(): SessionStore {
  return activeStore;
}
