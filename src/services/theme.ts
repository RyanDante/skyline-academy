import { Appearance } from 'react-native';

import type { ThemeMode } from '@/stores/sessionStore';

/**
 * Applies the theme chosen in Settings. Overriding Appearance makes React Native's
 * useColorScheme and NativeWind's dark variables follow the choice; "system" hands control
 * back to the phone setting.
 */
export function applyTheme(mode: ThemeMode): void {
  // 'unspecified' resets to the OS setting (RN 0.82+).
  Appearance.setColorScheme(mode === 'system' ? 'unspecified' : mode);
}
