import { getDownloadURL, ref } from '@react-native-firebase/storage';
import { Directory, File, Paths } from 'expo-file-system';

import { downloadsRepo, type DownloadRecord } from '@/db/downloadsRepo';
import { config } from '@/lib/config';
import { storage } from '@/lib/firebase';
import type { Paper } from '@/types/models';

const papersDir = () => new Directory(Paths.document, 'papers');

export const downloadsService = {
  get: (paperId: string) => downloadsRepo.get(paperId),
  all: () => downloadsRepo.all(),

  /** Remote URL for streaming the PDF when it isn't downloaded. */
  async remoteUrl(paper: Paper): Promise<string> {
    if (!paper.pdfPath) throw new Error('This paper has no scan yet.');
    if (config.useMocks) throw new Error('PDFs need a connected Firebase project.');
    return getDownloadURL(ref(storage(), paper.pdfPath));
  },

  /** Saves the PDF into the app's documents folder for offline reading. */
  async download(paper: Paper): Promise<DownloadRecord> {
    const url = await this.remoteUrl(paper);
    const dir = papersDir();
    if (!dir.exists) dir.create({ intermediates: true });

    const target = new File(dir, `${paper.id}.pdf`);
    if (target.exists) target.delete();

    const file = await File.downloadFileAsync(url, target);
    const record: DownloadRecord = {
      paperId: paper.id,
      uri: file.uri,
      sizeBytes: file.size ?? null,
      downloadedAt: Date.now(),
    };
    await downloadsRepo.save(record);
    return record;
  },

  async remove(paperId: string): Promise<void> {
    const record = await downloadsRepo.get(paperId);
    if (record) {
      const file = new File(record.uri);
      if (file.exists) file.delete();
    }
    await downloadsRepo.remove(paperId);
  },
};
