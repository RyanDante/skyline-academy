import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, View } from 'react-native';

import { formatCFA } from '@/lib/format';
import { product } from '@/lib/config';
import { hasPaperAnswers, useSessionStore } from '@/stores/sessionStore';
import { useThemeColors } from '@/theme/tokens';
import type { Paper } from '@/types/models';

import { Button } from '../ui/Button';
import { Text } from '../ui/Text';

/**
 * One paper on the subject page (GCE mockup 8): the question paper with Download, then
 * "Proposed Answers · Skyline Solution" behind a 100 XAF unlock.
 */
export function PaperRow({ paper, downloaded }: { paper: Paper; downloaded: boolean }) {
  const colors = useThemeColors();
  const entitlement = useSessionStore((s) => s.entitlement);
  const unlocked = hasPaperAnswers(entitlement, paper.id, paper.subjectId);
  const open = () => router.push({ pathname: '/paper/[paperId]', params: { paperId: paper.id } });

  return (
    <View className="gap-4 border-b border-line py-4">
      <View className="flex-row items-center gap-3">
        <Pressable accessibilityRole="button" onPress={open} className="flex-1 gap-1">
          <Text variant="heading">Paper {paper.paperNumber}</Text>
          <View className="flex-row items-center gap-1.5">
            <Ionicons name="document-text-outline" size={16} color={colors.muted} />
            <Text variant="small">
              Question Paper
              {paper.questionCount > 0 ? ` · ${paper.questionCount} interactive` : ''}
            </Text>
          </View>
        </Pressable>
        <Button
          label={downloaded ? 'Saved' : 'Open'}
          size="sm"
          icon={downloaded ? 'checkmark' : 'download-outline'}
          variant={downloaded ? 'secondary' : 'primary'}
          onPress={open}
        />
      </View>

      <View className="flex-row items-center gap-3">
        <Ionicons
          name={unlocked ? 'lock-open' : 'lock-closed'}
          size={22}
          color={unlocked ? colors.success : '#2F80ED'}
        />
        <View className="flex-1">
          <Text variant="bodyStrong">Proposed Answers</Text>
          <Text variant="small">Skyline Solution</Text>
        </View>
        {unlocked ? (
          <Button label="View" size="sm" variant="secondary" onPress={open} />
        ) : (
          <Button
            label={formatCFA(product.prices.paperAnswers).replace(' CFA', ' XAF')}
            size="sm"
            variant="secondary"
            icon="lock-closed-outline"
            onPress={() => router.push({ pathname: '/unlock/[paperId]', params: { paperId: paper.id } })}
          />
        )}
      </View>
    </View>
  );
}
