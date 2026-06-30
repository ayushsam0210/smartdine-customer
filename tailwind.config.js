/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Page backgrounds
        beige: '#F7F3EE',
        'beige-dark': '#EDE7DE',
        // Surfaces
        surface: '#FFFFFF',
        'surface-alt': '#F2EDE5',
        // Brand dark
        'near-black': '#1A1512',
        'hero-dark': '#0C0909',
        // Accent
        coral: '#E8654A',
        'coral-dark': '#CF5035',
        'coral-light': '#FFF2EE',
        // Dark brown for gradients
        'dark-brown': '#2C1810',
        // Text
        muted: '#84766D',
        'muted-light': '#B5A99E',
        // Borders
        'border-warm': '#EDE7DE',
        // Misc
        'card-bg': '#F2EDE5',
        // Gold accent
        gold: '#B8821A',
        'gold-light': '#FEF3E2',
      },
      fontFamily: {
        // Inika: reserved for restaurant name, hero titles, landmark moments
        display: ['Inika', 'Georgia', 'serif'],
        // Plus Jakarta Sans: all UI — buttons, labels, category names, card titles
        heading: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        // Inter: descriptions, body text, secondary content
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        pill: '9999px',
        card: '18px',
        'card-sm': '12px',
        hero: '22px',
        image: '14px',
      },
      boxShadow: {
        card: '0 2px 8px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.03)',
        'card-hover': '0 6px 20px rgba(0,0,0,0.10), 0 0 0 1px rgba(0,0,0,0.04)',
        float: '0 8px 32px rgba(0,0,0,0.20), 0 2px 8px rgba(0,0,0,0.08)',
        'coral-glow': '0 4px 18px rgba(232,101,74,0.40)',
        input: 'inset 0 1px 2px rgba(0,0,0,0.04)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.94)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        // FIXED: Renamed to prevent colliding with Tailwind's core 'pulse' keyframe
        'pulse-custom': {
          '0%': { opacity: '0.6' },
          '50%': { opacity: '1' },
          '100%': { opacity: '0.6' }, // Explicit 100% ensures smooth infinity looping
        },
      },
      animation: {
        'fade-up': 'fade-up 0.36s ease-out both',
        'scale-in': 'scale-in 0.28s ease-out both',
        shimmer: 'shimmer 1.6s ease-in-out infinite',
        'pulse-slow': 'pulse-custom 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
