import { AsyncLocalStorage } from 'async_hooks';

interface ContextData {
  userId?: string;
  userEmail?: string;
}

const storage = new AsyncLocalStorage<ContextData>();

export class RequestContext {
  static set(data: ContextData) {
    storage.enterWith(data);
  }
  static current(): ContextData | undefined {
    return storage.getStore();
  }
}