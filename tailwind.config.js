/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg:               'var(--color-bg)',
        surface:          'var(--color-surface)',
        'surface-glass':  'var(--color-surface-glass)',
        'surface-raised': 'var(--color-surface-raised)',
        'text-primary':   'var(--color-text-primary)',
        'text-secondary': 'var(--color-text-secondary)',
        'text-muted':     'var(--color-text-muted)',
        'grid-line':      'var(--color-grid-line)',
        primary:          'var(--color-primary)',
        'primary-soft':   'var(--color-primary-soft)',
        success:          'var(--color-success)',
        warning:          'var(--color-warning)',
        danger:           'var(--color-danger)',
        info:             'var(--color-info)',
      },
      spacing: {
        xs: 'var(--space-xs)',
        sm: 'var(--space-sm)',
        md: 'var(--space-md)',
        lg: 'var(--space-lg)',
        xl: 'var(--space-xl)',
      },
      fontFamily: {
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        body:    ['var(--font-body)',    'system-ui', 'sans-serif'],
        mono:    ['var(--font-mono)',    'monospace'],
      },
      fontSize: {
        xs:      ['var(--text-xs)',      { lineHeight: 'var(--leading-normal)' }],
        sm:      ['var(--text-sm)',      { lineHeight: 'var(--leading-normal)' }],
        base:    ['var(--text-base)',    { lineHeight: 'var(--leading-normal)' }],
        lg:      ['var(--text-lg)',      { lineHeight: 'var(--leading-normal)' }],
        xl:      ['var(--text-xl)',      { lineHeight: 'var(--leading-tight)'  }],
        '2xl':   ['var(--text-2xl)',     { lineHeight: 'var(--leading-tight)'  }],
        '3xl':   ['var(--text-3xl)',     { lineHeight: 'var(--leading-tight)'  }],
        '4xl':   ['var(--text-4xl)',     { lineHeight: 'var(--leading-tight)'  }],
        display: ['var(--text-display)', { lineHeight: 'var(--leading-tight)'  }],
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
      },
      boxShadow: {
        sm:      'var(--shadow-sm)',
        md:      'var(--shadow-md)',
        lg:      'var(--shadow-lg)',
        primary: 'var(--shadow-primary)',
        focus:   'var(--shadow-focus)',
      },
      letterSpacing: {
        label: 'var(--tracking-label)',
      },
      width: {
        'cell-mobile':  'var(--cell-size-mobile)',
        'cell-desktop': 'var(--cell-size-desktop)',
      },
      height: {
        'cell-mobile':  'var(--cell-size-mobile)',
        'cell-desktop': 'var(--cell-size-desktop)',
      },
      backgroundImage: {
        'gradient-surface': 'var(--gradient-surface)',
        'gradient-primary': 'var(--gradient-primary)',
        'gradient-success': 'var(--gradient-success)',
      },
      transitionDuration: {
        fast: '90ms',
        base: '130ms',
        slow: '200ms',
      },
      transitionTimingFunction: {
        modal: 'var(--transition-modal)',
      },
    },
  },
  plugins: [],
}
