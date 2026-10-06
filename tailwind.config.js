/**
 * Skyline design tokens. Colours resolve to CSS variables defined in global.css so
 * every class (bg-surface, text-ink, ...) adapts to light and dark mode automatically.
 *
 * Brand: orange #FF820A, teal #0E989A, light cyan #B0E5EB, white, black.
 * The brand orange and teal are too light for small text on white, so `*-deep`
 * shades carry text and white-on-colour headers.
 */
const withAlpha = (name) => `rgb(var(--color-${name}) / <alpha-value>)`;

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        bg: withAlpha('bg'),
        surface: withAlpha('surface'),
        'surface-alt': withAlpha('surface-alt'),
        ink: withAlpha('ink'),
        muted: withAlpha('muted'),
        line: withAlpha('line'),
        brand: {
          DEFAULT: withAlpha('brand'),
          deep: withAlpha('brand-deep'),
          soft: withAlpha('cyan'),
        },
        accent: {
          DEFAULT: withAlpha('accent'),
          deep: withAlpha('accent-deep'),
          soft: withAlpha('accent-soft'),
        },
        'on-accent': withAlpha('on-accent'),
        'on-brand': withAlpha('on-brand'),
        success: withAlpha('success'),
        danger: withAlpha('danger'),
      },
      fontFamily: {
        body: ['Inter_400Regular'],
        'body-medium': ['Inter_500Medium'],
        'body-semibold': ['Inter_600SemiBold'],
        display: ['Sora_700Bold'],
        'display-semibold': ['Sora_600SemiBold'],
      },
      fontSize: {
        caption: ['12px', { lineHeight: '16px' }],
        label: ['13px', { lineHeight: '18px' }],
        body: ['15px', { lineHeight: '22px' }],
        lead: ['17px', { lineHeight: '24px' }],
        heading: ['20px', { lineHeight: '26px' }],
        title: ['24px', { lineHeight: '30px' }],
        hero: ['40px', { lineHeight: '44px' }],
      },
      borderRadius: {
        card: '16px',
        control: '12px',
      },
    },
  },
  plugins: [],
};
