import type { Config } from 'tailwindcss';

export default {
  content: ['./src/app/**/*.{ts,tsx}', './src/components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      screens: {
        xs: '404px',
      },
      colors: {
        brand: {
          50: '#eff6ff',
          200: '#bfdbfe',
          500: '#3b82f6',
          700: '#1d4ed8',
        },
      },
    },
  },
} satisfies Config;
