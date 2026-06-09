import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        sophos: {
          navy: '#0B1F3A',
          blue:  '#0049BD',
          mid:   '#1a3a6b',
        },
        // Semantic surface tokens
        page:       'var(--bg)',
        card:       'var(--card)',
        'card-alt': 'var(--card-alt)',
        // Semantic border tokens
        border:     'var(--border)',
        'border-s': 'var(--border-s)',
        // Semantic text tokens
        fg:         'var(--fg)',
        'fg-dim':   'var(--fg-dim)',
        'fg-muted': 'var(--fg-muted)',
        // Accent
        accent:     'var(--accent)',
        'accent-h': 'var(--accent-h)',
      },
    },
  },
  plugins: [],
}
export default config
