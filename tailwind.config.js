/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.jsx", 'node_modules/flowbite-react/lib/esm/**/*.jsx'],
  theme: {
    extend: {},
  },
  plugins: [
    require('flowbite/plugin')
  ],
}

