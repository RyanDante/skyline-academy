import { useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { View } from 'react-native';

import { Button, EmptyState, ListRow, Screen, ScreenHeader, Text } from '@/components/ui';
import { queryKeys, useDownloads, usePaper, useSubject } from '@/hooks/queries';
import type { DownloadRecord } from '@/db/downloadsRepo';
import { downloadsService } from '@/services/downloads';

export default function Downloads() {
  const downloads = useDownloads();
  const total = (downloads.data ?? []).reduce((sum, d) => sum + (d.sizeBytes ?? 0), 0);

  return (
    <Screen topBar={<ScreenHeader title="Downloads" />}>
      {(downloads.data ?? []).length === 0 ? (
        <EmptyState
          icon="download-outline"
          title="Study without data"
          body="Download papers from any paper page and they open here even when you're offline."
          actionLabel="Browse papers"
          onAction={() => router.push('/(tabs)/gce')}
        />
      ) : (
        <>
          <Text variant="caption">{(total / 1_048_576).toFixed(1)} MB used on this phone</Text>
          <View>
            {downloads.data!.map((d) => (
              <DownloadRow key={d.paperId} record={d} />
            ))}
          </View>
        </>
      )}
    </Screen>
  );
}

function DownloadRow({ record }: { record: DownloadRecord }) {
  const paper = usePaper(record.paperId);
  const subject = useSubject(paper.data?.subjectId);
  const queryClient = useQueryClient();

  const remove = async () => {
    await downloadsService.remove(record.paperId);
    await queryClient.invalidateQueries({ queryKey: queryKeys.downloads });
  };

  const title = paper.data
    ? `${subject.data?.name ?? ''} ${paper.data.year} · Paper ${paper.data.paperNumber}`
    : record.paperId;

  return (
    <ListRow
      icon="document-text-outline"
      title={title}
      subtitle={record.sizeBytes ? `${(record.sizeBytes / 1_048_576).toFixed(1)} MB` : undefined}
      onPress={() => router.push({ pathname: '/pdf/[paperId]', params: { paperId: record.paperId } })}
      trailing={<Button label="Remove" variant="ghost" size="sm" onPress={remove} />}
      className="border-b border-line"
    />
  );
}
