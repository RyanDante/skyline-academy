import { useColorScheme } from 'react-native';

/**
 * Raw colour values for places Tailwind classes can't reach: SVG fills,
 * navigation options, status bar, ActivityIndicator. Mirrors global.css.
 */
export const palette = {
  orange: '#FF820A',
  orangeDeep: '#B35400',
  teal: '#0E989A',
  tealDeep: '#0A7375',
  cyan: '#B0E5EB',
  white: '#FFFFFF',
  black: '#111111',
} as const;

export interface ThemeColors {
  bg: string;
  surface: string;
  ink: string;
  muted: string;
  line: string;
  brand: string;
  brandDeep: string;
  accent: string;
  accentDeep: string;
  success: string;
  heroBg: string;
  heroSilhouette: string;
}

const light: ThemeColors = {
  bg: '#F7FBFC',
  surface: '#FFFFFF',
  ink: '#111111',
  muted: '#545F62',
  line: '#D6EAEE',
  brand: palette.teal,
  brandDeep: palette.tealDeep,
  accent: palette.orange,
  accentDeep: palette.orangeDeep,
  success: '#15803D',
  heroBg: palette.tealDeep,
  heroSilhouette: palette.teal,
};

const dark: ThemeColors = {
  bg: '#091113',
  surface: '#121D20',
  ink: '#EDF3F4',
  muted: '#9CACB0',
  line: '#263A3E',
  brand: palette.teal,
  brandDeep: '#6ECDD0',
  accent: palette.orange,
  accentDeep: '#FFA85C',
  success: '#4ADE80',
  heroBg: '#0B4F51',
  heroSilhouette: '#0A7375',
};

export function useThemeColors(): ThemeColors {
  return useColorScheme() === 'dark' ? dark : light;
}
