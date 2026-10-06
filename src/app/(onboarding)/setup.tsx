import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { View } from 'react-native';

import { Button, Chip, ProgressBar, Screen, ScreenHeader, Text, TextField } from '@/components/ui';
import { useSubjects } from '@/hooks/queries';
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

const PATHWAYS: { id: PathwayChoice; label: string; hint: string }[] = [
  { id: 'health', label: 'Health', hint: 'Medicine, nursing, lab science' },
  { id: 'engineering', label: 'Engineering', hint: 'FET, COT, NAHPI, ENSET' },
  { id: 'agri-vet', label: 'Agriculture and Vet', hint: 'FAVM and similar' },
  { id: 'undecided', label: 'Not sure yet', hint: 'We will help you explore' },
];

const STEPS = 4;

/** About four taps of setup so Home can be personal from the first screen. */
export default function Setup() {
  const saveProfile = useSessionStore((s) => s.saveProfile);
  const completeOnboarding = useSessionStore((s) => s.completeOnboarding);
  const existing = useSessionStore((s) => s.profile);

  const [step, setStep] = useState(0);
  const [firstName, setFirstName] = useState(existing?.firstName ?? '');
  const [level, setLevel] = useState<Level>(existing?.level ?? 'A');
  const [form, setForm] = useState(existing?.form ?? 'Upper Sixth');
  const [stream, setStream] = useState<Stream>(existing?.stream ?? 'science');
  const [subjectIds, setSubjectIds] = useState<string[]>(existing?.subjectIds ?? []);
  const [examYear, setExamYear] = useState(existing?.examYear ?? new Date().getFullYear() + 1);
  const [pathway, setPathway] = useState<PathwayChoice>(existing?.pathway ?? 'undecided');

  const { data: subjects } = useSubjects(level);
  const years = useMemo(() => {
    const y = new Date().getFullYear();
    return [y, y + 1, y + 2];
  }, []);

  const toggleSubject = (id: string) =>
    setSubjectIds((ids) => (ids.includes(id) ? ids.filter((s) => s !== id) : [...ids, id]));

  const canContinue =
    (step === 0 && firstName.trim().length > 0) ||
    step === 1 ||
    (step === 2 && subjectIds.length > 0) ||
    step === 3;

  const finish = () => {
    const profile: UserProfile = {
      uid: existing?.uid ?? null,
      firstName: firstName.trim(),
      level,
      form,
      stream,
      subjectIds,
      examYear,
      pathway: level === 'A' ? pathway : 'undecided',
    };
    saveProfile(profile);
    completeOnboarding();
    router.replace('/(tabs)');
  };

  const next = () => (step < STEPS - 1 ? setStep(step + 1) : finish());

  return (
    <Screen
      topBar={
        <ScreenHeader
          title="Set up Skyline"
          subtitle={`Step ${step + 1} of ${STEPS}`}
          onBack={() => (step > 0 ? setStep(step - 1) : router.back())}
        />
      }
      footer={
        <Button label={step === STEPS - 1 ? 'Start studying' : 'Continue'} onPress={next} disabled={!canContinue} />
      }
    >
      <ProgressBar value={(step + 1) / STEPS} tone="brand" />

      {step === 0 ? (
        <View className="gap-4">
          <Text variant="title">What should we call you?</Text>
          <TextField
            label="First name"
            value={firstName}
            onChangeText={setFirstName}
            autoCapitalize="words"
            autoComplete="given-name"
            placeholder="Ngozi"
            returnKeyType="next"
            onSubmitEditing={() => canContinue && next()}
          />
        </View>
      ) : null}

      {step === 1 ? (
        <View className="gap-4">
          <Text variant="title">Which exam are you preparing for?</Text>
          <View className="flex-row gap-2">
            {(['O', 'A'] as Level[]).map((l) => (
              <Chip
                key={l}
                label={`GCE ${l} Level`}
                selected={level === l}
                onPress={() => {
                  setLevel(l);
                  setForm(FORMS[l][1]!);
                  setSubjectIds([]);
                }}
              />
            ))}
          </View>
          <Text variant="label">Class</Text>
          <View className="flex-row flex-wrap gap-2">
            {FORMS[level].map((f) => (
              <Chip key={f} label={f} selected={form === f} onPress={() => setForm(f)} />
            ))}
          </View>
          <Text variant="label">Stream</Text>
          <View className="flex-row flex-wrap gap-2">
            {STREAMS.map((s) => (
              <Chip key={s.id} label={s.label} selected={stream === s.id} onPress={() => setStream(s.id)} />
            ))}
          </View>
          <Text variant="label">Exam year</Text>
          <View className="flex-row gap-2">
            {years.map((y) => (
              <Chip key={y} label={String(y)} selected={examYear === y} onPress={() => setExamYear(y)} />
            ))}
          </View>
        </View>
      ) : null}

      {step === 2 ? (
        <View className="gap-4">
          <Text variant="title">Which subjects are you taking?</Text>
          <Text variant="body" className="text-muted">
            Skyline launches with the science subjects. More are coming.
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {(subjects ?? []).map((s) => (
              <Chip key={s.id} label={s.name} selected={subjectIds.includes(s.id)} onPress={() => toggleSubject(s.id)} />
            ))}
          </View>
        </View>
      ) : null}

      {step === 3 ? (
        <View className="gap-4">
          <Text variant="title">{level === 'A' ? 'Where are you heading after the GCE?' : 'Almost done'}</Text>
          {level === 'A' ? (
            <View className="gap-2">
              {PATHWAYS.map((p) => (
                <Chip
                  key={p.id}
                  label={`${p.label} · ${p.hint}`}
                  selected={pathway === p.id}
                  onPress={() => setPathway(p.id)}
                  className="h-12"
                />
              ))}
            </View>
          ) : (
            <Text variant="body" className="text-muted">
              After your O Levels, Skyline helps you choose A-Level subjects that lead to the careers you want.
            </Text>
          )}
        </View>
      ) : null}
    </Screen>
  );
}
