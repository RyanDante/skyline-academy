import { View } from 'react-native';

import { cn } from '@/lib/cn';

import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Text } from '../ui/Text';
import { AiAvatar, type AiPersona } from './AiAvatar';

interface AiCardProps {
  persona: AiPersona;
  title: string;
  description: string;
  chip?: string;
  actionLabel: string;
  onPress: () => void;
}

/** Hub card for one AI guide (Tutor mockup 10): big avatar left, text and button right. */
export function AiCard({ persona, title, description, chip, actionLabel, onPress }: AiCardProps) {
  const skyler = persona === 'skyler';
  return (
    <View
      className={cn(
        'flex-row items-center gap-4 rounded-card border p-4',
        skyler ? 'border-accent/30 bg-skyler-soft' : 'border-brand/30 bg-brand-soft/60',
      )}
    >
      <AiAvatar persona={persona} size={88} />
      <View className="flex-1 gap-2">
        <Text variant="heading">{title}</Text>
        <Text variant="body" className="text-muted">{description}</Text>
        {chip ? <Badge label={chip} tone={skyler ? 'accent' : 'brand'} /> : null}
        <Button label={actionLabel} variant={skyler ? 'skyler' : 'primary'} onPress={onPress} />
      </View>
    </View>
  );
}
