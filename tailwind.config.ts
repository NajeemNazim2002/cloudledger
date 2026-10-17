import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: { extend: { colors: {
    navy: "#0a1a5c", brand: "#1d6fe0", violet: "#7b2fbf", mist: "#eef3ff",
  } } },
  plugins: [],
};
export default config;
