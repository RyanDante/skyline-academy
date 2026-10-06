import * as SQLite from 'expo-sqlite';

import { MIGRATIONS } from './schema';

const DB_NAME = 'skyline.db';

let database: SQLite.SQLiteDatabase | null = null;

/** Shared connection used by every repository. Opened synchronously on first use. */
export function getDb(): SQLite.SQLiteDatabase {
  if (!database) {
    database = SQLite.openDatabaseSync(DB_NAME);
  }
  return database;
}

/**
 * Applies pending migrations using PRAGMA user_version. Call once at startup,
 * before any repository is used (see useBootstrap).
 */
export async function migrateDb(): Promise<void> {
  const db = getDb();
  await db.execAsync('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');

  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  let version = row?.user_version ?? 0;

  for (const migration of MIGRATIONS) {
    if (migration.version <= version) continue;
    await db.withTransactionAsync(async () => {
      await db.execAsync(migration.sql);
      await db.execAsync(`PRAGMA user_version = ${migration.version}`);
    });
    version = migration.version;
  }
}
