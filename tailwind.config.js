/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        genesis: {
          'bg-start': '#0D0D2B',
          'bg-end': '#1A0A30',
          primary: '#b39aff',
          'primary-deep': '#6c3bff',
          success: '#22ff73',
          warning: '#F97316',
          error: '#ff6b6b',
          info: '#9D4EDD',
          'text-primary': '#FFFFFF',
          'text-secondary': '#827a89',
          'text-tertiary': '#6b6b7b',
          surface: 'rgba(20, 18, 26, 0.7)',
          'surface-elevated': 'rgba(30, 31, 42, 0.8)',
          'border-subtle': 'rgba(255, 255, 255, 0.08)',
          shine: 'rgba(255, 255, 255, 0.05)'
        },
        'ngx-violet': '#6D00FF'
      },
      fontFamily: {
        inter: ['Inter'],
        'inter-bold': ['InterBold'],
        jetbrains: ['JetBrainsMono'],
        'jetbrains-medium': ['JetBrainsMonoMedium'],
        'jetbrains-semibold': ['JetBrainsMonoSemiBold'],
        'jetbrains-bold': ['JetBrainsMonoBold'],
      },
      fontSize: {
        h1: ['28px', { lineHeight: '1.2', fontWeight: '700' }],
        h2: ['22px', { lineHeight: '1.3', fontWeight: '700' }],
        h3: ['16px', { lineHeight: '1.4', fontWeight: '600' }],
        'label-lg': ['14px', { lineHeight: '1.4', fontWeight: '600' }],
        'label-sm': ['11px', { lineHeight: '1.3', fontWeight: '500' }],
        'label-pill': ['11px', { lineHeight: '1.3', fontWeight: '600' }],
        'body-lg': ['13px', { lineHeight: '1.5', fontWeight: '500' }],
        'body-sm': ['11px', { lineHeight: '1.4', fontWeight: '400' }],
        'number-lg': ['36px', { lineHeight: '1.1', fontWeight: '700' }],
        'number-md': ['28px', { lineHeight: '1.1', fontWeight: '700' }],
        'number-sm': ['18px', { lineHeight: '1.2', fontWeight: '700' }],
        tab: ['9px', { lineHeight: '1.2', fontWeight: '600' }]
      },
      spacing: {
        'screen-pad': '20px',
        'section-gap': '24px',
        'card-pad': '16px',
        'card-gap': '12px',
        'item-gap': '12px',
        'inner-gap': '8px'
      },
      borderRadius: {
        card: '16px',
        pill: '12px',
        btn: '14px',
        bar: '6px',
        'full-pill': '9999px'
      },
      boxShadow: {
        'glow-primary': '0 8px 24px rgba(108, 59, 255, 0.15)',
        'glow-success': '0 8px 16px rgba(34, 255, 115, 0.1)',
        'glow-warning': '0 8px 16px rgba(249, 115, 22, 0.1)',
        'glow-error': '0 8px 16px rgba(255, 107, 107, 0.1)',
        'glow-info': '0 8px 16px rgba(157, 78, 221, 0.1)',
        shine: '0 1px 2px rgba(255, 255, 255, 0.05)',
        'glass-sm': '0 4px 12px rgba(0, 0, 0, 0.2)',
        'glass-md': '0 8px 24px rgba(0, 0, 0, 0.3)'
      },
      backdropBlur: {
        xs: '2px',
        sm: '4px',
        md: '12px',
        lg: '20px'
      },
      letterSpacing: {
        tight: '-0.5px',
        normal: '0px',
        wide: '1.5px'
      },
      opacity: {
        3: '0.03',
        5: '0.05',
        8: '0.08',
        12: '0.12',
        15: '0.15'
      }
    }
  },
  plugins: []
};
