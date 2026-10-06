import { router } from 'expo-router';
import { View } from 'react-native';

import { Button, Text } from '@/components/ui';

export default function NotFound() {
  return (
    <View className="flex-1 items-center justify-center gap-4 bg-bg px-6">
      <Text variant="title">Page not found</Text>
      <Text variant="body" className="text-center text-muted">
        This link may be out of date.
      </Text>
      <Button label="Go to Home" onPress={() => router.replace('/(tabs)')} />
    </View>
  );
}
