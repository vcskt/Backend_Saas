/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        'blackjag': '#000000',
        'grayjag': '#4B5563',
        'lightjag': '#F3F4F6'
      }
    },
  },
  plugins: [],
}
