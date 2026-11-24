import Constants from 'expo-constants';
import * as Linking from 'expo-linking';
import { router } from 'expo-router';
import { useMemo } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Alert, Pressable, View } from 'react-native';

import { Button, Card, ListRow, ProgressBar, Screen, SectionHeader, Text } from '@/components/ui';
import { accuracy } from '@/domain/mastery';
import { currentStreak, overallAccuracy } from '@/domain/stats';
import { computeResult } from '@/domain/skyler';
import { useAttempts, useSectors, useSubjects } from '@/hooks/queries';
import { cacheRepo } from '@/db/cacheRepo';
import { formatDate } from '@/lib/dates';
import { pluralize } from '@/lib/format';
import { authService } from '@/services/auth';
import { leadsService } from '@/services/leads';
import { hasFullAccess, useSessionStore } from '@/stores/sessionStore';
import { useSkylerStore } from '@/stores/skylerStore';
import { useThemeColors } from '@/theme/tokens';

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <View className="flex-1 items-center gap-0.5">
      <Text variant="heading" className="text-brand-deep">{value}</Text>
      <Text variant="caption" className="text-center">{label}</Text>
    </View>
  );
}

export default function Me() {
  const profile = useSessionStore((s) => s.profile);
  const uid = useSessionStore((s) => s.uid);
  const phone = useSessionStore((s) => s.phone);
  const entitlement = useSessionStore((s) => s.entitlement);
  const signOutLocal = useSessionStore((s) => s.signOut);
  const revisionPlan = useSessionStore((s) => s.revisionPlan);
  const quizHistory = useSessionStore((s) => s.quizHistory);
  const unread = useSessionStore((s) => s.notifications.filter((n) => !n.read).length);
  const colors = useThemeColors();
  const removeFromRevisionPlan = useSessionStore((s) => s.removeFromRevisionPlan);
  const skylerAnswers = useSkylerStore((s) => s.result?.answers);
  const sectors = useSectors();
  const { data: attempts } = useAttempts();
  const subjects = useSubjects(profile?.level ?? 'A');

  // Last Skyler result, recomputed from the saved answers and current sector names.
  const skylerMatch = useMemo(() => {
    if (!skylerAnswers) return null;
    const { matches } = computeResult(skylerAnswers);
    const names = new Map((sectors.data ?? []).map((s) => [s.id, s.name]));
    return matches.map((id) => names.get(id) ?? id).join(' or ');
  }, [skylerAnswers, sectors.data]);

  const progress = useMemo(
    () =>
      (subjects.data ?? [])
        .filter((s) => profile?.subjectIds.includes(s.id))
        .map((s) => {
          const list = (attempts ?? []).filter((a) => a.subjectId === s.id);
          return { subject: s, count: list.length, acc: accuracy(list) };
        }),
    [subjects.data, attempts, profile?.subjectIds],
  );

  const paid = hasFullAccess(entitlement);
  const all = attempts ?? [];
  const streak = currentStreak(all);
  const acc = overallAccuracy(all);
  const name = profile?.fullName || profile?.firstName || 'Your profile';
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('');

  const signOut = () =>
    Alert.alert('Sign out?', 'Your downloads stay on this phone. Progress is saved to your account.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: async () => {
          await authService.signOut();
          signOutLocal();
        },
      },
    ]);

  return (
    <Screen>
      <View className="flex-row items-center justify-between">
        <Text variant="title" accessibilityRole="header">Me</Text>
        <View className="flex-row">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={unread ? `Notifications, ${unread} unread` : 'Notifications'}
            onPress={() => router.push('/notifications')}
            className="h-12 w-12 items-center justify-center rounded-full active:bg-surface-alt"
          >
            <Ionicons name="notifications-outline" size={24} color={colors.ink} />
            {unread ? <View className="absolute right-2.5 top-2.5 h-3 w-3 rounded-full border-2 border-bg bg-accent" /> : null}
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Settings"
            onPress={() => router.push('/settings')}
            className="h-12 w-12 items-center justify-center rounded-full active:bg-surface-alt"
          >
            <Ionicons name="settings-outline" size={24} color={colors.ink} />
          </Pressable>
        </View>
      </View>

      <Card className="gap-4">
        <View className="flex-row items-center gap-4">
          <View className="h-16 w-16 items-center justify-center rounded-full bg-brand">
            <Text variant="heading" className="text-white">{initials || '?'}</Text>
          </View>
          <View className="flex-1">
            <Text variant="heading" numberOfLines={1}>{name}</Text>
            <Text variant="small" numberOfLines={2}>
              {profile ? `${profile.form} · GCE ${profile.level} Level ${profile.examYear}` : ''}
              {phone ? ` · ${phone}` : ''}
            </Text>
          </View>
        </View>
        <View className="flex-row border-t border-line pt-3">
          <Stat value={`${streak}`} label={streak === 1 ? 'day streak' : 'day streak'} />
          <Stat value={`${all.length}`} label="questions" />
          <Stat value={acc === null ? '–' : `${Math.round(acc * 100)}%`} label="accuracy" />
        </View>
      </Card>

      <Card tone={paid ? 'soft' : 'highlight'} onPress={paid ? undefined : () => router.push('/paywall')}>
        <Text variant="overline" className={paid ? 'text-brand-deep' : 'text-accent-deep'}>
          {paid ? 'Season Pass active' : 'Free plan'}
        </Text>
        <Text variant="bodyStrong" className="mt-1">
          {paid
            ? entitlement.expiresAt
              ? `Full access until ${formatDate(entitlement.expiresAt)}`
              : 'Full access'
            : 'Unlock every worked solution, mark points and more Tutor help'}
        </Text>
      </Card>

      <SectionHeader title="Progress" />
      {progress.length === 0 ? (
        <Text variant="body" className="text-muted">
          Answer a few questions and your progress shows here.
        </Text>
      ) : (
        progress.map(({ subject, count, acc }) => (
          <View key={subject.id} className="gap-1">
            <View className="flex-row justify-between">
              <Text variant="label">{subject.name}</Text>
              <Text variant="caption">
                {acc !== null ? `${Math.round(acc * 100)}% · ` : ''}
                {pluralize(count, 'question')}
              </Text>
            </View>
            <ProgressBar value={acc ?? 0} tone="brand" accessibilityLabel={`${subject.name} accuracy`} />
          </View>
        ))
      )}

      {quizHistory.length > 0 ? (
        <>
          <SectionHeader title="Recent quizzes" />
          <View>
            {quizHistory.slice(0, 5).map((q) => (
              <ListRow
                key={q.id}
                icon="checkmark-done-outline"
                title={q.title}
                subtitle={`${q.correct}/${q.total} correct · ${formatDate(new Date(q.finishedAt).toISOString())}`}
                className="border-b border-line"
              />
            ))}
          </View>
        </>
      ) : null}

      <SectionHeader title="My Concours match" />
      <ListRow
        icon="sparkles-outline"
        title={skylerMatch ? `Skyler suggests: ${skylerMatch}` : 'Find your Concours with Skyler'}
        subtitle={skylerMatch ? 'Tap to see your result' : '10 quick questions · about 3 minutes'}
        onPress={() => router.push(skylerMatch ? '/skyler/result' : '/skyler/intro')}
      />

      {revisionPlan.length > 0 ? (
        <>
          <SectionHeader title="My revision plan" />
          {revisionPlan.map((item) => (
            <ListRow
              key={item.topicId}
              icon="bookmark-outline"
              title={item.name}
              subtitle="Practise with the GCE Tutor"
              onPress={() =>
                router.push({
                  pathname: '/tutor/gce/setup',
                  params: {
                    level: profile?.level ?? 'A',
                    subjectId: item.subjectId,
                    topicIds: item.topicId,
                  },
                })
              }
              trailing={
                <Button
                  label="Done"
                  variant="ghost"
                  size="sm"
                  onPress={() => removeFromRevisionPlan(item.topicId)}
                />
              }
              className="border-b border-line"
            />
          ))}
        </>
      ) : null}

      <SectionHeader title="Study" />
      <View>
        <ListRow icon="people-outline" title="Class groups" subtitle="Weekly challenges with your class" onPress={() => router.push('/groups')} className="border-b border-line" />
        <ListRow icon="download-outline" title="Downloads" subtitle="Papers saved for offline" onPress={() => router.push('/downloads')} className="border-b border-line" />
        <ListRow icon="create-outline" title="Edit my subjects and goals" onPress={() => router.push('/(onboarding)/setup')} className="border-b border-line" />
        <ListRow icon="settings-outline" title="Settings" subtitle="Theme, daily goal, reminders" onPress={() => router.push('/settings')} />
      </View>

      <SectionHeader title="Help" />
      <View>
        <ListRow
          icon="logo-whatsapp"
          title="Talk to Skyline"
          subtitle="Questions about classes, orientation or the app"
          onPress={() => void Linking.openURL(leadsService.whatsappUrl('Hello Skyline, I have a question about the app.'))}
          className="border-b border-line"
        />
        {uid ? (
          <ListRow icon="log-out-outline" title="Sign out" onPress={signOut} destructive />
        ) : (
          <ListRow icon="log-in-outline" title="Sign in" subtitle="Save progress across phones" onPress={() => router.push('/(auth)/sign-in')} />
        )}
      </View>

      {__DEV__ ? (
        <Button
          label="Clear cached content (dev)"
          variant="ghost"
          size="sm"
          onPress={() => void cacheRepo.clear()}
        />
      ) : null}
      <Text variant="caption" className="text-center">
        Skyline Academy {Constants.expoConfig?.version ?? ''}
      </Text>
    </Screen>
  );
}
