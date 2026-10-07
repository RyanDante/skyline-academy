import { Text as RNText, type TextProps as RNTextProps } from 'react-native';

import { cn } from '@/lib/cn';

/**
 * Type scale from the design brief (section 4.2). Headings use Plus Jakarta Sans, body and chat
 * use Inter. Older names map onto the same styles: hero = display, title = h1, heading = h2.
 */
export type TextVariant =
  | 'hero'
  | 'title'
  | 'heading'
  | 'h3'
  | 'lead'
  | 'body'
  | 'bodyStrong'
  | 'small'
  | 'label'
  | 'caption'
  | 'overline'
  | 'button';

const VARIANTS: Record<TextVariant, string> = {
  hero: 'font-display text-hero text-ink',
  title: 'font-display text-title text-ink',
  heading: 'font-display-semibold text-heading text-ink',
  h3: 'font-display-semibold text-h3 text-ink',
  lead: 'font-body text-lead text-ink',
  body: 'font-body text-body text-ink',
  bodyStrong: 'font-body-semibold text-body text-ink',
  small: 'font-body text-label text-muted',
  label: 'font-body-medium text-label text-ink',
  caption: 'font-body-medium text-caption text-muted',
  overline: 'font-body-semibold text-caption uppercase tracking-wider text-muted',
  button: 'font-display-semibold text-button',
};

export interface TextProps extends RNTextProps {
  variant?: TextVariant;
  className?: string;
}

/** Typography primitive. Honours the user's font scaling up to 1.3× to protect layouts. */
export function Text({
  variant = 'body',
  className,
  maxFontSizeMultiplier = 1.3,
  ...props
}: TextProps) {
  return (
    <RNText
      maxFontSizeMultiplier={maxFontSizeMultiplier}
      className={cn(VARIANTS[variant], className)}
      {...props}
    />
  );
}
