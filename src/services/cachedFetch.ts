import { cacheRepo } from '@/db/cacheRepo';
import { config } from '@/lib/config';

/**
 * Network-first read with an SQLite fallback, so content opened once stays available offline.
 * In mock mode the bundled sample data is returned and Firebase is never touched.
 */
export async function cachedFetch<T>(
  key: string,
  remote: () => Promise<T>,
  mock: () => T,
): Promise<T> {
  if (config.useMocks) return mock();

  try {
    const value = await remote();
    await cacheRepo.set(key, value);
    return value;
  } catch (error) {
    const cached = await cacheRepo.get<T>(key);
    if (cached) return cached.value;
    throw error;
  }
}
