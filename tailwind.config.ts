import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        void: 'var(--void)',
        surface: {
          DEFAULT: 'var(--surface)',
          raised: 'var(--surface-raised)',
          overlay: 'var(--surface-overlay)',
        },
        ink: {
          DEFAULT: 'var(--ink)',
          muted: 'var(--ink-muted)',
          faint: 'var(--ink-faint)',
        },
        border: {
          DEFAULT: 'var(--border)',
          strong: 'var(--border-strong)',
        },
        cyan: 'var(--cyan)',
        indigo: 'var(--indigo)',
        ember: 'var(--ember)',
        jade: 'var(--jade)',
        rose: 'var(--rose)',
        amber: 'var(--amber)',
      },
      fontFamily: {
        display: ['Bricolage Grotesque', 'sans-serif'],
        body: ['Plus Jakarta Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      backgroundImage: {
  'grid-pattern': `
    linear-gradient(rgba(0,0,0,0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0,0,0,0.04) 1px, transparent 1px)
  `
},
      boxShadow: {
        'glow-cyan': '0 0 20px rgba(217, 119, 6, 0.2), 0 0 40px rgba(217, 119, 6, 0.08)',
        'glow-indigo': '0 0 20px rgba(146, 64, 14, 0.2)',
        'glow-ember': '0 0 20px rgba(180, 83, 9, 0.2)',
        'card': '0 1px 3px rgba(0,0,0,0.08), 0 4px 24px rgba(0,0,0,0.06)',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        shimmer: 'shimmer 2s linear infinite',
      },
    },
  },
  plugins: [],
}

export default config