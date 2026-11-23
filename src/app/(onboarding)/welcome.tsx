import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useRef, useState, type ComponentProps } from 'react';
import { ScrollView, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Logo } from '@/components/brand/Logo';
import { SkylineSilhouette } from '@/components/brand/SkylineSilhouette';
import { AiAvatar } from '@/components/tutor/AiAvatar';
import { Button, Text } from '@/components/ui';
import { cn } from '@/lib/cn';
import { palette } from '@/theme/tokens';

type IconName = ComponentProps<typeof Ionicons>['name'];

const FEATURES: { icon: IconName; label: string; bg: string; fg: string }[] = [
  { icon: 'document-text', label: 'Past Questions\n& Answers', bg: '#D7F4F2', fg: palette.tealDeep },
  { icon: 'compass', label: 'Career\nGuidance', bg: '#FFF4E6', fg: palette.orange },
  { icon: 'school', label: 'Expert\nTutors', bg: '#D7F4F2', fg: palette.tealDeep },
];

const CARDS: { icon: IconName; title: string; body: string; bg: string; fg: string }[] = [
  { icon: 'checkbox', title: 'Prepare Smarter', body: 'Access past questions and answers for O & A Level.', bg: '#E5F7F5', fg: palette.tealDeep },
  { icon: 'hardware-chip', title: 'Learn with AI', body: 'Get help with difficult topics and improve your understanding.', bg: '#EEEEFB', fg: '#4B49C8' },
  { icon: 'compass', title: 'Discover Your Future', body: 'Explore Concours opportunities and career pathways.', bg: '#FFF7E6', fg: palette.orange },
];

const SLIDES = 3;

/** Onboarding slides (design mockups 2 and 2.2), then account creation. */
export default function Welcome() {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const scroller = useRef<ScrollView>(null);
  const [page, setPage] = useState(0);

  const goTo = (p: number) => {
    scroller.current?.scrollTo({ x: p * width, animated: true });
    setPage(p);
  };

  return (
    <View className="flex-1 bg-bg" style={{ paddingTop: insets.top + 8 }}>
      <View className="flex-row items-center justify-between px-6">
        <Logo />
        {page < SLIDES - 1 ? (
          <Button label="Skip" variant="ghost" size="sm" onPress={() => goTo(SLIDES - 1)} />
        ) : null}
      </View>

      <ScrollView
        ref={scroller}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => setPage(Math.round(e.nativeEvent.contentOffset.x / width))}
        className="flex-1"
      >
        {/* Slide 1: Your Exams. Your Future. Your Pathway. */}
        <ScrollView style={{ width }} contentContainerClassName="gap-6 px-6 pb-6 pt-8">
          <View>
            <Text variant="hero" className="text-ink">Your Exams.</Text>
            <Text variant="hero" className="text-brand-deep">Your Future.</Text>
            <Text variant="hero" className="text-accent">Your Pathway.</Text>
          </View>
          <Text variant="lead" className="text-muted">
            Everything you need to prepare for GCE, explore career opportunities and achieve your dreams.
          </Text>
          <View className="flex-row justify-between">
            {FEATURES.map((f) => (
              <View key={f.label} className="w-[30%] items-center gap-2">
                <View className="h-16 w-16 items-center justify-center rounded-card" style={{ backgroundColor: f.bg }}>
                  <Ionicons name={f.icon} size={30} color={f.fg} />
                </View>
                <Text variant="label" className="text-center font-body-semibold">
                  {f.label}
                </Text>
              </View>
            ))}
          </View>
          <Text variant="heading" className="mt-2 text-center italic text-accent">
            Dream · Plan · Achieve
          </Text>
        </ScrollView>

        {/* Slide 2: three promise cards */}
        <ScrollView style={{ width }} contentContainerClassName="gap-4 px-6 pb-6 pt-8">
          {CARDS.map((c) => (
            <View key={c.title} className="flex-row items-center gap-4 rounded-card p-5" style={{ backgroundColor: c.bg }}>
              <View className="h-16 w-16 items-center justify-center rounded-full bg-white">
                <Ionicons name={c.icon} size={32} color={c.fg} />
              </View>
              <View className="flex-1 gap-1">
                <Text variant="heading" className="text-[#173A43]">{c.title}</Text>
                <Text variant="body" className="text-[#55737B]">{c.body}</Text>
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Slide 3: meet the two AI guides, then create an account */}
        <ScrollView style={{ width }} contentContainerClassName="items-center gap-5 px-6 pb-6 pt-8">
          <View className="flex-row gap-4">
            <AiAvatar persona="tutor" size={88} />
            <AiAvatar persona="skyler" size={88} />
          </View>
          <Text variant="title" className="text-center">Learn. Prepare. Achieve.</Text>
          <Text variant="lead" className="text-center text-muted">
            Practise real GCE past papers with your GCE Tutor, and let Skyler help you find the Concours that fits
            you.
          </Text>
        </ScrollView>
      </ScrollView>

      <SkylineSilhouette height={44} />
      <View className="gap-4 bg-bg px-6 pt-4" style={{ paddingBottom: insets.bottom + 16 }}>
        <View className="flex-row justify-center gap-2" accessibilityLabel={`Page ${page + 1} of ${SLIDES}`}>
          {Array.from({ length: SLIDES }, (_, i) => (
            <View key={i} className={cn('h-2.5 rounded-full', i === page ? 'w-6 bg-brand' : 'w-2.5 bg-line')} />
          ))}
        </View>
        {page < SLIDES - 1 ? (
          <View className="flex-row gap-3">
            <Button
              label={page === 0 ? 'Skip' : 'Back'}
              variant="secondary"
              className="flex-1"
              onPress={() => (page === 0 ? goTo(SLIDES - 1) : goTo(page - 1))}
            />
            <Button label="Next" iconRight="arrow-forward" className="flex-1" onPress={() => goTo(page + 1)} />
          </View>
        ) : (
          <View className="gap-2">
            <Button label="Create Account" variant="go" size="lg" onPress={() => router.push('/(auth)/sign-up')} />
            <Button label="I already have an account" variant="ghost" onPress={() => router.push('/(auth)/sign-in')} />
          </View>
        )}
      </View>
    </View>
  );
}
