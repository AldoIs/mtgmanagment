/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Predefined player colors (vibrant and high contrast for tabletop play)
        player1: '#ef4444', // Red
        player2: '#3b82f6', // Blue
        player3: '#10b981', // Emerald Green
        player4: '#f59e0b', // Amber/Yellow
        player5: '#8b5cf6', // Violet
        player6: '#ec4899', // Pink
        player7: '#f97316', // Orange
        player8: '#06b6d4', // Cyan
      }
    },
  },
  plugins: [],
}
