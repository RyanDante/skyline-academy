import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { Pressable, View } from 'react-native';

import { pluralize } from '@/lib/format';
import { sectorColors } from '@/theme/tokens';
import type { ConcoursSector } from '@/types/models';

import { DifficultyDots } from '../ui/DifficultyDots';
import { Text } from '../ui/Text';

type IconName = ComponentProps<typeof Ionicons>['name'];

/** Unique schools across all fields in a sector. */
export function countSchools(sector: ConcoursSector): number {
  return new Set(sector.fields.flatMap((f) => f.schools)).size;
}

/** Coloured sector card (Concours mockup 9): icon circle, name, example fields. */
export function SectorCard({ sector, onPress }: { sector: ConcoursSector; onPress: () => void }) {
  const color = sectorColors[sector.id] ?? sectorColors.health!;
  const examples = sector.fields
    .slice(0, 2)
    .map((f) => f.name.split(/[,:(]/)[0]!.trim())
    .join(', ');
  const counts = `${pluralize(sector.fields.length, 'field')} · ${pluralize(countSchools(sector), 'school')}`;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${sector.name}: ${examples}. ${counts}`}
      onPress={onPress}
      className="flex-row items-center gap-4 rounded-card border p-4 active:opacity-80"
      style={{ backgroundColor: color.bg, borderColor: color.border }}
    >
      <View className="h-16 w-16 items-center justify-center rounded-full bg-white/80">
        <Ionicons name={sector.icon.replace('-outline', '') as IconName} size={30} color={color.fg} />
      </View>
      <View className="flex-1 gap-1">
        <Text variant="h3" className="text-[#173A43]">{sector.name}</Text>
        <Text variant="small" className="text-[#55737B]" numberOfLines={1}>
          {examples}…
        </Text>
        <View className="flex-row flex-wrap items-center gap-x-3 gap-y-1">
          <Text variant="caption" className="text-[#55737B]">{counts}</Text>
          <DifficultyDots level={sector.difficulty} />
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color={color.fg} />
    </Pressable>
  );
}
