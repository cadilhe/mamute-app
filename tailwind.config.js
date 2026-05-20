/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        'surface-2': 'var(--surface-2)',
        border: 'var(--border)',
        text: 'var(--text)',
        'text-2': 'var(--text-2)',
        'text-3': 'var(--text-3)',
        piano: { DEFAULT: 'var(--piano)', bg: 'var(--piano-bg)' },
        robotica: { DEFAULT: 'var(--robotica)', bg: 'var(--robotica-bg)' },
        matematica: { DEFAULT: 'var(--matematica)', bg: 'var(--matematica-bg)' },
        ingles: { DEFAULT: 'var(--ingles)', bg: 'var(--ingles-bg)' },
        bateria: { DEFAULT: 'var(--bateria)', bg: 'var(--bateria-bg)' },
        reforco: { DEFAULT: 'var(--reforco)', bg: 'var(--reforco-bg)' },
        danger: { DEFAULT: 'var(--danger)', bg: 'var(--danger-bg)' },
        warning: { DEFAULT: 'var(--warning)', bg: 'var(--warning-bg)' },
        success: { DEFAULT: 'var(--success)', bg: 'var(--success-bg)' },
      },
      borderRadius: {
        DEFAULT: 'var(--radius)',
        sm: 'var(--radius-sm)',
      },
      boxShadow: {
        DEFAULT: 'var(--shadow)',
        md: 'var(--shadow-md)',
      }
    },
  },
  plugins: [],
}
