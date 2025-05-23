// /** @type {import('tailwindcss').Config} */
// module.exports = {
//   content: [],
//   theme: {
//     extend: {},
//   },
//   plugins: [],
// }



// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}", // If you use the `app` directory
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}", // This covers your entire src directory
  ],
  theme: {
    extend: {
      // You can define custom colors, fonts, spacing, etc. here
      // Example:
      // colors: {
      //   'banana-green': '#4CAF50',
      //   'banana-yellow': '#FFD700',
      // },
    },
  },
  plugins: [],
}