import { getDb } from './client';

export interface DownloadRecord {
  paperId: string;
  uri: string;
  sizeBytes: number | null;
  downloadedAt: number;
}

export const downloadsRepo = {
  async get(paperId: string): Promise<DownloadRecord | null> {
    const row = await getDb().getFirstAsync<{
      paper_id: string;
      uri: string;
      size_bytes: number | null;
      downloaded_at: number;
    }>('SELECT * FROM downloads WHERE paper_id = ?', paperId);
    return row
      ? { paperId: row.paper_id, uri: row.uri, sizeBytes: row.size_bytes, downloadedAt: row.downloaded_at }
      : null;
  },

  async all(): Promise<DownloadRecord[]> {
    const rows = await getDb().getAllAsync<{
      paper_id: string;
      uri: string;
      size_bytes: number | null;
      downloaded_at: number;
    }>('SELECT * FROM downloads ORDER BY downloaded_at DESC');
    return rows.map((row) => ({
      paperId: row.paper_id,
      uri: row.uri,
      sizeBytes: row.size_bytes,
      downloadedAt: row.downloaded_at,
    }));
  },

  async save(record: DownloadRecord): Promise<void> {
    await getDb().runAsync(
      'INSERT OR REPLACE INTO downloads (paper_id, uri, size_bytes, downloaded_at) VALUES (?, ?, ?, ?)',
      record.paperId,
      record.uri,
      record.sizeBytes,
      record.downloadedAt,
    );
  },

  async remove(paperId: string): Promise<void> {
    await getDb().runAsync('DELETE FROM downloads WHERE paper_id = ?', paperId);
  },
};
