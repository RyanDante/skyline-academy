import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { AiHeader } from '@/components/tutor/AiHeader';
import { Button, Chip, Screen, Text } from '@/components/ui';
import { SKYLER_STAGES, SKYLER_SUBJECTS, type SkylerStage } from '@/data/skyler';
import { useSkylerStore } from '@/stores/skylerStore';

/** Skyler's quick profile (brief 7.2): two taps, skippable. Makes eligibility realistic. */
export default function SkylerProfile() {
  const { profile, setProfile, skipProfile } = useSkylerStore();
  const [stage, setStage] = useState<SkylerStage | undefined>(profile?.stage);
  const [subjects, setSubjects] = useState<string[]>(profile?.subjects ?? []);

  const toggle = (s: string) =>
    setSubjects((list) => (list.includes(s) ? list.filter((x) => x !== s) : [...list, s]));

  return (
    <Screen
      topBar={<AiHeader persona="skyler" />}
      footer={
        <View className="gap-2">
          <Button
            label="Continue"
            variant="skyler"
            disabled={!stage}
            onPress={() => {
              if (!stage) return;
              setProfile({ stage, subjects });
              router.replace('/skyler/quiz');
            }}
          />
          <Button
            label="Skip for now"
            variant="ghost"
            onPress={() => {
              skipProfile();
              router.replace('/skyler/quiz');
            }}
          />
        </View>
      }
    >
      <Text variant="heading">Where are you now?</Text>
      <View className="flex-row flex-wrap gap-2">
        {SKYLER_STAGES.map((s) => (
          <Chip key={s.id} tone="skyler" label={s.label} selected={stage === s.id} onPress={() => setStage(s.id)} />
        ))}
      </View>

      <Text variant="heading" className="mt-4">
        Which subjects do you study?
      </Text>
      <Text variant="small" className="-mt-2">
        Pick all that apply. Skyler uses this to check entry requirements.
      </Text>
      <View className="flex-row flex-wrap gap-2">
        {SKYLER_SUBJECTS.map((s) => (
          <Chip key={s} tone="skyler" label={s} selected={subjects.includes(s)} onPress={() => toggle(s)} />
        ))}
      </View>
    </Screen>
  );
}
