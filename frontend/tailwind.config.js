/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        navy: { DEFAULT: '#152238', 900: '#0E1728', 800: '#152238', 700: '#1C2E48' },
        steel: { DEFAULT: '#2F5D8A', 600: '#2F5D8A', 500: '#3E76AC' },
        amber: { DEFAULT: '#F2A71B', 600: '#DA930E', 700: '#B87A0B' },
        concrete: { DEFAULT: '#EFECE4', 100: '#F7F5F0', 200: '#EFECE4', 300: '#E2DDD1' },
        ink: '#1C1A17',
        rust: '#C1502E',
      },
      fontFamily: {
        head: ['"Barlow Condensed"', 'sans-serif'],
        body: ['"Barlow"', '"Inter"', 'sans-serif'],
      },
      borderRadius: {
        sm: '3px',
        DEFAULT: '4px',
        lg: '6px',
      },
    },
  },
  plugins: [],
}
