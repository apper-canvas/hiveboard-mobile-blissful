/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
extend: {
      colors: {
        primary: '#6366F1',
        secondary: '#0079D3',
        accent: '#46D160',
        surface: '#FFFFFF',
        background: '#DAE0E6',
        error: '#EA0027',
        warning: '#FFB000',
        info: '#0079D3',
      },
      fontFamily: {
        'inter': ['Inter', 'system-ui', 'sans-serif'],
      },
      typography: {
        DEFAULT: {
          css: {
            fontFamily: 'Inter, system-ui, sans-serif',
          },
        },
      },
    },
  },
  plugins: [],
}