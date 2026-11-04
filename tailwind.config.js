/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  // The site already ships its own hand-written CSS (src/index.css).
  // - preflight off: don't reset/override existing element styles
  // - container off: your CSS already defines `.container`, Tailwind's would clash
  corePlugins: { preflight: false, container: false },
  theme: {
    extend: {
      fontFamily: {
        sans: ['Manrope', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"DM Mono"', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
}
