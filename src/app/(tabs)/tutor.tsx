import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Alert, Pressable, View } from 'react-native';

import { AiAvatar } from '@/components/tutor/AiAvatar';
import { AiCard } from '@/components/tutor/AiCard';
import { Card, ListRow, Screen, SectionHeader, Text } from '@/components/ui';
import { product } from '@/lib/config';
import { useGceTutorStore } from '@/stores/gceTutorStore';
import { useSessionStore } from '@/stores/sessionStore';
import { useSkylerStore } from '@/stores/skylerStore';
import { useThemeColors } from '@/theme/tokens';

/** Tutor hub (design mockup 10): GCE Tutor, Skyler, and the conversation in progress. */
export default function TutorHub() {
  const colors = useThemeColors();
  const left = useSessionStore((s) => s.tutorQuestionsLeftToday());
  const unread = useSessionStore((s) => s.notifications.some((n) => !n.read));
  const rememberedLevel = useGceTutorStore((s) => s.lastLevel);
  const profileLevel = useSessionStore((s) => s.profile?.level);
  const session = useGceTutorStore((s) => s.session);
  const hasResult = useSkylerStore((s) => s.result !== null);
  const lastLevel = rememberedLevel ?? profileLevel;

  return (
    <Screen>
      <View className="flex-row items-start justify-between">
        <View className="flex-1">
          <Text variant="title" accessibilityRole="header">Tutor</Text>
          <Text variant="lead" className="text-muted">Your AI learning companion</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={unread ? 'Notifications, unread' : 'Notifications'}
          onPress={() => router.push('/notifications')}
          className="h-12 w-12 items-center justify-center rounded-full active:bg-surface-alt"
        >
          <Ionicons name="notifications-outline" size={26} color={colors.ink} />
          {unread ? <View className="absolute right-2.5 top-2.5 h-3 w-3 rounded-full border-2 border-bg bg-accent" /> : null}
        </Pressable>
      </View>

      <AiCard
        persona="tutor"
        title="GCE Tutor"
        description="Understand topics. Practise questions. Improve your results."
        actionLabel="Start Learning"
        onPress={() => router.push({ pathname: '/tutor/gce/setup', params: lastLevel ? { level: lastLevel } : {} })}
      />

      <AiCard
        persona="skyler"
        title="Skyler"
        description="Discover the Concours and career pathways that fit you."
        chip="10 questions · 3 min"
        actionLabel={hasResult ? 'See My Match' : 'Discover My Path'}
        onPress={() => router.push(hasResult ? '/skyler/result' : '/skyler/intro')}
      />

      {session && !session.finishedAt ? (
        <>
          <SectionHeader title="Continue your conversation" />
          <Card onPress={() => router.push('/tutor/gce/session')} className="flex-row items-center gap-3">
            <AiAvatar persona="tutor" size={52} />
            <View className="flex-1">
              <Text variant="h3" numberOfLines={1}>{session.title}</Text>
              <Text variant="small">
                Question {Math.min(session.index + 1, Math.max(session.questions.length, 1))} of{' '}
                {Math.max(session.questions.length, 1)}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.muted} />
          </Card>
        </>
      ) : null}

      {Number.isFinite(left) ? (
        <Pressable
          accessibilityRole="button"
          onPress={() =>
            Alert.alert(
              'Free AI replies',
              `You get ${product.freeTutorQuestionsPerDay} free AI replies a day. Multiple-choice marking, Skyline solutions and Skyler’s quiz are always free.`,
            )
          }
          className="min-h-12 flex-row items-center justify-center gap-2 rounded-full bg-surface-alt px-4"
        >
          <Ionicons name="sparkles-outline" size={18} color={colors.brandDeep} />
          <Text variant="label" className="text-brand-deep">{left} free AI replies left today</Text>
        </Pressable>
      ) : null}

      <ListRow
        icon="compass-outline"
        title="Browse all sectors"
        subtitle="Health, Engineering, Agriculture, Administration, Teaching"
        onPress={() => router.push('/(tabs)/concours')}
      />
    </Screen>
  );
}
