import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';

import { useNetwork } from '@/hooks/useNetwork';
import { useThemeColors } from '@/theme/tokens';

import { Text } from './Text';

export function OfflineBanner() {
  const { isOffline } = useNetwork();
  const colors = useThemeColors();
  if (!isOffline) return null;

  return (
    <View
      accessibilityLiveRegion="polite"
      className="flex-row items-center gap-2 bg-accent-soft px-4 py-2"
    >
      <Ionicons name="cloud-offline-outline" size={16} color={colors.accentDeep} />
      <Text variant="caption" className="flex-1 text-accent-deep">
        You’re offline. Downloads and saved progress still work; we’ll sync when you reconnect.
      </Text>
    </View>
  );
}
