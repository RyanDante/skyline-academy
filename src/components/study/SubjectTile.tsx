import { Ionicons } from '@expo/vector-icons';
import { Pressable, View } from 'react-native';

import { cn } from '@/lib/cn';
import type { Subject } from '@/types/models';

import { Text } from '../ui/Text';
import { subjectColor, subjectIcon } from './subjectIcons';

/** Coloured subject tile (GCE mockup). Subjects without papers are dimmed "Coming soon". */
export function SubjectTile({ subject, onPress }: { subject: Subject; onPress: () => void }) {
  const color = subjectColor(subject.name);
  const comingSoon = subject.paperCount === 0;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: comingSoon }}
      accessibilityLabel={comingSoon ? `${subject.name}, coming soon` : subject.name}
      disabled={comingSoon}
      onPress={onPress}
      className={cn('min-h-[120px] w-[31%] justify-between rounded-card p-3 active:opacity-80', comingSoon && 'opacity-50')}
      style={{ backgroundColor: color.bg }}
    >
      <View className="h-12 w-12 items-center justify-center rounded-control" style={{ backgroundColor: color.fg }}>
        <Ionicons name={subjectIcon(subject.name)} size={26} color="#FFFFFF" />
      </View>
      <View className="flex-row items-end justify-between gap-1">
        <View className="flex-1">
          <Text variant="label" className="font-body-semibold text-[#173A43]" numberOfLines={2}>
            {subject.name}
          </Text>
          {comingSoon ? <Text variant="caption" className="text-[#55737B]">Coming soon</Text> : null}
        </View>
        {!comingSoon ? <Ionicons name="chevron-forward" size={16} color="#173A43" /> : null}
      </View>
    </Pressable>
  );
}
