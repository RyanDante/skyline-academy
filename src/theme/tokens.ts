import { useColorScheme } from 'react-native';

/**
 * Raw colour values for places Tailwind classes can't reach: SVG fills,
 * navigation options, status bar, ActivityIndicator, icons. Mirrors global.css.
 */
export const palette = {
  orange: '#FF820A',
  orangeDeep: '#B35400',
  teal: '#0E989A',
  tealDeep: '#0A7375',
  cyan: '#B0E5EB',
  indigo: '#4B49C8',
  indigoSoft: '#ECECFB',
  white: '#FFFFFF',
  black: '#14202A',
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
  skyler: string;
  success: string;
  danger: string;
  heroBg: string;
  heroSilhouette: string;
}

const light: ThemeColors = {
  bg: '#F4FAFB',
  surface: '#FFFFFF',
  ink: '#14202A',
  muted: '#4F5F68',
  line: '#D6EAEC',
  brand: palette.teal,
  brandDeep: palette.tealDeep,
  accent: palette.orange,
  accentDeep: palette.orangeDeep,
  skyler: palette.indigo,
  success: '#2E9E5B',
  danger: '#D64545',
  heroBg: palette.tealDeep,
  heroSilhouette: palette.teal,
};

const dark: ThemeColors = {
  bg: '#091113',
  surface: '#121D20',
  ink: '#EDF3F4',
  muted: '#A8B6BA',
  line: '#263A3E',
  brand: palette.teal,
  brandDeep: '#6ECDD0',
  accent: palette.orange,
  accentDeep: '#FFA85C',
  skyler: '#9694F0',
  success: '#4ADE80',
  danger: '#F87171',
  heroBg: '#0B4F51',
  heroSilhouette: '#0A7375',
};

export function useThemeColors(): ThemeColors {
  return useColorScheme() === 'dark' ? dark : light;
}
