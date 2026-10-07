/**
 * Skyline design tokens. Colours resolve to CSS variables defined in global.css so
 * every class (bg-surface, text-ink, ...) adapts to light and dark mode automatically.
 *
 * Brand: orange #FF820A, teal #0E989A / primary teal #0A7375, light cyan #B0E5EB.
 * `brand-deep` is the primary teal (buttons, links, active tab). Orange is the single
 * "go" action per screen and always carries dark text. `skyler` is Skyler's indigo.
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
          pressed: withAlpha('brand-pressed'),
          soft: withAlpha('cyan'),
        },
        skyler: {
          DEFAULT: withAlpha('skyler'),
          soft: withAlpha('skyler-soft'),
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
        display: ['PlusJakartaSans_700Bold'],
        'display-semibold': ['PlusJakartaSans_600SemiBold'],
      },
      // Brief section 4.2. Never use body text below 14.
      fontSize: {
        caption: ['12px', { lineHeight: '16px' }],
        label: ['13px', { lineHeight: '18px' }],
        body: ['15px', { lineHeight: '22px' }],
        h3: ['16px', { lineHeight: '22px' }],
        button: ['16px', { lineHeight: '20px' }],
        lead: ['17px', { lineHeight: '24px' }],
        heading: ['20px', { lineHeight: '26px' }],
        title: ['24px', { lineHeight: '30px' }],
        hero: ['40px', { lineHeight: '44px' }],
      },
      borderRadius: {
        card: '16px',
        control: '14px',
      },
    },
  },
  plugins: [],
};
