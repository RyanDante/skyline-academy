import { View } from 'react-native';

import type { TeacherCredit as Credit } from '@/types/models';

import { Text } from '../ui/Text';

export function TeacherCredit({ author }: { author: Credit }) {
  return (
    <View className="flex-row items-center gap-3" accessibilityLabel={`Solved by ${author.name}, ${author.subject}`}>
      <View className="h-10 w-10 items-center justify-center rounded-full bg-brand-soft">
        <Text variant="label" className="font-body-semibold text-brand-deep">
          {author.initials}
        </Text>
      </View>
      <View>
        <Text variant="label" className="font-body-semibold">
          Solved by {author.name}
        </Text>
        <Text variant="caption">{author.subject}</Text>
      </View>
    </View>
  );
}
