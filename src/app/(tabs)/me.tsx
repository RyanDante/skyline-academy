import Constants from 'expo-constants';
import * as Linking from 'expo-linking';
import { router } from 'expo-router';
import { useMemo } from 'react';
import { Alert, View } from 'react-native';

import { Button, Card, ListRow, ProgressBar, Screen, SectionHeader, Text } from '@/components/ui';
import { accuracy } from '@/domain/mastery';
import { computeResult } from '@/domain/skyler';
import { useAttempts, useSectors, useSubjects } from '@/hooks/queries';
import { cacheRepo } from '@/db/cacheRepo';
import { formatDate } from '@/lib/dates';
import { pluralize } from '@/lib/format';
import { authService } from '@/services/auth';
import { leadsService } from '@/services/leads';
import { hasFullAccess, useSessionStore } from '@/stores/sessionStore';
import { useSkylerStore } from '@/stores/skylerStore';

export default function Me() {
  const profile = useSessionStore((s) => s.profile);
  const uid = useSessionStore((s) => s.uid);
  const phone = useSessionStore((s) => s.phone);
  const entitlement = useSessionStore((s) => s.entitlement);
  const signOutLocal = useSessionStore((s) => s.signOut);
  const revisionPlan = useSessionStore((s) => s.revisionPlan);
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
      <Text variant="title" accessibilityRole="header">
        {profile?.firstName ?? 'Your profile'}
      </Text>
      <Text variant="body" className="-mt-2 text-muted">
        {profile ? `${profile.form} · GCE ${profile.level} Level ${profile.examYear}` : ''}
        {phone ? ` · ${phone}` : ''}
      </Text>

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
        <ListRow icon="create-outline" title="Edit my subjects and goals" onPress={() => router.push('/(onboarding)/setup')} />
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
          <ListRow icon="log-in-outline" title="Sign in" subtitle="Save progress across phones" onPress={() => router.push({ pathname: '/(auth)/phone', params: { reason: 'save' } })} />
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
