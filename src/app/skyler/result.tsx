import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useRef, type ComponentProps, type ReactNode } from 'react';
import { View } from 'react-native';

import { countSchools } from '@/components/concours/SectorCard';
import { ShareableCard, type ShareableCardHandle } from '@/components/share/ShareableCard';
import { AiHeader } from '@/components/tutor/AiHeader';
import {
  Badge,
  Button,
  Card,
  DifficultyDots,
  EmptyState,
  Screen,
  SectionHeader,
  SkeletonList,
  Text,
} from '@/components/ui';
import {
  bestFields,
  computeResult,
  sectorRequiredSubjects,
  STRENGTH_LABEL,
} from '@/domain/skyler';
import { useSectors, useSubjects } from '@/hooks/queries';
import { pluralize } from '@/lib/format';
import { useSessionStore } from '@/stores/sessionStore';
import { useSkylerStore } from '@/stores/skylerStore';
import { palette } from '@/theme/tokens';

type IconName = ComponentProps<typeof Ionicons>['name'];

/** Skyler's result (design brief 7.6). Scores and requirements come from code and data only. */
export default function SkylerResult() {
  const saved = useSkylerStore((s) => s.result);
  const profile = useSkylerStore((s) => s.profile);
  const restart = useSkylerStore((s) => s.restart);
  const firstName = useSessionStore((s) => s.profile?.firstName);
  const sectors = useSectors();
  const aLevelSubjects = useSubjects('A');
  const shareRef = useRef<ShareableCardHandle>(null);

  const result = useMemo(() => (saved ? computeResult(saved.answers) : null), [saved]);

  if (!saved || !result) {
    return (
      <View className="flex-1 bg-bg">
        <AiHeader persona="skyler" />
        <EmptyState
          icon="sparkles-outline"
          title="No match yet"
          body="Answer Skyler's 10 questions to see which Concours sector fits you."
          actionLabel="Find my path"
          onAction={() => router.replace('/skyler/intro')}
        />
      </View>
    );
  }
  if (sectors.isLoading || !sectors.data) {
    return (
      <Screen topBar={<AiHeader persona="skyler" />}>
        <SkeletonList />
      </Screen>
    );
  }

  const byId = new Map(sectors.data.map((s) => [s.id, s]));
  const top = byId.get(result.matches[0]!)!;
  const co = result.matches[1] ? byId.get(result.matches[1]) : undefined;
  const required = sectorRequiredSubjects(top);
  const fits = bestFields(top, profile);
  const alsoConsider = result.ranking
    .slice(1, 3)
    .map((r) => byId.get(r.sectorId))
    .filter((s) => !!s && s.id !== co?.id);

  // "Practise the key subjects": the first required subject the GCE Tutor has papers for.
  const practiseSubject = (aLevelSubjects.data ?? []).find(
    (s) => s.paperCount > 0 && required.some((r) => s.name.toLowerCase().includes(r.toLowerCase())),
  );

  const headline = co ? `${top.name} or ${co.name}` : top.name;

  return (
    <Screen
      topBar={<AiHeader persona="skyler" onBack={() => router.replace('/(tabs)/tutor')} />}
      hero={
        <View className="items-center gap-3 px-4 py-8" style={{ backgroundColor: palette.indigo }}>
          <View className="h-16 w-16 items-center justify-center rounded-full bg-white/15">
            <Ionicons name={top.icon as IconName} size={32} color={palette.white} />
          </View>
          <Badge label={co ? 'Co-matches' : STRENGTH_LABEL[result.strength]} tone="neutral" />
          <Text variant="title" className="text-center text-white" accessibilityRole="header">
            Skyler suggests: {headline}
          </Text>
        </View>
      }
    >
      <Card tone="skyler">
        <Text variant="h3">Why</Text>
        <Text variant="body" className="mt-1">
          {result.why}
        </Text>
        {co ? (
          <Text variant="small" className="mt-2">
            {top.name} and {co.name} scored almost the same. Explore both before you decide.
          </Text>
        ) : null}
      </Card>

      <SectionHeader title="What it takes" />
      <Card className="gap-3">
        <Row label="GCE subjects usually required">
          <Text variant="body">{required.length ? required.join(', ') : 'No specific subjects'}</Text>
        </Row>
        <Row label="Difficulty">
          <DifficultyDots level={top.difficulty} tone="skyler" />
        </Row>
        <Row label="Schools">
          <Text variant="body">{pluralize(countSchools(top), 'school')}</Text>
        </Row>
      </Card>

      <SectionHeader title="Best fields for you" />
      {!profile ? (
        <Text variant="small" className="-mt-2">
          Add your class and subjects to see which fields you already qualify for.
        </Text>
      ) : null}
      {fits.map(({ field, eligible, needs }) => (
        <Card key={field.id} className="gap-1.5">
          <View className="flex-row items-start justify-between gap-2">
            <Text variant="h3" className="flex-1">
              {field.name}
            </Text>
            {profile && eligible ? <Badge label="✓ You qualify" tone="success" /> : null}
          </View>
          {field.schools.length ? (
            <Text variant="small">{field.schools.slice(0, 3).join(' · ')}</Text>
          ) : null}
          {needs.map((n) => (
            <Text key={n} variant="label" className="text-accent-deep">
              {n}
            </Text>
          ))}
        </Card>
      ))}

      {alsoConsider.length > 0 ? (
        <>
          <SectionHeader title="Also consider" />
          <View className="flex-row gap-3">
            {alsoConsider.map((s) => (
              <Card
                key={s!.id}
                className="flex-1 gap-1"
                onPress={() =>
                  router.push({ pathname: '/concours/sector/[sectorId]', params: { sectorId: s!.id } })
                }
              >
                <Ionicons name={s!.icon as IconName} size={22} color={palette.indigo} />
                <Text variant="h3">{s!.name}</Text>
              </Card>
            ))}
          </View>
        </>
      ) : null}

      <View className="gap-2">
        <Button
          label="See schools"
          variant="skyler"
          icon="school-outline"
          onPress={() => router.push({ pathname: '/concours/sector/[sectorId]', params: { sectorId: top.id } })}
        />
        {practiseSubject ? (
          <Button
            label={`Practise ${practiseSubject.name}`}
            variant="secondary"
            icon="book-outline"
            onPress={() =>
              router.push({
                pathname: '/tutor/gce/setup',
                params: { level: 'A', subjectId: practiseSubject.id },
              })
            }
          />
        ) : null}
        <Button
          label="Share my match"
          variant="secondary"
          icon="share-social-outline"
          onPress={() => void shareRef.current?.share()}
        />
        <Button
          label="Retake the quiz"
          variant="ghost"
          icon="refresh"
          onPress={() => {
            restart();
            router.replace('/skyler/quiz');
          }}
        />
      </View>

      {/* Rendered for capture by "Share my match". */}
      <ShareableCard
        ref={shareRef}
        headline={`${firstName ?? 'My'} Concours match: ${headline}`}
        detail={`${STRENGTH_LABEL[result.strength]} · found with Skyler on the Skyline Academy app`}
      />

      <Text variant="small" className="text-center">
        Skyler gives guidance, not a guarantee. Always check the official Concours notice for dates and
        requirements.
      </Text>
    </Screen>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <View className="gap-1">
      <Text variant="caption">{label}</Text>
      {children}
    </View>
  );
}
