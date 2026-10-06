import { router } from 'expo-router';
import { View } from 'react-native';

import { Button, Screen, ScreenHeader, Text } from '@/components/ui';

/** Content is static for V1; move it to Firestore when Skyline wants to edit it without a release. */
const STEPS = [
  {
    title: 'What a Concours is',
    body: 'A competitive entrance exam for a professional school or faculty. Places are limited, so candidates are ranked and only the best are admitted.',
  },
  {
    title: 'Who can apply',
    body: 'Most schools ask for specific A-Level subjects and passes. Some also have age limits or nationality rules. Each school sets its own conditions.',
  },
  {
    title: 'How selection works',
    body: 'Usually a written exam on core subjects, sometimes followed by an oral or interview. Your rank decides admission, not just passing.',
  },
  {
    title: 'Sectors and institutions',
    body: 'Health, engineering and technology, agriculture and vet, teaching, administration and more. Skyline groups them into pathway families.',
  },
  {
    title: 'Typical requirements',
    body: 'Birth certificate, GCE result slips, photographs, an application fee and a completed form. Each school publishes its own list.',
  },
  {
    title: 'How to prepare',
    body: 'Master the GCE topics the Concours tests, practise past Concours papers under time, and prepare for any sections the GCE does not cover.',
  },
  {
    title: 'After admission',
    body: 'You register at the school, pay fees and start your programme. Many professional schools lead directly to a career path.',
  },
];

export default function ConcoursIntro() {
  return (
    <Screen
      topBar={<ScreenHeader title="What is a Concours?" />}
      footer={<Button label="Start exploring" onPress={() => router.replace('/(tabs)/concours')} />}
    >
      {STEPS.map((step, i) => (
        <View key={step.title} className="flex-row gap-3">
          <View className="h-8 w-8 items-center justify-center rounded-full bg-brand-deep">
            <Text variant="label" className="text-on-brand">
              {i + 1}
            </Text>
          </View>
          <View className="flex-1 gap-1">
            <Text variant="bodyStrong" accessibilityRole="header">
              {step.title}
            </Text>
            <Text variant="body" className="text-muted">
              {step.body}
            </Text>
          </View>
        </View>
      ))}
    </Screen>
  );
}
