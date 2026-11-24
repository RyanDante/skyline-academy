import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, TextInput, View } from 'react-native';

import { ReadinessCard } from '@/components/concours/ReadinessCard';
import { SectorCard } from '@/components/concours/SectorCard';
import {
  Button,
  Card,
  Chip,
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
import { useRequireAccount } from '@/hooks/useRequireAccount';
import { formatDate } from '@/lib/dates';
import { leadsService } from '@/services/leads';
import { useSessionStore } from '@/stores/sessionStore';
import { useThemeColors } from '@/theme/tokens';
import type { PathwayFamilyId, SectorId } from '@/types/models';

/** Institutions with readiness data belong to these pathway families. */
const SECTOR_FAMILY: Partial<Record<SectorId, PathwayFamilyId>> = {
  health: 'health',
  engineering: 'engineering',
  agriculture: 'agri-vet',
};

const FEATURED = 3;

/** Explore Concours (design mockup 9), plus My Concours, calendar and the National Mock. */
export default function Concours() {
  const colors = useThemeColors();
  const profile = useSessionStore((s) => s.profile);
  const targets = useSessionStore((s) => s.targets);
  const toggleTarget = useSessionStore((s) => s.toggleTarget);
  const requireAccount = useRequireAccount();
  const sectors = useSectors();
  const families = useFamilies();
  const institutions = useInstitutions();

  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<SectorId | 'all'>('all');
  const [showAllFeatured, setShowAllFeatured] = useState(false);

  const q = query.trim().toLowerCase();

  const visibleSectors = (sectors.data ?? []).filter((s) => filter === 'all' || s.id === filter);

  // Search across sectors, fields and schools.
  const fieldResults = useMemo(() => {
    if (!q) return [];
    return (sectors.data ?? []).flatMap((s) =>
      s.fields
        .filter(
          (f) =>
            f.name.toLowerCase().includes(q) ||
            s.name.toLowerCase().includes(q) ||
            f.schools.some((sc) => sc.toLowerCase().includes(q)),
        )
        .map((f) => ({ sector: s, field: f })),
    );
  }, [q, sectors.data]);

  const featured = useMemo(() => {
    const family = filter === 'all' ? null : SECTOR_FAMILY[filter];
    if (filter !== 'all' && !family) return [];
    return (institutions.data ?? []).filter(
      (i) =>
        (!family || i.familyId === family) &&
        (!q || i.name.toLowerCase().includes(q) || i.shortName.toLowerCase().includes(q) || i.programmes.some((p) => p.toLowerCase().includes(q))),
    );
  }, [institutions.data, filter, q]);

  const targetInstitutions = useMemo(
    () => (institutions.data ?? []).filter((i) => targets.includes(i.id)),
    [institutions.data, targets],
  );
  const readiness = useReadiness(targetInstitutions);
  const isOLevel = profile?.level === 'O';

  const star = (id: string) => {
    if (!requireAccount('target')) return;
    const result = toggleTarget(id);
    if (!result.ok && result.reason) Alert.alert('Target limit', result.reason);
  };

  return (
    <Screen
      onRefresh={() => {
        void sectors.refetch();
        void institutions.refetch();
      }}
    >
      <Text variant="title" accessibilityRole="header">
        Explore Concours
      </Text>

      <View className="h-14 flex-row items-center gap-3 rounded-control border border-line bg-surface px-4">
        <Ionicons name="search" size={22} color={colors.muted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search by institution, field or exam…"
          placeholderTextColor={colors.muted}
          accessibilityLabel="Search Concours"
          returnKeyType="search"
          className="flex-1 font-body text-body text-ink"
        />
        {query ? (
          <Pressable accessibilityRole="button" accessibilityLabel="Clear search" hitSlop={10} onPress={() => setQuery('')}>
            <Ionicons name="close-circle" size={20} color={colors.muted} />
          </Pressable>
        ) : null}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2">
        <Chip label="All" selected={filter === 'all'} onPress={() => setFilter('all')} />
        {(sectors.data ?? []).map((s) => (
          <Chip key={s.id} label={s.name} selected={filter === s.id} onPress={() => setFilter(s.id)} />
        ))}
      </ScrollView>

      {q ? (
        <>
          <SectionHeader title="Matching fields" />
          {fieldResults.length === 0 ? (
            <Text variant="body" className="text-muted">No field matches “{query}”.</Text>
          ) : (
            <View>
              {fieldResults.slice(0, 12).map(({ sector, field }) => (
                <ListRow
                  key={`${sector.id}-${field.id}`}
                  title={field.name}
                  subtitle={`${sector.name}${field.examWindow ? ` · exam ${field.examWindow}` : ''}`}
                  onPress={() => router.push({ pathname: '/concours/sector/[sectorId]', params: { sectorId: sector.id } })}
                  className="border-b border-line"
                />
              ))}
            </View>
          )}
        </>
      ) : (
        <>
          <SectionHeader title="Popular Sectors" />
          {sectors.isLoading ? (
            <SkeletonList rows={5} />
          ) : sectors.isError ? (
            <ErrorState onRetry={() => void sectors.refetch()} />
          ) : (
            <View className="gap-3">
              {visibleSectors.map((sector) => (
                <SectorCard
                  key={sector.id}
                  sector={sector}
                  onPress={() => router.push({ pathname: '/concours/sector/[sectorId]', params: { sectorId: sector.id } })}
                />
              ))}
            </View>
          )}
        </>
      )}

      {featured.length > 0 ? (
        <>
          <SectionHeader
            title="Featured Opportunities"
            actionLabel={featured.length > FEATURED ? (showAllFeatured ? 'Show less' : 'See all') : undefined}
            onAction={() => setShowAllFeatured((v) => !v)}
          />
          {(showAllFeatured ? featured : featured.slice(0, FEATURED)).map((inst) => {
            const tracked = targets.includes(inst.id);
            return (
              <Card
                key={inst.id}
                onPress={() => router.push({ pathname: '/concours/[institutionId]', params: { institutionId: inst.id } })}
                className="flex-row items-center gap-3"
              >
                <View className="h-14 w-14 items-center justify-center rounded-control bg-brand-soft">
                  <Ionicons name="school" size={28} color={colors.brandDeep} />
                </View>
                <View className="flex-1 gap-0.5">
                  <Text variant="h3" numberOfLines={1}>{inst.shortName}</Text>
                  <Text variant="small" numberOfLines={1}>{inst.programmes.slice(0, 2).join(', ')}</Text>
                  <Text variant="caption">
                    {inst.city}
                    {inst.examDate ? ` · exam ${formatDate(inst.examDate)}` : ''}
                  </Text>
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={tracked ? `Stop tracking ${inst.shortName}` : `Track ${inst.shortName}`}
                  onPress={() => star(inst.id)}
                  hitSlop={8}
                  className="h-12 w-12 items-center justify-center"
                >
                  <Ionicons name={tracked ? 'star' : 'star-outline'} size={24} color={tracked ? colors.accent : colors.muted} />
                </Pressable>
              </Card>
            );
          })}
        </>
      ) : null}

      {isOLevel ? (
        <Card className="gap-2">
          <Text variant="overline">Plan your A Levels</Text>
          <Text variant="h3">Your subject choice decides which doors open later.</Text>
          {(families.data ?? []).map((f) => (
            <Text key={f.id} variant="body" className="text-muted">
              {f.name}: usually {f.expectedALevels.join(' and ')}
            </Text>
          ))}
          <Button
            label="Book a Skyline orientation session"
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
          ) : targetInstitutions.length === 0 ? (
            <EmptyState
              icon="star-outline"
              title="Pick your targets"
              body="Tap the star on up to 3 opportunities above. We’ll show how ready you are and remind you before deadlines."
            />
          ) : (
            targetInstitutions.map((inst) => {
              const r = readiness.get(inst.id);
              return r ? (
                <ReadinessCard
                  key={inst.id}
                  institution={inst}
                  readiness={r}
                  onPress={() => router.push({ pathname: '/concours/[institutionId]', params: { institutionId: inst.id } })}
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
      <ListRow
        icon="help-circle-outline"
        title="New to Concours?"
        subtitle="What they are and how selection works, in 7 short steps"
        onPress={() => router.push('/concours/intro')}
      />

      <Card tone="warning" className="gap-1">
        <Text variant="overline" className="text-accent-deep">Skyline National Mock Concours</Text>
        <Text variant="h3">One timed mock, the same day across Cameroon</Text>
        <Text variant="body" className="text-muted">
          Free to enter. See your national percentile and how your school ranks. Dates are announced on Home.
        </Text>
      </Card>
    </Screen>
  );
}
