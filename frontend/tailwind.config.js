/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: { primary: '#0B0E1A', secondary: '#111827', card: '#161D2F', hover: '#1E2A40' },
        accent: { purple: '#7C6FF7', 'purple-light': '#A89BFF', blue: '#3B82F6' },
        success: '#10B981',
        danger: '#EF4444',
        warning: '#F59E0B',
        text: { primary: '#F1F5F9', secondary: '#94A3B8', muted: '#475569' },
        border: '#1E2A40',
      },
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
    },
  },
  plugins: [],
}
