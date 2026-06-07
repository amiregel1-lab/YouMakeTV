/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          pink: '#ff4aad',
          purple: '#8b5cf6',
          indigo: '#5b21b6',
          blue: '#3b82f6',
          cyan: '#22d3ee',
          navy: '#111827',
          slate: '#f8fbff',
        },
      },
      boxShadow: {
        cinematic: '0 30px 80px rgba(15, 23, 42, 0.18)',
        soft: '0 20px 60px rgba(15, 23, 42, 0.08)',
        glow: '0 0 40px rgba(139, 92, 246, 0.18)',
      },
      backgroundImage: {
        'brand-soft': 'radial-gradient(circle at top left, rgba(255, 74, 173, 0.14), transparent 24%), radial-gradient(circle at bottom right, rgba(34, 211, 238, 0.14), transparent 26%)',
        'brand-fade': 'linear-gradient(135deg, rgba(255, 74, 173, 0.16), rgba(99, 102, 241, 0.12), rgba(34, 211, 238, 0.14))',
      },
    },
  },
  plugins: [],
};
