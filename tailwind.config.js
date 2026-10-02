/** @type {import('tailwindcss').Config} */
export default {
	darkMode: "class",
	prefix: "",
	content: ["./src/**/*.{js,jsx,ts,tsx}", "./src/renderer/*.tsx"],
	theme: {
		container: {
			center: true,
			padding: "2rem",
			screens: {
				"2x1": "1400pxs"
			}
		},
		extend: {
			colors: {
				border: "hsl(var(--border))",
				input: "hsl(var(--input))",
				ring: "hsl(var(--ring))",
				background: "hsl(var(--background))",
				foreground: "hsl(var(--foreground))",
				primary: {
					DEFAULT: "hsl(var(--primary))",
					foreground: "hsl(var(--primary-foreground))"
				},
				secondary: {
					DEFAULT: "hsl(var(--secondary))",
					foreground: "hsl(var(--secondary-foreground))"
				},
				destructive: {
					DEFAULT: "hsl(var(--destructive))",
					foreground: "hsl(var(--destructive-foreground))"
				},
				muted: {
					DEFAULT: "hsl(var(--muted))",
					foreground: "hsl(var(--muted-foreground))"
				},
				popover: {
					DEFAULT: "hsl(var(--popover))",
					foreground: "hsl(var(--popover-foreground))"
				},
				card: {
					DEFAULT: "hsl(var(--card))",
					foreground: "hsl(var(--card-foreground))"
				},
				// Custom accent color
				accent: {
					DEFAULT: "#FF5B5A"
				}
			},
			animation: {
				"tooltip-slide-down":
					"slideDownAndFade 400ms cubic-bezier(0.16, 1, 0.3, 1)",
				"tooltip-slide-up":
					"slideUpAndFade 400ms cubic-bezier(0.16, 1, 0.3, 1)",
				"tooltip-slide-right":
					"slideRightAndFade 400ms cubic-bezier(0.16, 1, 0.3, 1)",
				"tooltip-slide-left":
					"slideLeftAndFade 400ms cubic-bezier(0.16, 1, 0.3, 1)",
				"menubar-appear": "menubarAppear 400ms cubic-bezier(0.16, 1, 0.3, 1)",
				"popover-slide": "popoverSlide 200ms",
				"popover-slide-reverse": "popoverSlide 200ms reverse ease-in",
				"accordion-down": "accordion-down 0.2s ease-out",
				"accordion-up": "accordion-up 0.2s ease-out"
			},
			borderRadius: {
				lg: "var(--radius)",
				md: "calc(var(--radius) - 2px)",
				sm: "calc(var(--radius) - 4px)"
			},
			keyframes: {
				"accordion-down": {
					from: { height: "0" },
					to: { height: "var(--radix-accordion-content-height)" }
				},
				"accordion-up": {
					from: { height: "var(--radix-accordion-content-height)" },
					to: { height: "0" }
				},
				slideUpAndFade: {
					from: { opacity: 0, transform: "translateY(2px)" },
					to: { opacity: 1, transform: "translateY(0)" }
				},
				slideRightAndFade: {
					from: { opacity: 0, transform: "translateX(-2px)" },
					to: { opacity: 1, transform: "translateX(0)" }
				},
				slideDownAndFade: {
					from: { opacity: 0, transform: "translateY(-2px)" },
					to: { opacity: 1, transform: "translateY(0)" }
				},
				slideLeftAndFade: {
					from: { opacity: 0, transform: "translateX(2px)" },
					to: { opacity: 1, transform: "translateY(0)" }
				},
				menubarAppear: {
					from: { opacity: 0, transform: "scale(0.95)" },
					to: { opacity: 1, transform: "scale(1)" }
				},
				popoverSlide: {
					from: { transform: "tanslateY(-10px)", opacity: 0 },
					to: { transform: "translateY(0)", opacity: 1 }
				}
			}
		}
	},
	plugins: [require("tailwindcss-animate")]
};
