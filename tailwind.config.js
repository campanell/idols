/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  safelist: [
    'border-yellow-300',
    'border-sky-300',
    'border-red-500',
    'border-pink-200',
    'border-zinc-200',
    'border-blue-300',
    'border-pink-500',
    'border-slate-300'
  ],
  theme: {
    extend: {
      colors: {
        brand: {
        'dark': '#333d79',   // Deep blue
        'light': '#faebef',  // Soft pink background
        'gray': '#6e6e6d',   // Neutral gray
        'accent': '#fad0c9', // Accent peachy-pink
        },
      },
    },
  },
  plugins: [],
}
