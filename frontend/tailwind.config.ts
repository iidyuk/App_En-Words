import type { Config } from "tailwindcss";

const config: Config = {
	content: ["./index.html", "./src/**/*.{ts,tsx}"],
	theme: {
		extend: {
			colors: {
				brand: {
					50: "#f5f7ff",
					100: "#e0e7ff",
					200: "#c7d2fe",
					500: "#6366f1",
					600: "#4f46e5",
					900: "#1e1b4b",
				},
			},
		},
	},
	plugins: [],
};

export default config;
