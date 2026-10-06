import { View } from 'react-native';

import { cn } from '@/lib/cn';
import { percent } from '@/lib/format';
import type { TopicReadiness, TopicStatus } from '@/types/models';

import { Text } from '../ui/Text';

const STATUS: Record<TopicStatus, { label: string; text: string; box: string }> = {
  strong: { label: 'Strong', text: 'text-brand-deep', box: 'bg-brand-soft' },
  developing: { label: 'Developing', text: 'text-ink', box: 'bg-surface border border-line' },
  weak: { label: 'Weak', text: 'text-accent-deep', box: 'bg-surface border-2 border-accent' },
  untested: { label: 'Untested', text: 'text-muted', box: 'bg-surface border border-line' },
  gap: { label: 'Not in GCE', text: 'text-accent-deep', box: 'bg-accent-soft' },
};

export function TopicStatusRow({ topic }: { topic: TopicReadiness }) {
  const s = STATUS[topic.status];
  const highWeight = topic.weight >= 0.15;
  const detail =
    topic.status === 'gap'
      ? 'Skyline prep covers this'
      : topic.mastery !== null
        ? `${percent(topic.mastery)} recent accuracy`
        : topic.attempts > 0
          ? `${topic.attempts} answered so far`
          : 'Try 10 questions';

  return (
    <View
      className={cn('flex-row items-center justify-between rounded-control px-3 py-2.5', s.box)}
      accessibilityLabel={`${topic.name}: ${s.label}. ${detail}`}
    >
      <View className="flex-1 pr-2">
        <Text variant="label">{topic.name}</Text>
        <Text variant="caption">{detail}</Text>
      </View>
      <Text variant="caption" className={cn('font-body-semibold', s.text)}>
        {s.label}
        {topic.status === 'weak' && highWeight ? ' · high weight' : ''}
      </Text>
    </View>
  );
}
