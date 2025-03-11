/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        techserv: {
          blue: '#04458D',
          gray: '#4E525B',
          black: '#282A30',
          storm: '#0A3251',
          sky: '#D9E8F7',
          yellow: '#FFFF00',
          conduit: '#E6E7E8'
        }
      },
      fontFamily: {
        saira: ['Saira', 'sans-serif'],
        neuton: ['Neuton', 'serif']
      },
      letterSpacing: {
        'brand': '0.05em', // 50pt tracking converted to em
      }
    },
  },
  plugins: [],
};