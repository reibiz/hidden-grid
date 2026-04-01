# Hidden Grid — Component Library

This document describes the component library built from the Visual Style Guide. All components use design tokens defined in `src/styles/tokens.css` and are available as utility classes or CSS custom properties.

---

## Table of Contents

1. [Design Tokens](#design-tokens)
2. [Component Classes](#component-classes)
3. [Tailwind Utilities](#tailwind-utilities)
4. [Usage Examples](#usage-examples)
5. [Theme Support](#theme-support)

---

## Design Tokens

All design tokens are defined as CSS custom properties in `src/styles/tokens.css`. They can be accessed directly in CSS or through Tailwind utilities.

### Color Tokens

```css
/* Backgrounds */
--color-bg              /* App background */
--color-surface         /* Panels, cards */
--color-surface-glass   /* Glassmorphism overlays */

/* Text */
--color-text-primary    /* Main text */
--color-text-secondary  /* Secondary text */

/* Brand & Accents */
--color-primary         /* Brand accent, streak flame */
--color-primary-soft    /* Background glows */

/* Status Colors */
--color-success         /* Perfect row/col, success states */
--color-warning         /* Streak warnings */
--color-danger          /* Mistakes, errors */
--color-info            /* Tooltips, hints */

/* Grid & Borders */
--color-grid-line       /* Grid lines */
```

### Spacing Tokens

```css
--space-xs  /* 4px - icon padding */
--space-sm  /* 8px - chip spacing */
--space-md  /* 16px - standard gap */
--space-lg  /* 24px - panel padding */
--space-xl  /* 32px - section separation */
```

### Typography Tokens

```css
/* Font Families */
--font-display  /* Display headings */
--font-body     /* Body text */
--font-mono     /* Monospace (timers, seeds) */

/* Font Sizes */
--text-xs       /* 12px */
--text-sm       /* 14px */
--text-base     /* 16px */
--text-lg       /* 18px */
--text-xl       /* 20px */
--text-2xl      /* 24px */
--text-3xl      /* 32px */
--text-4xl      /* 40px */
--text-display  /* clamp(28px, 2.7vw, 40px) */

/* Line Heights */
--leading-tight    /* 1.1 */
--leading-normal   /* 1.4 */
--leading-relaxed  /* 1.6 */

/* Letter Spacing */
--tracking-label   /* 0.12em */
```

### Effect Tokens

```css
/* Border Radius */
--radius-sm  /* 8px */
--radius-md  /* 10px */
--radius-lg  /* 18px */
--radius-xl  /* 24px */

/* Shadows */
--shadow-sm      /* Subtle shadow */
--shadow-md      /* Medium shadow */
--shadow-lg      /* Large shadow */
--shadow-primary /* Primary button shadow */
--shadow-focus   /* Focus ring shadow */

/* Transitions */
--transition-fast  /* 120ms ease */
--transition-base  /* 150ms ease */
--transition-slow  /* 160ms ease */
--transition-modal /* cubic-bezier(0.21, 0.98, 0.6, 1) */

/* Gradients */
--gradient-surface  /* Panel background */
--gradient-primary  /* Primary button, filled cells */
--gradient-success  /* Success states */
```

---

## Component Classes

### Buttons

#### Primary Button (`.btn-accent` or `.btn-primary`)

```html
<button class="btn btn-accent">Click Me</button>
```

- Uses `--gradient-primary` background
- Includes shadow and hover effects
- Automatically handles focus states

#### Secondary Button (`.btn-neutral` or `.btn-secondary`)

```html
<button class="btn btn-neutral">Cancel</button>
```

- Glass surface with backdrop blur
- Subtle border
- Hover increases opacity

#### Tertiary Button (`.btn-ghost` or `.btn-tertiary`)

```html
<button class="btn btn-ghost">Learn More</button>
```

- Transparent background
- Accent color text
- Hover shows soft background

**Button States:**
- `:hover` - Lifts up (`translateY(-1px)`) and brightens
- `:active` - Presses down (`translateY(1px)`)
- `:focus-visible` - Shows focus ring

### Panels & Cards

```html
<div class="panel">
  <!-- Panel content -->
</div>
```

- Uses `--gradient-surface` background
- Rounded corners (`--radius-lg`)
- Shadow and border styling
- Padding included (`--space-lg`)

### Grid Cells

```html
<!-- Empty cell -->
<button class="cell cell-empty"></button>

<!-- Filled cell -->
<button class="cell cell-filled"></button>

<!-- Marked cell (X) -->
<button class="cell cell-marked">✖</button>
```

**Cell Classes:**
- `.cell` - Base cell styles (size, border, transitions)
- `.cell-empty` - Empty state
- `.cell-filled` - Filled with gradient
- `.cell-marked` - Marked with X

**Responsive Sizing:**
- Mobile: `--cell-size-mobile` (36px)
- Desktop: `--cell-size-desktop` (44px)

### Text Utilities

```html
<h1 class="text-display">Hidden Grid</h1>
<p class="text-mono">00:45</p>
<span class="text-label">Difficulty</span>
```

**Text Classes:**
- `.text-display` - Display font for headings
- `.text-mono` - Monospace for timers/seeds
- `.text-label` - Uppercase label styling

### Status Colors

```html
<span class="text-success">Perfect!</span>
<span class="text-warning">Warning</span>
<span class="text-danger">Error</span>
<span class="text-info">Info</span>
<span class="text-primary">Primary</span>
```

**Background Colors:**
```html
<div class="bg-success"></div>
<div class="bg-warning"></div>
<div class="bg-danger"></div>
<div class="bg-info"></div>
<div class="bg-primary"></div>
```

---

## Tailwind Utilities

All design tokens are available as Tailwind utilities through the extended theme configuration.

### Colors

```html
<div class="bg-bg text-text-primary">
<div class="bg-surface border-border-grid-line">
<div class="text-primary bg-primary-soft">
```

Available color utilities:
- `bg-*`, `text-*`, `border-*` for all color tokens
- Examples: `bg-primary`, `text-success`, `border-grid-line`

### Spacing

```html
<div class="p-xs m-sm gap-md">
```

Available spacing utilities:
- `p-xs`, `p-sm`, `p-md`, `p-lg`, `p-xl` (padding)
- `m-xs`, `m-sm`, `m-md`, `m-lg`, `m-xl` (margin)
- `gap-xs`, `gap-sm`, `gap-md`, `gap-lg`, `gap-xl` (gap)

### Typography

```html
<h1 class="font-display text-display">
<p class="font-body text-base">
<code class="font-mono text-sm">
```

Available typography utilities:
- `font-display`, `font-body`, `font-mono`
- `text-xs`, `text-sm`, `text-base`, `text-lg`, `text-xl`, `text-2xl`, `text-3xl`, `text-4xl`, `text-display`
- `tracking-label` (letter spacing)

### Border Radius

```html
<div class="rounded-sm rounded-md rounded-lg rounded-xl">
```

### Shadows

```html
<div class="shadow-sm shadow-md shadow-lg shadow-primary shadow-focus">
```

### Gradients

```html
<div class="bg-gradient-surface">
<div class="bg-gradient-primary">
<div class="bg-gradient-success">
```

### Grid Cell Sizes

```html
<div class="w-cell-mobile h-cell-mobile md:w-cell-desktop md:h-cell-desktop">
```

---

## Usage Examples

### Complete Button Example

```tsx
<button 
  className="btn btn-accent"
  onClick={handleClick}
>
  Start Game
</button>
```

### Panel with Content

```tsx
<div className="panel">
  <h2 className="text-display mb-md">Settings</h2>
  <p className="text-text-secondary">Configure your preferences</p>
  <div className="flex gap-sm mt-lg">
    <button className="btn btn-accent">Save</button>
    <button className="btn btn-neutral">Cancel</button>
  </div>
</div>
```

### Grid Cell Implementation

```tsx
<button
  className={`cell ${
    cell === 1 ? 'cell-filled' : 
    cell === 2 ? 'cell-marked' : 
    'cell-empty'
  }`}
  onClick={() => cycleCell(r, c, false)}
  onContextMenu={(e) => {
    e.preventDefault()
    cycleCell(r, c, true)
  }}
>
  {cell === 2 ? '✖' : ''}
</button>
```

### Status Message

```tsx
<div className="panel">
  <div className="text-success font-semibold">
    ✓ Row completed!
  </div>
  <div className="text-danger text-sm mt-sm">
    ⚠ Mistake detected
  </div>
</div>
```

### Modal with Glass Effect

```tsx
<div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
  <div className="panel max-w-md">
    {/* Modal content */}
  </div>
</div>
```

---

## Theme Support

The component library supports multiple themes through CSS custom properties. Themes are applied via class names on the root element.

### Available Themes

1. **Default (Dark)** - Applied by default
2. **Retro Ember** - Applied via `.theme-retro` class
3. **Zen Focus** - Applied via `.theme-zen` class

### Theme Switching

```tsx
// In your root component or Shell
useEffect(() => {
  document.documentElement.classList.remove('theme-retro', 'theme-zen')
  document.documentElement.classList.add(theme === 'retro' ? 'theme-retro' : 'theme-zen')
}, [theme])
```

All tokens automatically update when the theme class changes. No component code changes needed.

---

## Best Practices

1. **Use component classes** (`.btn`, `.panel`, `.cell`) for consistent styling
2. **Prefer Tailwind utilities** for layout and spacing
3. **Use CSS custom properties directly** when you need custom values
4. **Respect reduced motion** - animations automatically respect `prefers-reduced-motion`
5. **Maintain accessibility** - always include focus states and semantic HTML
6. **Test in both themes** - ensure components work in all theme variants

---

## Migration Guide

If you're updating existing components:

1. Replace hardcoded colors with token-based classes
2. Update button classes to use `.btn`, `.btn-accent`, `.btn-neutral`, etc.
3. Replace custom panel styles with `.panel` class
4. Update grid cells to use `.cell`, `.cell-filled`, `.cell-marked`, `.cell-empty`
5. Use Tailwind utilities for spacing instead of arbitrary values
6. Replace font families with `font-display`, `font-body`, `font-mono`

---

## Next Steps

- [ ] Create Storybook stories for all components
- [ ] Add animation examples
- [ ] Document responsive breakpoints
- [ ] Add accessibility guidelines
- [ ] Create component variants documentation

