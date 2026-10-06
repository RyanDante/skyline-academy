import { router } from 'expo-router';
import { useMemo } from 'react';
import { View } from 'react-native';

import { ReadinessCard } from '@/components/concours/ReadinessCard';
import { SectorCard } from '@/components/concours/SectorCard';
import {
  Button,
  Card,
  EmptyState,
  ErrorState,
  ListRow,
  Screen,
  SectionHeader,
  SkeletonList,
  Text,
} from '@/components/ui';
import { useFamilies, useInstitutions, useSectors } from '@/hooks/queries';
import { useReadiness } from '@/hooks/useReadiness';
import { leadsService } from '@/services/leads';
import { useSessionStore } from '@/stores/sessionStore';

export default function Concours() {
  const profile = useSessionStore((s) => s.profile);
  const targets = useSessionStore((s) => s.targets);
  const sectors = useSectors();
  const families = useFamilies();
  const institutions = useInstitutions();

  const targetInstitutions = useMemo(
    () => (institutions.data ?? []).filter((i) => targets.includes(i.id)),
    [institutions.data, targets],
  );
  const readiness = useReadiness(targetInstitutions);
  const isOLevel = profile?.level === 'O';

  return (
    <Screen
      onRefresh={() => {
        void sectors.refetch();
        void institutions.refetch();
      }}
    >
      <Text variant="title" accessibilityRole="header">
        Concours
      </Text>
      <Text variant="body" className="-mt-2 text-muted">
        Explore the sectors, the fields inside them and the top schools to study them.
      </Text>

      <SectionHeader title="Explore sectors" />
      {sectors.isLoading ? (
        <SkeletonList rows={5} />
      ) : sectors.isError ? (
        <ErrorState onRetry={() => void sectors.refetch()} />
      ) : (
        <View className="gap-3">
          {(sectors.data ?? []).map((sector) => (
            <SectorCard
              key={sector.id}
              sector={sector}
              onPress={() => router.push({ pathname: '/concours/sector/[sectorId]', params: { sectorId: sector.id } })}
            />
          ))}
        </View>
      )}

      <Card tone="soft" onPress={() => router.push('/concours/intro')}>
        <Text variant="bodyStrong">New to Concours?</Text>
        <Text variant="body" className="mt-1 text-muted">
          What they are, who can apply, and how selection works, in 7 short steps.
        </Text>
      </Card>

      {isOLevel ? (
        <Card className="gap-2">
          <Text variant="overline">Plan your A Levels</Text>
          <Text variant="bodyStrong">Your subject choice decides which doors open later.</Text>
          {(families.data ?? []).map((f) => (
            <Text key={f.id} variant="body" className="text-muted">
              {f.name}: usually {f.expectedALevels.join(' and ')}
            </Text>
          ))}
          <Button
            label="Book a Skyline orientation session"
            variant="brand"
            className="mt-2"
            onPress={() =>
              void leadsService.talkToSkyline(
                { institutionId: '', institutionName: '', readinessScore: 0, weakTopics: [], source: 'orientation' },
                profile?.firstName ?? 'a student',
              )
            }
          />
        </Card>
      ) : (
        <>
          <SectionHeader title="My Concours" />
          {institutions.isLoading ? (
            <SkeletonList rows={2} />
          ) : institutions.isError ? (
            <ErrorState onRetry={() => void institutions.refetch()} />
          ) : targetInstitutions.length === 0 ? (
            <EmptyState
              icon="flag-outline"
              title="Pick your targets"
              body="Open a sector above, then a field's “Check your readiness” link, and add up to 3 schools. We'll show how ready you are and remind you before deadlines."
            />
          ) : (
            targetInstitutions.map((inst) => {
              const r = readiness.get(inst.id);
              return r ? (
                <ReadinessCard
                  key={inst.id}
                  institution={inst}
                  readiness={r}
                  onPress={() =>
                    router.push({ pathname: '/concours/[institutionId]', params: { institutionId: inst.id } })
                  }
                />
              ) : null;
            })
          )}
        </>
      )}

      <ListRow
        icon="calendar-outline"
        title="Concours calendar"
        subtitle="Exam dates and deadlines, with clash warnings"
        onPress={() => router.push('/concours/calendar')}
      />

      <Card tone="warning" className="gap-1">
        <Text variant="overline" className="text-accent-deep">
          Skyline National Mock Concours
        </Text>
        <Text variant="bodyStrong">One timed mock, the same day across Cameroon</Text>
        <Text variant="body" className="text-muted">
          Free to enter. See your national percentile and how your school ranks. Dates are announced on Home.
        </Text>
      </Card>
    </Screen>
  );
}
