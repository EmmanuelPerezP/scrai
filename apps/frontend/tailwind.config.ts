import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        sand: { DEFAULT: '#F4EEE4', deep: '#ECE4D6' },
        paper: '#FBF8F2',
        ink: { DEFAULT: '#201B14', heading: '#211C15' },
        body: { DEFAULT: '#262019', soft: '#3A342B' },
        secondary: '#5B5348',
        muted: '#8A8175',
        faint: '#A09686',
        placeholder: '#AEA595',
        line: { DEFAULT: '#E4DCCC', soft: '#EDE6D8', card: '#EAE2D2' },
        sage: { DEFAULT: '#4F6B52', deep: '#3C5440', tint: '#E7EEE4' },
        clay: { DEFAULT: '#BC6A47', deep: '#A85636', tint: '#F3E2D8' },
        warn: { bg: '#F6E7DD', border: '#EFD5C6' },
      },
      fontFamily: {
        serif: ['Newsreader', 'Georgia', 'serif'],
        sans: ['Hanken Grotesk', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['Spline Sans Mono', 'ui-monospace', 'monospace'],
      },
      keyframes: {
        fadein: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'none' },
        },
        wave: {
          '0%,100%': { transform: 'scaleY(0.3)' },
          '50%': { transform: 'scaleY(1)' },
        },
      },
      animation: {
        'fade-in': 'fadein 0.3s ease both',
        wave: 'wave 1.1s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
