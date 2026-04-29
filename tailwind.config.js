/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1.5rem',
        sm: '2.5rem',
        lg: '4rem',
      },
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      fontFamily: {
        // Both display and body use TT Hoves per design spec
        display: ['TT Hoves', 'var(--font-playfair)', 'Georgia', 'serif'],
        body: [
          'TT Hoves',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'Helvetica',
          'Arial',
          'sans-serif',
        ],
        sans: [
          'TT Hoves',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'Helvetica',
          'Arial',
          'sans-serif',
        ],
      },
      colors: {
        // ── Design System Tokens ──────────────────────────────────
        // Primary palette
        ink: '#1a1a1a', // near-black text
        stone: '#2a2825', // dark warm stone
        sand: '#E8E2D8', // warm beige / sand
        charcoal: '#111110', // deep charcoal (footer bg)

        // ── Legacy aliases (kept for backward compatibility) ──────
        primary: '#000000',
        accent: '#FFFFFF',
        'warm-gray': '#8a8680',
        'stone-dark': '#1a1917',
        'stone-mid': '#2a2825',
        'stone-light': '#EBEBEB',
        beige: '#E8E2D8',
        'footer-bg': '#111110',
        'card-text': '#1a1a1a',
        'card-body': '#2a2a2a',
        'card-muted': '#5a5a5a',
        divider: '#c8c4bc',
        'border-subtle': 'rgba(255,255,255,0.08)',
      },
      spacing: {
        // ── Section / Container / Card spacing tokens ─────────────
        'section-sm': '4rem', // 64px — compact section padding
        'section-md': '6rem', // 96px — standard section padding
        'section-lg': '8rem', // 128px — large section padding
        'container-x': '1.5rem', // default horizontal container padding
        'card-gap': '2rem', // gap between cards
        'card-pad': '1.5rem', // internal card padding
        // ── Numeric spacing scale ─────────────────────────────────
        18: '4.5rem',
        22: '5.5rem',
        26: '6.5rem',
        30: '7.5rem',
        34: '8.5rem',
        38: '9.5rem',
        42: '10.5rem',
        46: '11.5rem',
        50: '12.5rem',
      },
      maxWidth: {
        container: '80rem',
        'container-wide': '100rem',
      },
      borderRadius: {
        none: '0',
        sm: '2px',
        DEFAULT: '4px',
        md: '6px',
        lg: '8px',
        xl: '12px',
        '2xl': '16px',
        full: '9999px',
      },
      letterSpacing: {
        'ultra-wide': '0.18em',
        'mega-wide': '0.25em',
        brand: '0.28em',
        nav: '0.12em',
        label: '0.15em',
      },
      lineHeight: {
        display: '1.05',
        'snug-display': '1.15',
        body: '1.75',
        loose: '1.8',
      },
      aspectRatio: {
        portrait: '3 / 4',
      },
    },
  },
  plugins: [],
};
