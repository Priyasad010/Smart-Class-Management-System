/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary:   { DEFAULT: '#6366f1', hover: '#4f46e5', light: '#e0e7ff' },
        secondary: { DEFAULT: '#0ea5e9', hover: '#0284c7' },
        success:   { DEFAULT: '#10b981', light: '#d1fae5' },
        danger:    { DEFAULT: '#ef4444', light: '#fee2e2' },
        warning:   { DEFAULT: '#f59e0b', light: '#fef3c7' },
        surface:   { DEFAULT: '#1e293b', card: '#0f172a', border: '#334155' },
        muted:     '#64748b',
      },
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
      boxShadow: {
        card:  '0 4px 24px rgba(0,0,0,0.35)',
        glow:  '0 0 20px rgba(99,102,241,0.4)',
        modal: '0 25px 60px rgba(0,0,0,0.6)',
      },
      animation: {
        'fade-in':    'fadeIn 0.3s ease-out',
        'slide-up':   'slideUp 0.35s ease-out',
        'slide-right':'slideRight 0.35s ease-out',
        'spin-slow':  'spin 2s linear infinite',
      },
      keyframes: {
        fadeIn:     { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp:    { from: { opacity: 0, transform: 'translateY(20px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        slideRight: { from: { opacity: 0, transform: 'translateX(40px)' }, to: { opacity: 1, transform: 'translateX(0)' } },
      },
    },
  },
  plugins: [],
};
