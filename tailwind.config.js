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
    extend: {},
  },
  plugins: [],
}
