/** Minimal persistence boundary so the learning service can be used in a browser or tests. */
export interface TracewiseStorage {
  get(key: string): string | null
  set(key: string, value: string): void
  remove(key: string): void
  keys(prefix: string): string[]
}

export class BrowserTracewiseStorage implements TracewiseStorage {
  get(key: string): string | null {
    return typeof localStorage === 'undefined' ? null : localStorage.getItem(key)
  }

  set(key: string, value: string): void {
    if (typeof localStorage !== 'undefined') localStorage.setItem(key, value)
  }

  remove(key: string): void {
    if (typeof localStorage !== 'undefined') localStorage.removeItem(key)
  }

  keys(prefix: string): string[] {
    if (typeof localStorage === 'undefined') return []
    return Array.from({ length: localStorage.length }, (_, index) => localStorage.key(index))
      .filter((key): key is string => key !== null && key.startsWith(prefix))
  }
}

export class MemoryTracewiseStorage implements TracewiseStorage {
  private readonly values = new Map<string, string>()
  get(key: string): string | null { return this.values.get(key) ?? null }
  set(key: string, value: string): void { this.values.set(key, value) }
  remove(key: string): void { this.values.delete(key) }
  keys(prefix: string): string[] { return [...this.values.keys()].filter((key) => key.startsWith(prefix)) }
}
