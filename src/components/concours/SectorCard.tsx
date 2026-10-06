import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { View } from 'react-native';

import { pluralize } from '@/lib/format';
import { useThemeColors } from '@/theme/tokens';
import type { ConcoursSector } from '@/types/models';

import { Card } from '../ui/Card';
import { Text } from '../ui/Text';

type IconName = ComponentProps<typeof Ionicons>['name'];

export function SectorCard({ sector, onPress }: { sector: ConcoursSector; onPress: () => void }) {
  const colors = useThemeColors();
  const count = pluralize(sector.fields.length, sector.listLabel === 'Schools' ? 'school' : 'field');

  return (
    <Card onPress={onPress} accessibilityLabel={`${sector.name}: ${sector.blurb}`} className="flex-row gap-3">
      <View className="h-12 w-12 items-center justify-center rounded-control bg-brand-soft">
        <Ionicons name={sector.icon as IconName} size={24} color={colors.brandDeep} />
      </View>
      <View className="flex-1 gap-1">
        <View className="flex-row items-center justify-between">
          <Text variant="bodyStrong">{sector.name}</Text>
          <Text variant="caption">{count}</Text>
        </View>
        <Text variant="body" className="text-muted">
          {sector.blurb}
        </Text>
      </View>
    </Card>
  );
}
