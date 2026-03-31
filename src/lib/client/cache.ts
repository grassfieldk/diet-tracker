const valueCache = new Map<string, unknown>();
const keyedCache = new Map<string, Map<string, unknown>>();

export function getCacheValue<T>(key: string): T | undefined {
  return valueCache.get(key) as T | undefined;
}

export function setCacheValue<T>(key: string, value: T): T {
  valueCache.set(key, value);
  return value;
}

function getOrCreateKeyedMap(namespace: string): Map<string, unknown> {
  const existing = keyedCache.get(namespace);
  if (existing) return existing;
  const created = new Map<string, unknown>();
  keyedCache.set(namespace, created);
  return created;
}

export function getKeyedCacheValue<T>(
  namespace: string,
  key: string | number,
): T | undefined {
  return keyedCache.get(namespace)?.get(String(key)) as T | undefined;
}

export function setKeyedCacheValue<T>(
  namespace: string,
  key: string | number,
  value: T,
): T {
  const map = getOrCreateKeyedMap(namespace);
  map.set(String(key), value);
  return value;
}

export function clearKeyedCache(namespace: string): void {
  keyedCache.delete(namespace);
}
