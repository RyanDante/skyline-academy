import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { useThemeColors } from '@/theme/tokens';
import type { ConcoursField } from '@/types/models';

import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Text } from '../ui/Text';

interface FieldCardProps {
  field: ConcoursField;
  /** Display names for linked readiness institutions, keyed by institution id. */
  institutionNames: Record<string, string>;
  onAsk: () => void;
}

/** A field (or school) on a sector page. Collapsed by default; tap to see requirements and schools. */
export function FieldCard({ field, institutionNames, onAsk }: FieldCardProps) {
  const colors = useThemeColors();
  const [open, setOpen] = useState(false);
  const readinessLinks = (field.institutionIds ?? []).filter((id) => institutionNames[id]);

  return (
    <View className="overflow-hidden rounded-card border border-line bg-surface">
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        accessibilityHint={open ? 'Hides details' : 'Shows requirements and schools'}
        onPress={() => setOpen((o) => !o)}
        className="gap-2 p-4 active:bg-surface-alt"
      >
        <View className="flex-row items-start gap-2">
          <Text variant="bodyStrong" className="flex-1">
            {field.name}
          </Text>
          <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={20} color={colors.muted} />
        </View>
        <Text variant="body" className="text-muted" numberOfLines={open ? undefined : 3}>
          {field.summary}
        </Text>
        <View className="flex-row flex-wrap gap-2">
          <Badge
            label={field.examWindow ? `Exam window: ${field.examWindow}` : 'Exam window: ask Skyline'}
            tone={field.examWindow ? 'brand' : 'neutral'}
          />
          {field.toConfirm ? <Badge label="To confirm" tone="accent" /> : null}
        </View>
      </Pressable>

      {open ? (
        <View className="gap-4 border-t border-line px-4 pb-4 pt-3">
          <Section title="Requirements" items={field.requirements} />
          <Section
            title="Top schools"
            items={field.schools.length > 0 ? field.schools : ['Skyline will confirm the schools for this field.']}
          />

          {readinessLinks.length > 0 ? (
            <View className="gap-1">
              <Text variant="overline">Check your readiness</Text>
              {readinessLinks.map((id) => (
                <Pressable
                  key={id}
                  accessibilityRole="link"
                  onPress={() => router.push({ pathname: '/concours/[institutionId]', params: { institutionId: id } })}
                  className="min-h-11 flex-row items-center gap-2"
                >
                  <Ionicons name="speedometer-outline" size={18} color={colors.brandDeep} />
                  <Text variant="label" className="text-brand-deep">
                    {institutionNames[id]}
                  </Text>
                </Pressable>
              ))}
            </View>
          ) : null}

          {field.toConfirm ? (
            <Text variant="caption" className="text-accent-deep">
              Some details here are still being confirmed. Ask Skyline before you apply.
            </Text>
          ) : null}

          <Button
            label="Ask about this field"
            variant="secondary"
            size="sm"
            icon="logo-whatsapp"
            className="self-start"
            onPress={onAsk}
          />
        </View>
      ) : null}
    </View>
  );
}

function Section({ title, items }: { title: string; items: string[] }) {
  return (
    <View className="gap-1">
      <Text variant="overline">{title}</Text>
      {items.map((item) => (
        <View key={item} className="flex-row gap-2">
          <Text variant="body">•</Text>
          <Text variant="body" className="flex-1">
            {item}
          </Text>
        </View>
      ))}
    </View>
  );
}
