/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#FFF5F2',
          100: '#FFE9E2',
          200: '#FFD3C4',
          300: '#FFAF96',
          400: '#FF7D57',
          500: '#FF4D26',
          600: '#EA3710',
          700: '#C42907',
          800: '#9C2308',
          900: '#7B200A',
          DEFAULT: '#FF4D26',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          secondary: '#FBFBFA',
          tertiary: '#F4F4F1',
          border: 'rgba(18, 19, 22, 0.08)',
        },
      },
      fontFamily: {
        display: ['Space Grotesk', 'sans-serif'],
        body: ['Plus Jakarta Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        subtle: '0 1px 3px rgba(18, 19, 22, 0.04), 0 4px 16px rgba(18, 19, 22, 0.03)',
        elevated: '0 4px 6px -1px rgba(18, 19, 22, 0.05), 0 10px 25px -3px rgba(18, 19, 22, 0.06)',
        popover: '0 16px 40px -4px rgba(18, 19, 22, 0.1), 0 6px 16px -2px rgba(18, 19, 22, 0.04)',
        'glow-brand': '0 0 24px -2px rgba(255, 77, 38, 0.35)',
        'glow-mint': '0 0 20px -2px rgba(16, 185, 129, 0.35)',
      },
    },
  },
  plugins: [],
};
