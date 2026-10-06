import { getDb } from './client';

/** Key/value JSON cache for remote content. */
export const cacheRepo = {
  async get<T>(key: string): Promise<{ value: T; updatedAt: number } | null> {
    const row = await getDb().getFirstAsync<{ json: string; updated_at: number }>(
      'SELECT json, updated_at FROM cache_entries WHERE key = ?',
      key,
    );
    if (!row) return null;
    return { value: JSON.parse(row.json) as T, updatedAt: row.updated_at };
  },

  async set<T>(key: string, value: T): Promise<void> {
    await getDb().runAsync(
      'INSERT OR REPLACE INTO cache_entries (key, json, updated_at) VALUES (?, ?, ?)',
      key,
      JSON.stringify(value),
      Date.now(),
    );
  },

  async clear(): Promise<void> {
    await getDb().runAsync('DELETE FROM cache_entries');
  },
};
