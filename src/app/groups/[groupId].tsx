import { useLocalSearchParams } from 'expo-router';
import { Share, View } from 'react-native';

import {
  Button,
  Card,
  Screen,
  ScreenHeader,
  SectionHeader,
  SkeletonList,
  Text,
} from '@/components/ui';
import { useGroups, useLeaderboard } from '@/hooks/queries';
import { cn } from '@/lib/cn';
import { useSessionStore } from '@/stores/sessionStore';

export default function GroupScreen() {
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const groups = useGroups([groupId]);
  const leaderboard = useLeaderboard(groupId);
  const uid = useSessionStore((s) => s.uid);
  const group = groups.data?.[0];

  const invite = () =>
    group &&
    void Share.share({
      message: `Join "${group.name}" on Skyline Academy with code ${group.joinCode}. Weekly challenge: ${group.weeklyChallenge}.`,
    });

  return (
    <Screen
      topBar={<ScreenHeader title={group?.name ?? 'Group'} />}
      footer={<Button label="Invite classmates" variant="brand" icon="share-social-outline" onPress={invite} />}
    >
      {group ? (
        <Card tone="warning">
          <Text variant="overline" className="text-accent-deep">
            This week’s challenge
          </Text>
          <Text variant="bodyStrong" className="mt-1">
            {group.weeklyChallenge}
          </Text>
        </Card>
      ) : null}

      <SectionHeader title="Leaderboard this week" />
      {leaderboard.isLoading ? (
        <SkeletonList rows={4} />
      ) : (
        <View className="gap-2">
          {(leaderboard.data ?? []).map((entry, i) => (
            <View
              key={entry.uid}
              className={cn(
                'flex-row items-center gap-3 rounded-control px-3 py-3',
                entry.uid === uid ? 'bg-brand-soft' : 'bg-surface',
              )}
            >
              <Text variant="heading" className="w-8 text-center">
                {i + 1}
              </Text>
              <View className="flex-1">
                <Text variant="bodyStrong">{entry.displayName}</Text>
                {entry.schoolName ? <Text variant="caption">{entry.schoolName}</Text> : null}
              </View>
              <Text variant="bodyStrong" className="text-brand-deep">
                {entry.correctThisWeek}
              </Text>
            </View>
          ))}
          <Text variant="caption">Correct answers this week. Resets every Monday.</Text>
        </View>
      )}
    </Screen>
  );
}
