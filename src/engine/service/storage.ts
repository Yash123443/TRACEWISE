export interface EngineStorage { get(key: string): string | null; set(key: string, value: string): void; remove(key: string): void }

export class MemoryStorage implements EngineStorage {
  private readonly values = new Map<string, string>()
  get(key: string) { return this.values.get(key) ?? null }
  set(key: string, value: string) { this.values.set(key, value) }
  remove(key: string) { this.values.delete(key) }
}

/** Browser storage with an in-memory fallback for unavailable or failing storage. */
export class LocalStorageAdapter implements EngineStorage {
  private readonly fallback = new MemoryStorage()
  private readonly prefix = 'tracewise:v1:'
  private key(key: string) { return `${this.prefix}${key}` }
  get(key: string) { try { const browser = globalThis.localStorage; return browser ? browser.getItem(this.key(key)) : this.fallback.get(key) } catch { return this.fallback.get(key) } }
  set(key: string, value: string) { try { const browser = globalThis.localStorage; if (browser) browser.setItem(this.key(key), value); else this.fallback.set(key, value) } catch { this.fallback.set(key, value) } }
  remove(key: string) { try { const browser = globalThis.localStorage; if (browser) browser.removeItem(this.key(key)); else this.fallback.remove(key) } catch { this.fallback.remove(key) } }
}
