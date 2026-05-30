import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        sophos: {
          navy: '#0B1F3A',
          blue: '#0049BD',
          mid: '#1a3a6b',
        },
      },
    },
  },
  plugins: [],
}
export default config
