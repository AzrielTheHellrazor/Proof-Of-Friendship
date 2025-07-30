import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)"],
        mono: ["var(--font-geist-mono)"],
      },
      animation: {
        'glow': 'glow 3s ease-in-out infinite',
        'pulse-slow': 'pulse-slow 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s infinite',
        'float': 'float 6s ease-in-out infinite',
        'bounce-gentle': 'bounce-gentle 2s ease-in-out infinite',
        'rotate-slow': 'rotate-slow 20s linear infinite',
        'cyberpunk-pulse': 'cyberpunk-pulse 2s ease-in-out infinite alternate',
        'holographic-shift': 'holographic-shift 3s ease-in-out infinite',
        'matrix-rain': 'matrix-rain 20s linear infinite',
        'neon-flicker': 'neon-flicker 1.5s ease-in-out infinite alternate',
        'pulse-cyber': 'pulse-cyber 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-cyber': 'spin-cyber 1s linear infinite',
        'grid-move': 'grid-move 20s linear infinite',
        'scanlines': 'scanlines 0.1s linear infinite',
        'gradient-shift': 'gradient-shift 3s ease infinite',
        'particle-float': 'particle-float 6s ease-in-out infinite',
      },
      backdropBlur: {
        xs: '2px',
      },
      perspective: {
        '1000': '1000px',
        '1500': '1500px',
      },
      transitionDuration: {
        '400': '400ms',
        '600': '600ms',
        '800': '800ms',
        '900': '900ms',
      },
    },
  },
  plugins: [],
};

export default config;