/**
 * Local SQLite schema. Append new migrations; never edit a shipped one.
 *
 * - cache_entries: JSON snapshots of Firestore content so the app works offline.
 * - attempts: every answered question, synced to Firestore when online.
 * - downloads: papers saved to the device for offline reading.
 */
export const MIGRATIONS: { version: number; sql: string }[] = [
  {
    version: 1,
    sql: `
      CREATE TABLE IF NOT EXISTS cache_entries (
        key TEXT PRIMARY KEY NOT NULL,
        json TEXT NOT NULL,
        updated_at INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS attempts (
        id TEXT PRIMARY KEY NOT NULL,
        question_id TEXT NOT NULL,
        subject_id TEXT NOT NULL,
        topic_ids TEXT NOT NULL,
        selected_key TEXT,
        correct INTEGER NOT NULL,
        time_ms INTEGER NOT NULL,
        source TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        synced INTEGER NOT NULL DEFAULT 0
      );
      CREATE INDEX IF NOT EXISTS idx_attempts_subject ON attempts (subject_id, created_at);
      CREATE INDEX IF NOT EXISTS idx_attempts_unsynced ON attempts (synced);

      CREATE TABLE IF NOT EXISTS downloads (
        paper_id TEXT PRIMARY KEY NOT NULL,
        uri TEXT NOT NULL,
        size_bytes INTEGER,
        downloaded_at INTEGER NOT NULL
      );
    `,
  },
];
