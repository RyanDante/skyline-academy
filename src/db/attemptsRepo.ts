import type { Attempt, OptionKey } from '@/types/models';

import { getDb } from './client';

interface AttemptRow {
  id: string;
  question_id: string;
  subject_id: string;
  topic_ids: string;
  selected_key: string | null;
  correct: number;
  time_ms: number;
  source: Attempt['source'];
  created_at: number;
}

const toAttempt = (row: AttemptRow): Attempt => ({
  id: row.id,
  questionId: row.question_id,
  subjectId: row.subject_id,
  topicIds: JSON.parse(row.topic_ids) as string[],
  selectedKey: row.selected_key as OptionKey | null,
  correct: row.correct === 1,
  timeMs: row.time_ms,
  source: row.source,
  createdAt: row.created_at,
});

export const attemptsRepo = {
  async insertMany(attempts: Attempt[]): Promise<void> {
    const db = getDb();
    await db.withTransactionAsync(async () => {
      for (const a of attempts) {
        await db.runAsync(
          `INSERT OR REPLACE INTO attempts
             (id, question_id, subject_id, topic_ids, selected_key, correct, time_ms, source, created_at, synced)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
          a.id,
          a.questionId,
          a.subjectId,
          JSON.stringify(a.topicIds),
          a.selectedKey,
          a.correct ? 1 : 0,
          a.timeMs,
          a.source,
          a.createdAt,
        );
      }
    });
  },

  async all(): Promise<Attempt[]> {
    const rows = await getDb().getAllAsync<AttemptRow>(
      'SELECT * FROM attempts ORDER BY created_at DESC',
    );
    return rows.map(toAttempt);
  },

  async unsynced(limit = 200): Promise<Attempt[]> {
    const rows = await getDb().getAllAsync<AttemptRow>(
      'SELECT * FROM attempts WHERE synced = 0 ORDER BY created_at ASC LIMIT ?',
      limit,
    );
    return rows.map(toAttempt);
  },

  async markSynced(ids: string[]): Promise<void> {
    if (ids.length === 0) return;
    const placeholders = ids.map(() => '?').join(',');
    await getDb().runAsync(`UPDATE attempts SET synced = 1 WHERE id IN (${placeholders})`, ...ids);
  },

  async clear(): Promise<void> {
    await getDb().runAsync('DELETE FROM attempts');
  },
};
