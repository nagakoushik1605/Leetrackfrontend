/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        base: {
          black: '#0a0a0d',
          charcoal: '#16161c',
          charcoal2: '#1e1e26',
          border: '#2a2a35',
        },
        brand: {
          purple: '#8b5cf6',
          purpleLight: '#a78bfa',
          purpleDark: '#6d28d9',
          orange: '#fb923c',
          orangeLight: '#fdba74',
        },
      },
      fontFamily: {
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
        display: ['"Sora"', '"Inter"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 40px -10px rgba(139, 92, 246, 0.45)',
        glowOrange: '0 0 40px -12px rgba(251, 146, 60, 0.4)',
        card: '0 8px 30px rgba(0,0,0,0.35)',
      },
      backgroundImage: {
        'grid-fade':
          'radial-gradient(circle at top, rgba(139,92,246,0.15), transparent 60%)',
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
      },
    },
  },
  plugins: [],
};
