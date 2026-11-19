import { useEffect, useState } from 'react';
import { useAppStore } from '@/stores/appStore';

/**
 * Raw colour values for places Tailwind classes can't reach: SVG fills,
 * canvas drawings, status bars, and icons.
 */
export const palette = {
  orange: '#FF8A00',
  orangeDeep: '#D97200',
  teal: '#00B8B0',
  tealDeep: '#087F7A',
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
  bg: '#F5FAFA',
  surface: '#FFFFFF',
  ink: '#173A43',
  muted: '#55737B',
  line: '#D5EAE9',
  brand: palette.teal,
  brandDeep: palette.tealDeep,
  accent: palette.orange,
  accentDeep: palette.orangeDeep,
  skyler: '#00B8B0',
  success: '#10B981',
  danger: '#EF4444',
  heroBg: palette.tealDeep,
  heroSilhouette: palette.teal,
};

const dark: ThemeColors = {
  bg: '#091113',
  surface: '#121D20',
  ink: '#EDF3F4',
  muted: '#A8B6BA',
  line: '#263A3E',
  brand: '#00B8B0',
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
  const theme = useAppStore((s) => s.settings?.theme ?? 'system');
  const [isSystemDark, setIsSystemDark] = useState(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => setIsSystemDark(e.matches);
    media.addEventListener('change', handler);
    return () => media.removeEventListener('change', handler);
  }, []);

  const isDark = theme === 'dark' || (theme === 'system' && isSystemDark);
  return isDark ? dark : light;
}
