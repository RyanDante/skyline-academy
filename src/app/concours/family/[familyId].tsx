import { router, useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { Alert, View } from 'react-native';

import {
  Badge,
  Button,
  Card,
  EmptyState,
  ProgressBar,
  Screen,
  ScreenHeader,
  SectionHeader,
  SkeletonList,
  Text,
} from '@/components/ui';
import { useFamilies, useInstitutions, useSubjects } from '@/hooks/queries';
import { useReadiness } from '@/hooks/useReadiness';
import { useRequireAccount } from '@/hooks/useRequireAccount';
import { percent } from '@/lib/format';
import { isLikelyEligible } from '@/services/concours';
import { useSessionStore } from '@/stores/sessionStore';
import type { PathwayFamilyId } from '@/types/models';

export default function FamilyScreen() {
  const { familyId } = useLocalSearchParams<{ familyId: PathwayFamilyId }>();
  const families = useFamilies();
  const institutions = useInstitutions(familyId);
  const readiness = useReadiness(institutions.data);
  const profile = useSessionStore((s) => s.profile);
  const targets = useSessionStore((s) => s.targets);
  const toggleTarget = useSessionStore((s) => s.toggleTarget);
  const requireAccount = useRequireAccount();
  const aLevelSubjects = useSubjects('A');

  const family = families.data?.find((f) => f.id === familyId);

  const eligibility = useMemo(() => {
    if (!family || profile?.level !== 'A') return null;
    const names = (aLevelSubjects.data ?? [])
      .filter((s) => profile.subjectIds.includes(s.id))
      .map((s) => s.name);
    return isLikelyEligible(family, names);
  }, [family, profile, aLevelSubjects.data]);

  const onToggle = (id: string) => {
    if (!requireAccount('target')) return;
    const result = toggleTarget(id);
    if (!result.ok && result.reason) Alert.alert('Target limit', result.reason);
  };

  return (
    <Screen topBar={<ScreenHeader title={family?.name ?? 'Pathway'} subtitle={family?.tagline} />}>
      {family ? (
        <Card tone="alt" className="gap-1">
          <Text variant="overline">Core subjects tested</Text>
          <Text variant="bodyStrong">{family.coreSubjects.join(' · ')}</Text>
        </Card>
      ) : null}

      {eligibility ? (
        <Card tone={eligibility.eligible ? 'soft' : 'warning'}>
          <Text variant="bodyStrong" className={eligibility.eligible ? 'text-brand-deep' : 'text-accent-deep'}>
            {eligibility.eligible ? 'Your A-Level subjects fit this pathway' : 'Check your subjects'}
          </Text>
          <Text variant="body" className="mt-1 text-muted">
            {eligibility.eligible
              ? 'Most schools here expect the subjects you take. Always confirm each school’s requirements.'
              : `Most schools here expect ${eligibility.missing.join(' and ')}. Talk to Skyline about your options.`}
          </Text>
        </Card>
      ) : null}

      <SectionHeader title="Institutions" />
      {institutions.isLoading ? (
        <SkeletonList rows={3} />
      ) : (institutions.data ?? []).length === 0 ? (
        <EmptyState icon="school-outline" title="Coming soon" body="Skyline is adding institutions for this pathway." />
      ) : (
        institutions.data!.map((inst) => {
          const r = readiness.get(inst.id);
          const tracked = targets.includes(inst.id);
          return (
            <Card
              key={inst.id}
              onPress={() => router.push({ pathname: '/concours/[institutionId]', params: { institutionId: inst.id } })}
              className="gap-2"
            >
              <View className="flex-row items-start justify-between gap-2">
                <View className="flex-1">
                  <Text variant="bodyStrong">{inst.shortName}</Text>
                  <Text variant="caption" numberOfLines={1}>
                    {inst.name} · {inst.city}
                  </Text>
                </View>
                <Badge
                  label={tracked ? 'Tracking' : 'Track'}
                  tone={tracked ? 'brand' : 'neutral'}
                />
              </View>
              {r ? (
                <View className="gap-1">
                  <ProgressBar value={r.score} />
                  <Text variant="caption">{percent(r.score)} academic readiness</Text>
                </View>
              ) : null}
              <Button
                label={tracked ? 'Stop tracking' : 'Add to My Concours'}
                variant="ghost"
                size="sm"
                icon={tracked ? 'remove-circle-outline' : 'add-circle-outline'}
                className="self-start px-0"
                onPress={() => onToggle(inst.id)}
              />
            </Card>
          );
        })
      )}
    </Screen>
  );
}
