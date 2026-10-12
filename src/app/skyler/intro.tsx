import { router } from 'expo-router';
import { View } from 'react-native';

import { AiAvatar } from '@/components/tutor/AiAvatar';
import { AiHeader } from '@/components/tutor/AiHeader';
import { Badge, Button, Screen, Text } from '@/components/ui';
import type { SkylerStage } from '@/data/skyler';
import { useSubjects } from '@/hooks/queries';
import { useSessionStore } from '@/stores/sessionStore';
import { isQuizComplete, useSkylerStore } from '@/stores/skylerStore';

const FORM_TO_STAGE: Record<string, SkylerStage> = {
  'Form 4': 'form5',
  'Form 5': 'form5',
  'Lower Sixth': 'lower6',
  'Upper Sixth': 'upper6',
};

/** Skyler intro (design brief 7.2). */
export default function SkylerIntro() {
  const { answers, index, profile, profileSkipped, setProfile, restart } = useSkylerStore();
  const appProfile = useSessionStore((s) => s.profile);
  const subjects = useSubjects(appProfile?.level ?? 'A');

  const inProgress = !isQuizComplete(answers) && answers.some((a) => a !== null);

  /** Reuse the app profile when it exists, so the quick profile step is skipped (brief 7.2). */
  const ensureProfile = (): boolean => {
    if (profile || profileSkipped) return true;
    const stage = appProfile ? FORM_TO_STAGE[appProfile.form] : undefined;
    const names = (subjects.data ?? [])
      .filter((s) => appProfile?.subjectIds.includes(s.id))
      .map((s) => s.name);
    if (stage && names.length > 0) {
      setProfile({ stage, subjects: names });
      return true;
    }
    return false;
  };

  const go = (fresh: boolean) => {
    if (fresh) restart();
    router.push(ensureProfile() ? '/skyler/quiz' : '/skyler/profile');
  };

  return (
    <Screen
      topBar={<AiHeader persona="skyler" />}
      footer={
        <View className="gap-2">
          {inProgress ? (
            <>
              <Button label={`Continue (${index + 1} of 10)`} variant="skyler" onPress={() => go(false)} />
              <Button label="Start over" variant="ghost" onPress={() => go(true)} />
            </>
          ) : (
            <Button label="Let’s start" variant="skyler" onPress={() => go(true)} />
          )}
        </View>
      }
    >
      <View className="items-center gap-4 pt-4">
        <AiAvatar persona="skyler" size={96} />
        <Text variant="title" className="text-center">
          Hi, I am Skyler.
        </Text>
        <Text variant="lead" className="text-center">
          Answer 10 quick questions and I will suggest the Concours that fits you best. There are no right or
          wrong answers.
        </Text>
        <Badge label="10 questions · about 3 minutes" tone="neutral" />
      </View>
      <Text variant="small" className="mt-4 text-center">
        Your answers are saved only on your profile and are never shared with anyone else.
      </Text>
    </Screen>
  );
}
