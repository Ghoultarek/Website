import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: 'class',
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f7f3f2',
          100: '#e3e4d9',
          200: '#bcd1e2',
          300: '#a8c4d8',
          400: '#94b7ce',
          500: '#80aac4',
          600: '#6c9dba',
          700: '#5890b0',
          800: '#4483a6',
          900: '#30769c',
        },
        beige: {
          50: '#f7f3f2',
          100: '#f0e8e6',
          200: '#e9ddda',
          300: '#e2d2ce',
          400: '#dbc7c2',
          500: '#d4bcb6',
        },
        seafoam: {
          50: '#e3e4d9',
          100: '#d9dacf',
          200: '#cfd0c5',
          300: '#c5c6bb',
          400: '#bbbcb1',
          500: '#b1b2a7',
        },
        bluebell: {
          50: '#bcd1e2',
          100: '#b2c7dc',
          200: '#a8bdd6',
          300: '#9eb3d0',
          400: '#94a9ca',
          500: '#8a9fc4',
        },
        gray: {
          50: '#f7f3f2',
          100: '#e3e4d9',
          200: '#d9d9d3',
          300: '#c5c5bf',
          400: '#b1b1ab',
          500: '#9d9d97',
          600: '#898983',
          700: '#75756f',
          800: '#1a1818',
          900: '#0f0e0e',
        },
        lighter: '#ffffff',
        darker: '#0D0D0D',
        light: '#f9fafb',
        dark: '#171717',
      },
    },
  },
  plugins: [],
};
export default config;





