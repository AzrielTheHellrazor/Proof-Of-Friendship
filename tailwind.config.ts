import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: ['class', "class"],
  theme: {
  	extend: {
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		fontFamily: {
  			sans: [
  				'var(--font-geist-sans)'
  			],
  			mono: [
  				'var(--font-geist-mono)'
  			]
  		},
  		animation: {
  			glow: 'glow 3s ease-in-out infinite',
  			'pulse-slow': 'pulse-slow 3s ease-in-out infinite',
  			shimmer: 'shimmer 2s infinite',
  			float: 'float 6s ease-in-out infinite',
  			'bounce-gentle': 'bounce-gentle 2s ease-in-out infinite',
  			'rotate-slow': 'rotate-slow 20s linear infinite',
  			'cyberpunk-pulse': 'cyberpunk-pulse 2s ease-in-out infinite alternate',
  			'holographic-shift': 'holographic-shift 3s ease-in-out infinite',
  			'matrix-rain': 'matrix-rain 20s linear infinite',
  			'neon-flicker': 'neon-flicker 1.5s ease-in-out infinite alternate',
  			'pulse-cyber': 'pulse-cyber 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
  			'spin-cyber': 'spin-cyber 1s linear infinite',
  			'grid-move': 'grid-move 20s linear infinite',
  			scanlines: 'scanlines 0.1s linear infinite',
  			'gradient-shift': 'gradient-shift 3s ease infinite',
  			'particle-float': 'particle-float 6s ease-in-out infinite'
  		},
  		backdropBlur: {
  			xs: '2px'
  		},
  		perspective: {
  			'1000': '1000px',
  			'1500': '1500px'
  		},
  		transitionDuration: {
  			'400': '400ms',
  			'600': '600ms',
  			'800': '800ms',
  			'900': '900ms'
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;