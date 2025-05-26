
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				'tajawal': ['Tajawal', 'sans-serif'],
				'poppins': ['Poppins', 'sans-serif'],
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				navy: {
					light: '#2A3A7B',
					DEFAULT: '#1A2456',
					dark: '#111739',
				},
				maroon: {
					light: '#8B2332',
					DEFAULT: '#6B0F1A',
					dark: '#4A0A12',
				},
				gold: {
					light: '#F5E7A1',
					DEFAULT: '#D4AF37',
					dark: '#9E7C0C',
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'slide-left': {
					'0%': { 
						transform: 'translateX(100%)', 
						opacity: '0' 
					},
					'100%': { 
						transform: 'translateX(0)', 
						opacity: '1' 
					},
				},
				'slide-right': {
					'0%': { 
						transform: 'translateX(-100%)', 
						opacity: '0' 
					},
					'100%': { 
						transform: 'translateX(0)', 
						opacity: '1' 
					},
				},
				'fade-in': {
					'0%': { 
						opacity: '0' 
					},
					'100%': { 
						opacity: '1' 
					},
				},
				'fade-in-up': {
					'0%': { 
						opacity: '0', 
						transform: 'translateY(20px)' 
					},
					'100%': { 
						opacity: '1', 
						transform: 'translateY(0)' 
					},
				},
				'carousel-slide': {
					'0%': { 
						transform: 'translateX(0)' 
					},
					'100%': { 
						transform: 'translateX(-100%)' 
					},
				},
				'zoom-in': {
					'0%': { 
						transform: 'scale(1)' 
					},
					'100%': { 
						transform: 'scale(1.05)' 
					},
				},
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'slide-left': 'slide-left 0.6s ease-out',
				'slide-right': 'slide-right 0.6s ease-out',
				'fade-in': 'fade-in 0.6s ease-out',
				'fade-in-up': 'fade-in-up 0.6s ease-out',
				'carousel-slide': 'carousel-slide 25s linear infinite',
				'zoom-in': 'zoom-in 0.3s ease-out forwards',
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
