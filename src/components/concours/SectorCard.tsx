import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { View } from 'react-native';

import { pluralize } from '@/lib/format';
import { useThemeColors } from '@/theme/tokens';
import type { ConcoursSector } from '@/types/models';

import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { DifficultyDots } from '../ui/DifficultyDots';
import { Text } from '../ui/Text';

type IconName = ComponentProps<typeof Ionicons>['name'];

/** Unique schools across all fields in a sector. */
export function countSchools(sector: ConcoursSector): number {
  return new Set(sector.fields.flatMap((f) => f.schools)).size;
}

export function SectorCard({ sector, onPress }: { sector: ConcoursSector; onPress: () => void }) {
  const colors = useThemeColors();
  // Same chip on every card (design brief, section 2): "N fields · N schools".
  const counts = `${pluralize(sector.fields.length, 'field')} · ${pluralize(countSchools(sector), 'school')}`;

  return (
    <Card
      onPress={onPress}
      accessibilityLabel={`${sector.name}: ${sector.blurb}. ${counts}`}
      className="flex-row gap-3"
    >
      <View className="h-14 w-14 items-center justify-center rounded-control bg-brand-soft">
        <Ionicons name={sector.icon as IconName} size={24} color={colors.brandDeep} />
      </View>
      <View className="flex-1 gap-1.5">
        <Text variant="h3">{sector.name}</Text>
        <Text variant="body" className="text-muted">
          {sector.blurb}
        </Text>
        <View className="flex-row flex-wrap items-center gap-x-3 gap-y-1.5">
          <Badge label={counts} tone="neutral" />
          <DifficultyDots level={sector.difficulty} />
        </View>
      </View>
    </Card>
  );
}
