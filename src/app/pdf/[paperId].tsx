import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import Pdf from 'react-native-pdf';

import { ErrorState, ScreenHeader, Skeleton, Text } from '@/components/ui';
import { usePaper } from '@/hooks/queries';
import { downloadsService } from '@/services/downloads';
import { useThemeColors } from '@/theme/tokens';

/** Opens the downloaded copy when there is one, otherwise streams (and caches) the remote PDF. */
export default function PdfViewer() {
  const { paperId } = useLocalSearchParams<{ paperId: string }>();
  const paper = usePaper(paperId);
  const colors = useThemeColors();
  const [page, setPage] = useState({ current: 1, total: 0 });
  const [renderError, setRenderError] = useState<string | null>(null);

  const source = useQuery({
    queryKey: ['pdf-source', paperId],
    enabled: !!paper.data,
    queryFn: async () => {
      const local = await downloadsService.get(paperId);
      if (local) return { uri: local.uri, cache: false };
      return { uri: await downloadsService.remoteUrl(paper.data!), cache: true };
    },
  });

  const title = paper.data ? `${paper.data.year} · Paper ${paper.data.paperNumber}` : 'Paper';

  return (
    <View className="flex-1 bg-bg">
      <ScreenHeader
        title={title}
        right={page.total ? <Text variant="caption">{`${page.current} / ${page.total}`}</Text> : undefined}
      />
      {source.isError || renderError ? (
        <ErrorState
          message={renderError ?? (source.error instanceof Error ? source.error.message : undefined)}
          onRetry={() => {
            setRenderError(null);
            void source.refetch();
          }}
        />
      ) : !source.data ? (
        <View className="gap-3 p-4">
          <Skeleton className="h-[480px] w-full rounded-card" />
        </View>
      ) : (
        <Pdf
          source={source.data}
          style={{ flex: 1, backgroundColor: colors.bg }}
          trustAllCerts={false}
          onLoadComplete={(total) => setPage((p) => ({ ...p, total }))}
          onPageChanged={(current, total) => setPage({ current, total })}
          onError={() => setRenderError("This PDF couldn't be opened. Try downloading it again.")}
        />
      )}
    </View>
  );
}
