import { router } from 'expo-router';
import { Alert, Pressable, View } from 'react-native';

import { AiCard } from '@/components/tutor/AiCard';
import { ListRow, Screen, Text } from '@/components/ui';
import { product } from '@/lib/config';
import { useGceTutorStore } from '@/stores/gceTutorStore';
import { useSessionStore } from '@/stores/sessionStore';
import { useSkylerStore } from '@/stores/skylerStore';

/**
 * Tutor hub (design brief 3.2, moved under the Tutor tab per the brief's NB):
 * the student picks which AI guide to talk to.
 */
export default function TutorHub() {
  const left = useSessionStore((s) => s.tutorQuestionsLeftToday());
  const rememberedLevel = useGceTutorStore((s) => s.lastLevel);
  const profileLevel = useSessionStore((s) => s.profile?.level);
  const lastLevel = rememberedLevel ?? profileLevel;
  const hasResult = useSkylerStore((s) => s.result !== null);

  return (
    <Screen>
      <View className="flex-row items-start justify-between gap-3">
        <Text variant="title" accessibilityRole="header" className="flex-1">
          Who would you like to talk to today?
        </Text>
        {Number.isFinite(left) ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${left} free AI replies left today. Tap for details.`}
            onPress={() =>
              Alert.alert(
                'Free AI replies',
                `You get ${product.freeTutorQuestionsPerDay} free AI replies a day. Multiple-choice marking, Skyline solutions and Skyler's quiz are always free.`,
              )
            }
            className="mt-1 min-h-12 justify-center rounded-full bg-brand-soft px-3"
          >
            <Text variant="caption" className="text-brand-deep">
              {left} free left today
            </Text>
          </Pressable>
        ) : null}
      </View>

      <AiCard
        persona="tutor"
        title="GCE Tutor"
        description="Study for your O or A Level with real past-paper questions."
        actionLabel="Start studying"
        onPress={() =>
          router.push({
            pathname: '/tutor/gce/setup',
            params: lastLevel ? { level: lastLevel } : {},
          })
        }
      />

      <AiCard
        persona="skyler"
        title="Skyler"
        subtitle="Concours Pathway Guide"
        description="Not sure which Concours fits you? Answer 10 quick questions and I will suggest your best path."
        chip="10 questions · 3 min"
        actionLabel={hasResult ? 'See my match' : 'Find my path'}
        onPress={() => router.push(hasResult ? '/skyler/result' : '/skyler/intro')}
      />

      <View className="mt-2 flex-row items-center gap-3">
        <View className="h-px flex-1 bg-line" />
        <Text variant="small">Or explore on your own</Text>
        <View className="h-px flex-1 bg-line" />
      </View>

      <ListRow
        icon="compass-outline"
        title="Browse all sectors"
        subtitle="Health, Engineering, Agriculture, Administration, Teaching"
        onPress={() => router.push('/(tabs)/concours')}
      />
    </Screen>
  );
}
