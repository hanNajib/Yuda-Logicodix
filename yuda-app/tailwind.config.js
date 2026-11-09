/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./App.tsx",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        'yuda': {
          bg: '#f5f1ea',
          'bg-top': '#e8f0e8',
          primary: '#2d5a3d',
          secondary: '#c5ccc0',
          text: '#1a1a1a',
          subtext: '#555555',
        },
      },
      fontFamily: {
        'outfit-medium': ['Outfit_500Medium'],
        'outfit-semibold': ['Outfit_600SemiBold'],
        'outfit-bold': ['Outfit_700Bold'],
        'outfit-extrabold': ['Outfit_800ExtraBold'],
      },
    },
  },
  plugins: [],
}
