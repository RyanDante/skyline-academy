import { Text as RNText, type TextProps as RNTextProps } from 'react-native';

import { cn } from '@/lib/cn';

export type TextVariant =
  | 'hero'
  | 'title'
  | 'heading'
  | 'lead'
  | 'body'
  | 'bodyStrong'
  | 'label'
  | 'caption'
  | 'overline';

const VARIANTS: Record<TextVariant, string> = {
  hero: 'font-display text-hero text-ink',
  title: 'font-display text-title text-ink',
  heading: 'font-display-semibold text-heading text-ink',
  lead: 'font-body text-lead text-ink',
  body: 'font-body text-body text-ink',
  bodyStrong: 'font-body-semibold text-body text-ink',
  label: 'font-body-medium text-label text-ink',
  caption: 'font-body text-caption text-muted',
  overline: 'font-body-semibold text-caption uppercase tracking-wider text-muted',
};

export interface TextProps extends RNTextProps {
  variant?: TextVariant;
  className?: string;
}

/** Typography primitive. Honours the user's font scaling up to 1.3× to protect layouts. */
export function Text({ variant = 'body', className, maxFontSizeMultiplier = 1.3, ...props }: TextProps) {
  return (
    <RNText
      maxFontSizeMultiplier={maxFontSizeMultiplier}
      className={cn(VARIANTS[variant], className)}
      {...props}
    />
  );
}
