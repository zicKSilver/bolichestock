export function safeGet<T = string>(key: string, fallback: T | null = null): T | null {
  try {
    const val = localStorage.getItem(key)
    return val !== null ? (val as unknown as T) : fallback
  } catch {
    return fallback
  }
}

export function safeSet(key: string, value: string): void {
  try {
    localStorage.setItem(key, value)
  } catch {
    /* localStorage no disponible */
  }
}

export function safeRemove(key: string): void {
  try {
    localStorage.removeItem(key)
  } catch {
    /* localStorage no disponible */
  }
}
