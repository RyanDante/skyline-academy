import { useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useState } from 'react';

import { Button, Card, EmptyState, Screen, ScreenHeader, SectionHeader, Text, TextField } from '@/components/ui';
import { useGroups } from '@/hooks/queries';
import { useRequireAccount } from '@/hooks/useRequireAccount';
import { groupsService } from '@/services/groups';
import { useSessionStore } from '@/stores/sessionStore';

export default function Groups() {
  const joinedIds = useSessionStore((s) => s.joinedGroupIds);
  const joinGroup = useSessionStore((s) => s.joinGroup);
  const groups = useGroups(joinedIds);
  const requireAccount = useRequireAccount();
  const queryClient = useQueryClient();

  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);

  const join = async () => {
    if (!requireAccount('group')) return;
    setJoining(true);
    setError(null);
    try {
      const group = await groupsService.join(code);
      joinGroup(group.id);
      setCode('');
      await queryClient.invalidateQueries({ queryKey: ['groups'] });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not join. Check the code.');
    } finally {
      setJoining(false);
    }
  };

  return (
    <Screen topBar={<ScreenHeader title="Class groups" />}>
      <Text variant="body" className="text-muted">
        Practise with your class: a weekly challenge and a leaderboard among people you know.
      </Text>
      <TextField
        label="Join with a code"
        value={code}
        onChangeText={(v) => {
          setCode(v.toUpperCase());
          setError(null);
        }}
        autoCapitalize="characters"
        placeholder="SKY-4821"
        error={error}
        hint="Your teacher or class rep shares the code."
      />
      <Button label="Join group" variant="brand" onPress={join} loading={joining} disabled={code.trim().length < 4} />

      <SectionHeader title="Your groups" />
      {(groups.data ?? []).length === 0 ? (
        <EmptyState icon="people-outline" title="No groups yet" body="Join your class to see this week's challenge." />
      ) : (
        groups.data!.map((g) => (
          <Card key={g.id} onPress={() => router.push({ pathname: '/groups/[groupId]', params: { groupId: g.id } })}>
            <Text variant="bodyStrong">{g.name}</Text>
            <Text variant="caption">
              {g.memberCount} members · {g.weeklyChallenge}
            </Text>
          </Card>
        ))
      )}
    </Screen>
  );
}
