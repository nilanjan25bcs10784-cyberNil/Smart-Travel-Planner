/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Playfair Display'", "Georgia", "serif"],
        body: ["'DM Sans'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      colors: {
        sand: {
          50:  "#fdf8f0",
          100: "#faefd9",
          200: "#f3d9a8",
          300: "#ebbf6d",
          400: "#e2a03a",
          500: "#d4851e",
          600: "#b96716",
          700: "#9a4f15",
          800: "#7d4018",
          900: "#673618",
        },
        ocean: {
          50:  "#f0f9ff",
          100: "#e0f2fe",
          200: "#b9e5fd",
          300: "#7cd0fb",
          400: "#37b8f5",
          500: "#0d9de5",
          600: "#027cc4",
          700: "#03629f",
          800: "#075383",
          900: "#0c456d",
        },
        forest: {
          50:  "#f2fbf4",
          100: "#e0f5e6",
          200: "#c2eacf",
          300: "#91d8a9",
          400: "#59bc7a",
          500: "#339f58",
          600: "#238045",
          700: "#1d6639",
          800: "#1b5130",
          900: "#184329",
        },
        dusk: {
          50:  "#fdf4ff",
          100: "#fae8ff",
          200: "#f5d0fe",
          300: "#eca8fc",
          400: "#dc70f8",
          500: "#c33ef0",
          600: "#a61fd4",
          700: "#8a18ad",
          800: "#711a8d",
          900: "#5d1a72",
        },
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease-out",
        "slide-up": "slideUp 0.4s ease-out",
        "slide-in-right": "slideInRight 0.3s ease-out",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "float": "float 6s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          from: { opacity: 0 },
          to:   { opacity: 1 },
        },
        slideUp: {
          from: { opacity: 0, transform: "translateY(20px)" },
          to:   { opacity: 1, transform: "translateY(0)" },
        },
        slideInRight: {
          from: { opacity: 0, transform: "translateX(20px)" },
          to:   { opacity: 1, transform: "translateX(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%":      { transform: "translateY(-10px)" },
        },
      },
      boxShadow: {
        card: "0 4px 24px -4px rgba(0,0,0,0.12)",
        "card-hover": "0 8px 40px -4px rgba(0,0,0,0.18)",
        glow: "0 0 30px rgba(212,133,30,0.25)",
      },
    },
  },
  plugins: [],
}
