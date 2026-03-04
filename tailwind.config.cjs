// tailwind.config.js   (or .cjs if you prefer)
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}', // all app routes
    './src/app/(frontend)/**/*.{js,ts,jsx,tsx,mdx}', // your login/register group
    './src/components/**/*.{js,ts,jsx,tsx,mdx}', // if you have components
    // add any other folders if needed
  ],
  theme: {
    extend: {
      // you can add custom colors, fonts, etc. here if needed
    },
  },
  plugins: [],
}
