import { View } from 'react-native';

import { cn } from '@/lib/cn';

import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Text } from '../ui/Text';
import { AiAvatar, type AiPersona } from './AiAvatar';

interface AiCardProps {
  persona: AiPersona;
  title: string;
  subtitle?: string;
  description: string;
  chip?: string;
  actionLabel: string;
  onPress: () => void;
}

/** Full-width hub card for one AI guide, in that guide's accent colour (brief 3.2). */
export function AiCard({ persona, title, subtitle, description, chip, actionLabel, onPress }: AiCardProps) {
  const skyler = persona === 'skyler';
  return (
    <View
      className={cn(
        'gap-4 rounded-card border p-4',
        skyler ? 'border-skyler/25 bg-skyler-soft' : 'border-line bg-surface',
      )}
    >
      <View className="flex-row items-center gap-4">
        <AiAvatar persona={persona} />
        <View className="flex-1 gap-0.5">
          <Text variant="heading">{title}</Text>
          {subtitle ? (
            <Text variant="label" className={skyler ? 'text-skyler' : 'text-brand-deep'}>
              {subtitle}
            </Text>
          ) : null}
        </View>
      </View>
      <Text variant="body">{description}</Text>
      {chip ? <Badge label={chip} tone="neutral" /> : null}
      <Button label={actionLabel} variant={skyler ? 'skyler' : 'primary'} onPress={onPress} />
    </View>
  );
}
