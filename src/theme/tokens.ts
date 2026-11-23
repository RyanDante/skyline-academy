import { useColorScheme } from 'react-native';

/**
 * Raw colour values for places Tailwind classes can't reach: SVG fills, gradients,
 * navigation options, status bar, icons. Mirrors global.css (design/mockups palette).
 */
export const palette = {
  teal: '#00B8B0',
  tealDeep: '#087F7A',
  tealDark: '#06635F',
  tealTint: '#D7F4F2',
  orange: '#FF8A00',
  orangeDeep: '#C26400',
  orangeSoft: '#FFF4E6',
  sun: '#F7B928',
  ink: '#173A43',
  white: '#FFFFFF',
  black: '#173A43',
} as const;

/** Per-subject tile colours from the GCE mockup (icon colour + soft background). */
export const subjectColors: Record<string, { fg: string; bg: string }> = {
  maths: { fg: '#3E7BFA', bg: '#E8F0FF' },
  physics: { fg: '#8B5CF6', bg: '#F1ECFF' },
  chemistry: { fg: '#10A37F', bg: '#E3F7F0' },
  biology: { fg: '#E5484D', bg: '#FDECEC' },
  ict: { fg: '#E8A400', bg: '#FFF6DB' },
  further: { fg: '#2F80ED', bg: '#E6F1FD' },
  default: { fg: '#087F7A', bg: '#D7F4F2' },
};

/** Per-sector card colours from the Concours mockup. */
export const sectorColors: Record<string, { fg: string; bg: string; border: string }> = {
  health: { fg: '#087F7A', bg: '#ECFAF8', border: '#C6EEEA' },
  engineering: { fg: '#E08600', bg: '#FFF7EC', border: '#FBE3C2' },
  agriculture: { fg: '#0E9C94', bg: '#EAF9F9', border: '#C2EDEA' },
  administration: { fg: '#B23AC4', bg: '#FBF0FD', border: '#F1D4F6' },
  teaching: { fg: '#E57A00', bg: '#FFF5EA', border: '#FBE0C6' },
};

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
  bg: '#F5FAFA',
  surface: '#FFFFFF',
  ink: '#173A43',
  muted: '#55737B',
  line: '#D5EAE9',
  brand: palette.teal,
  brandDeep: palette.tealDeep,
  accent: palette.orange,
  accentDeep: palette.orangeDeep,
  skyler: palette.orange,
  success: '#109664',
  danger: '#DC3C3C',
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
  brandDeep: '#5ED6CF',
  accent: palette.orange,
  accentDeep: '#FFA85C',
  skyler: palette.orange,
  success: '#4ADE80',
  danger: '#F87171',
  heroBg: '#0B4F51',
  heroSilhouette: '#087F7A',
};

/** Follows the theme chosen in Settings (System / Light / Dark), applied via Appearance. */
export function useThemeColors(): ThemeColors {
  return useColorScheme() === 'dark' ? dark : light;
}
