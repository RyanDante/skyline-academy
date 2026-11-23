import { router } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { View } from 'react-native';

import { Logo } from '@/components/brand/Logo';
import { Button, Chip, Screen, ScreenHeader, Text } from '@/components/ui';
import { useSubjects } from '@/hooks/queries';
import { profileService } from '@/services/profile';
import { useSessionStore } from '@/stores/sessionStore';
import type { Level, PathwayChoice, Stream, UserProfile } from '@/types/models';

const FORMS: Record<Level, string[]> = {
  O: ['Form 4', 'Form 5'],
  A: ['Lower Sixth', 'Upper Sixth'],
};

const STREAMS: { id: Stream; label: string }[] = [
  { id: 'science', label: 'Science' },
  { id: 'arts', label: 'Arts' },
  { id: 'commercial', label: 'Commercial' },
  { id: 'technical', label: 'Technical' },
];

const PATHWAYS: { id: PathwayChoice; label: string }[] = [
  { id: 'health', label: 'Health' },
  { id: 'engineering', label: 'Engineering' },
  { id: 'agri-vet', label: 'Agriculture' },
  { id: 'undecided', label: 'Not sure yet' },
];

/** Subjects pre-selected for a stream; students can change them below. */
const STREAM_SUBJECTS: Record<Stream, string[]> = {
  science: ['maths', 'physics', 'chemistry', 'biology'],
  technical: ['maths', 'physics'],
  arts: [],
  commercial: ['maths'],
};

function defaultSubjects(level: Level, stream: Stream): string[] {
  const prefix = level === 'A' ? 'a-' : 'o-';
  return STREAM_SUBJECTS[stream].map((s) => `${prefix}${s}`);
}

/** "Let's Personalise your experience" (design mockup 5). Also used to edit from Me. */
export default function Setup() {
  const existing = useSessionStore((s) => s.profile);
  const onboardingComplete = useSessionStore((s) => s.onboardingComplete);
  const uid = useSessionStore((s) => s.uid);
  const saveProfile = useSessionStore((s) => s.saveProfile);
  const completeOnboarding = useSessionStore((s) => s.completeOnboarding);

  const thisYear = new Date().getFullYear();
  const [level, setLevel] = useState<Level>(existing?.level ?? 'A');
  const [form, setForm] = useState(existing?.form ?? 'Upper Sixth');
  const [stream, setStream] = useState<Stream>(existing?.stream ?? 'science');
  const [examYear, setExamYear] = useState(existing?.examYear ?? thisYear + 1);
  const [subjectIds, setSubjectIds] = useState<string[]>(
    existing?.subjectIds?.length ? existing.subjectIds : defaultSubjects('A', 'science'),
  );
  const [pathway, setPathway] = useState<PathwayChoice>(existing?.pathway ?? 'undecided');

  const subjects = useSubjects(level);
  const years = [thisYear, thisYear + 1, thisYear + 2];

  const pickLevel = (l: Level) => {
    setLevel(l);
    setForm(FORMS[l][1]!);
    setSubjectIds(defaultSubjects(l, stream));
  };
  const pickStream = (s: Stream) => {
    setStream(s);
    setSubjectIds(defaultSubjects(level, s));
  };
  const toggleSubject = (id: string) =>
    setSubjectIds((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));

  const finish = () => {
    const profile: UserProfile = {
      uid: existing?.uid ?? uid,
      firstName: existing?.firstName ?? '',
      fullName: existing?.fullName,
      level,
      form,
      stream,
      subjectIds,
      examYear,
      pathway: level === 'A' ? pathway : 'undecided',
      schoolName: existing?.schoolName,
    };
    saveProfile(profile);
    if (uid) void profileService.save(uid, profile).catch(() => undefined);
    completeOnboarding();
    if (onboardingComplete && router.canGoBack()) router.back();
    else router.replace('/(tabs)');
  };

  return (
    <Screen
      topBar={onboardingComplete ? <ScreenHeader title="My exams and subjects" /> : undefined}
      footer={<Button label="Continue" size="lg" onPress={finish} disabled={subjectIds.length === 0} />}
      contentClassName="gap-5 px-6 pt-6"
    >
      {!onboardingComplete ? <Logo /> : null}
      <View className="gap-1">
        <Text variant="title" accessibilityRole="header">
          Let’s Personalise your experience
        </Text>
        <Text variant="lead" className="text-muted">
          Choose your exam settings and get tailored content for you.
        </Text>
      </View>

      <Section title="Which exam are you preparing for?">
        {(['O', 'A'] as Level[]).map((l) => (
          <Chip key={l} label={`GCE ${l} Level`} selected={level === l} onPress={() => pickLevel(l)} />
        ))}
      </Section>

      <Section title="Class">
        {FORMS[level].map((f) => (
          <Chip key={f} label={f} selected={form === f} onPress={() => setForm(f)} />
        ))}
      </Section>

      <Section title="Stream">
        {STREAMS.map((s) => (
          <Chip key={s.id} label={s.label} selected={stream === s.id} onPress={() => pickStream(s.id)} />
        ))}
      </Section>

      <Section title="Exam year">
        {years.map((y) => (
          <Chip key={y} label={String(y)} selected={examYear === y} onPress={() => setExamYear(y)} />
        ))}
      </Section>

      <Section title="Subjects" hint="Science subjects have past papers now. More are coming.">
        {(subjects.data ?? []).map((s) => (
          <Chip key={s.id} label={s.name} selected={subjectIds.includes(s.id)} onPress={() => toggleSubject(s.id)} />
        ))}
      </Section>

      {level === 'A' ? (
        <Section title="Where are you heading after the GCE?">
          {PATHWAYS.map((p) => (
            <Chip key={p.id} label={p.label} selected={pathway === p.id} onPress={() => setPathway(p.id)} />
          ))}
        </Section>
      ) : null}
    </Screen>
  );
}

function Section({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <View className="gap-2.5">
      <Text variant="h3">{title}</Text>
      {hint ? <Text variant="small" className="-mt-1">{hint}</Text> : null}
      <View className="flex-row flex-wrap gap-2.5">{children}</View>
    </View>
  );
}
