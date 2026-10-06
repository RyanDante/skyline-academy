import '../../global.css';
import '@/lib/nativewind';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack, type ErrorBoundaryProps } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { Button, Text } from '@/components/ui';
import { useBootstrap } from '@/hooks/useBootstrap';
import { useThemeColors } from '@/theme/tokens';

void SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false },
  },
});

export default function RootLayout() {
  const { ready, error } = useBootstrap();
  const colors = useThemeColors();

  useEffect(() => {
    if (ready || error) void SplashScreen.hideAsync();
  }, [ready, error]);

  if (error) {
    return (
      <View className="flex-1 items-center justify-center gap-3 bg-bg px-6">
        <Text variant="title" className="text-center">
          Skyline couldn’t start
        </Text>
        <Text variant="body" className="text-center text-muted">
          {__DEV__ ? error.message : 'Close the app and open it again. If this keeps happening, reinstall it.'}
        </Text>
      </View>
    );
  }
  if (!ready) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <StatusBar style="auto" />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.bg },
              animation: 'slide_from_right',
            }}
          >
            <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
            <Stack.Screen name="(onboarding)/welcome" options={{ animation: 'fade' }} />
            <Stack.Screen name="(auth)/phone" options={{ presentation: 'modal' }} />
            <Stack.Screen name="(auth)/verify" options={{ presentation: 'modal' }} />
            <Stack.Screen name="paywall" options={{ presentation: 'modal' }} />
            <Stack.Screen name="quiz/session" options={{ gestureEnabled: false }} />
          </Stack>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

/** Route-level crash screen (expo-router renders this when a screen throws). */
export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  return (
    <View className="flex-1 items-center justify-center gap-4 bg-bg px-6">
      <Text variant="title" className="text-center">
        Something went wrong
      </Text>
      <Text variant="body" className="text-center text-muted">
        {__DEV__ ? error.message : 'Please try again. Your saved progress is safe on this phone.'}
      </Text>
      <Button label="Try again" onPress={retry} />
    </View>
  );
}
