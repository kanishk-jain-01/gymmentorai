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
        // Map your CSS variables to Tailwind colors
        'theme': {
          'bg': 'var(--background)',
          'fg': 'var(--foreground)',
          'card': 'var(--card-bg)',
          'accent': 'var(--subtle-accent)',
          'border': 'var(--border-color)',
        },
      },
      backgroundColor: {
        // Shortcuts for common backgrounds
        'page': 'var(--background)',
        'card': 'var(--card-bg)',
      },
      textColor: {
        // Shortcuts for common text colors
        'body': 'var(--foreground)',
      },
      borderColor: {
        // Shortcuts for common border colors
        'theme': 'var(--border-color)',
      },
    },
  },
  plugins: [],
};