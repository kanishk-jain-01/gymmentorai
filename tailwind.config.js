/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'theme': {
          'bg': 'var(--background)',
          'fg': 'var(--foreground)',
          'card': 'var(--card-bg)',
          'accent': 'var(--subtle-accent)',
          'border': 'var(--border-color)',
        }
      }
    }
  },
  plugins: [],
};