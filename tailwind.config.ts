import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}", "./lib/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        civic: {
          navy: "#123047",
          green: "#1f8a5b",
          blue: "#2364aa",
          amber: "#f4a261",
          red: "#d84727"
        }
      },
      boxShadow: {
        soft: "0 18px 55px rgba(18, 48, 71, 0.12)",
        lift: "0 24px 70px rgba(18, 48, 71, 0.16)"
      }
    }
  },
  plugins: []
};

export default config;
