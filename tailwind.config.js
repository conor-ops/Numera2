/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['Roboto Mono', 'monospace'],
      },
      colors: {
        brand: {
          black: '#000000',
          white: '#FFFFFF',
          blue: '#2563EB',
          gray: '#F3F4F6',
        }
      },
      borderWidth: {
        '3': '3px',
      },
      boxShadow: {
        'swiss': '4px 4px 0px 0px #000000',
      }
    }
  },
  plugins: [],
}
