import { useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { View } from 'react-native';

import { FieldCard } from '@/components/concours/FieldCard';
import {
  Button,
  Card,
  EmptyState,
  ErrorState,
  Screen,
  ScreenHeader,
  SectionHeader,
  SkeletonList,
  Text,
} from '@/components/ui';
import { useInstitutions, useSector } from '@/hooks/queries';
import { leadsService } from '@/services/leads';
import { useSessionStore } from '@/stores/sessionStore';
import { useThemeColors } from '@/theme/tokens';
import type { SectorId } from '@/types/models';

export default function SectorScreen() {
  const { sectorId } = useLocalSearchParams<{ sectorId: SectorId }>();
  const sector = useSector(sectorId);
  const institutions = useInstitutions();
  const firstName = useSessionStore((s) => s.profile?.firstName ?? 'a student');
  const colors = useThemeColors();

  const institutionNames = useMemo(
    () => Object.fromEntries((institutions.data ?? []).map((i) => [i.id, i.shortName])),
    [institutions.data],
  );

  const s = sector.data;

  return (
    <Screen
      topBar={<ScreenHeader title={s?.name ?? 'Concours'} />}
      hero={
        s ? (
          <View className="gap-2 px-4 py-6" style={{ backgroundColor: colors.heroBg }}>
            <Text variant="overline" className="text-brand-soft">
              {s.name} Concours
            </Text>
            <Text variant="title" className="text-white" accessibilityRole="header">
              {s.headline}
            </Text>
          </View>
        ) : undefined
      }
    >
      {sector.isLoading ? (
        <SkeletonList />
      ) : sector.isError ? (
        <ErrorState onRetry={() => void sector.refetch()} />
      ) : !s ? (
        <EmptyState icon="school-outline" title="Sector not found" body="It may have been renamed." />
      ) : (
        <>
          <SectionHeader title={s.listLabel === 'Schools' ? 'Top schools' : 'Fields'} />
          <Text variant="caption" className="-mt-2">
            Tap any {s.listLabel === 'Schools' ? 'school' : 'field'} for requirements and where to study.
          </Text>
          {s.fields.map((field) => (
            <FieldCard
              key={field.id}
              field={field}
              institutionNames={institutionNames}
              onAsk={() => void leadsService.askAboutSector(firstName, s.name, field.name)}
            />
          ))}

          <Card tone="soft" className="mt-2 gap-3">
            <Text variant="bodyStrong">Questions about any of these {s.listLabel.toLowerCase()}?</Text>
            <Text variant="body" className="text-muted">
              Chat with a Skyline admin or tutor on WhatsApp about requirements, dates and how to prepare.
            </Text>
            <Button
              label="Chat with Skyline on WhatsApp"
              variant="brand"
              icon="logo-whatsapp"
              onPress={() => void leadsService.askAboutSector(firstName, s.name)}
            />
          </Card>
        </>
      )}
    </Screen>
  );
}
