# Hidden Grid — Visual Style Guide (Draft)

This guide establishes the visual identity for Hidden Grid and serves as the reference for all UI/UX work going forward. When updating or creating assets, align with the tokens, typography, and component guidelines below.

---

## 1. Brand Direction

| Attribute | Description |
|-----------|-------------|
| **Mood** | Smart • Confident • High-energy without being loud |
| **Keywords** | Grid • Ember • Precision • Momentum |
| **Visual Signature** | Glowing streak flame + crisp grid lines over soft gradients |

- **Primary themes** (ship with at least two):  
  - **Retro Ember** — OLED-friendly dark base, neon accents, pixelated textures  
  - **Zen Focus** — Lightweight light/neutral palette with soft gradients
- Extend with seasonal or premium themes once the system is stable.

---

## 2. Color Palette & Tokens

Define tokens in CSS variables / Tailwind config. All colors listed in hex; adjust for theme variants.

### Core Tokens

| Token | Default (dark) | Light Variant | Usage |
|-------|----------------|---------------|-------|
| `--color-bg` | `#0A101B` | `#F6F7FA` | App background |
| `--color-surface` | `#121B2A` | `#FFFFFF` | Panels, cards |
| `--color-surface-glass` | `rgba(18, 27, 42, 0.65)` | `rgba(255,255,255,0.7)` | Glassmorphism overlays |
| `--color-text-primary` | `#E9EEF7` | `#1E2A3A` | Main text |
| `--color-text-secondary` | `rgba(233,238,247,0.7)` | `rgba(30,42,58,0.6)` | Secondary text |
| `--color-grid-line` | `rgba(255,255,255,0.06)` | `rgba(0,0,0,0.08)` | Grid lines |
| `--color-primary` | `#FF7A45` | `#FF7A45` | Brand accent, streak flame |
| `--color-primary-soft` | `rgba(255,122,69,0.2)` | `rgba(255,122,69,0.15)` | Background glows |
| `--color-success` | `#3BD671` | `#2B9958` | Perfect row/col, success states |
| `--color-warning` | `#F9C947` | `#D5A526` | Streak warnings |
| `--color-danger` | `#EF4665` | `#B63048` | Mistakes, errors |
| `--color-info` | `#5BA9FF` | `#2E74D3` | Tooltips, hints |

### Gradients & Lighting

Use directional gradients for depth:
- `--gradient-surface`: `linear-gradient(160deg, rgba(12,18,29,0.95) 0%, rgba(20,30,45,0.75) 100%)`
- `--gradient-primary`: `linear-gradient(135deg, #FF7A45 0%, #FFBD5D 100%)`
- `--gradient-success`: `linear-gradient(135deg, #31D884 0%, #6BF15F 100%)`

Light theme uses softer gradients with sub-5% color shift.

---

## 3. Typography

| Role | Font | Weight | Size | Usage |
|------|------|--------|------|-------|
| Display | `Clash Display` (or `Inter Tight` fallback) | Semibold | 32–48px | “Hidden Grid”, section headers |
| Body | `Inter` | Regular & Medium | 14–16px | Primary copy |
| Labels | `Inter` | Medium | 12px uppercase | Buttons, chip labels |
| Mono | `JetBrains Mono` | Regular | 12–14px | Timers, seeds, pro metrics |

Typography rules:
- Line height 1.4–1.6 for body, 1.1 for display.
- Use uppercase + letter spacing `0.12em` for small labels (chips, toggles).
- Avoid mixing more than 2 font families per screen.

---

## 4. Iconography & Illustrations

- Icon set: rounded corners, 2px stroke, minimal fill.  
  E.g. toggles, flame, lightning, share, shield.
- Provide 24px default size with 16px / 32px variants.
- Streak icons should animate (flame flicker).
- Achievement & badge art: 3D-ish with gradients and subtle emboss.

Illustrations:
- Completion modal background — blurred gradient with particle burst.
- Streak milestone card — central flame icon with radiating rings.

---

## 5. Layout & Spacing

| Token | Value | Notes |
|-------|-------|-------|
| `--space-xs` | 4px | icon padding |
| `--space-sm` | 8px | chip spacing |
| `--space-md` | 16px | standard gap |
| `--space-lg` | 24px | panel padding |
| `--space-xl` | 32px | section separation |

- 12-column responsive grid (max width 1280px).
- Minimum horizontal padding: 24px on mobile, 48px on desktop.
- Use `clamp()` sizing for main headers: `clamp(28px, 2.7vw, 40px)`.

---

## 6. Core Components

### Buttons

| Variant | Style |
|---------|-------|
| Primary | Filled with `--gradient-primary`, 10px radius, soft shadow `0 12px 25px rgba(255,122,69,0.35)` |
| Secondary | Glass surface with border `1px solid rgba(255,255,255,0.08)` |
| Tertiary | Ghost button with accent text & highlight on hover |

States:
- Hover: increase brightness + slight rise `transform: translateY(-1px)`
- Active: compress `translateY(1px)` + reduce shadow
- Focus: 2px outer glow `rgba(255,122,69,0.6)`

### Panels & Cards

- Rounded corners: 18px
- Border: `1px solid rgba(255,255,255,0.06)`
- Shadow: `0 24px 50px rgba(8, 12, 20, 0.45)`
- Use glass background for secondary cards.

### Grid Cells

- Base size: 36px (mobile), 44px (desktop). 
- Border: `1px solid var(--color-grid-line)`
- Filled state: `background: var(--gradient-primary); color: var(--color-bg);`
- Marked (X) state: `background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.3)`
- Hover: highlight border + subtle inner glow
- Transition: `all 120ms ease`

---

## 7. Effects & Animations

- **Grid fill:** 150ms scale-in + glow fade (`box-shadow` pulse)
- **Row complete:** left-to-right shimmer gradient
- **Streak banner:** continuous low-key flame flicker; milestone triggers stronger pulse
- **Completion modal:** background blur + scale from 0.96 to 1 with easing `cubic-bezier(0.21, 0.98, 0.6, 1)`
- **Buttons:** use `transition: all 160ms ease;`

Respect `prefers-reduced-motion`: revert to opacity-only transitions.

---

## 8. Assets & Implementation

File structure suggestions:
```
src/
  assets/
    icons/
    illustrations/
    backgrounds/
  styles/
    tokens.css
    themes/
      dark.css
      light.css
```

- Export icons as SVG, embed with `currentColor`.
- Backgrounds: use optimized PNG/WebP (~200KB).
- If using Tailwind, extend theme with `colors`, `gradientColorStops`, `boxShadow`, `backdropBlur`.

---

## 9. Theme Support

Define theme classes (`.theme-retro`, `.theme-zen`):

**Retro Ember**  
- Background gradient from deep navy (#080C14) to charcoal (#121B2A).  
- Neon accents (#FF7A45, #5BA9FF).
- Pixelated background noise overlay at low opacity.

**Zen Focus**  
- Light neutral base (#F6F7FA) with subtle paper texture.  
- Accent green (#3BD671) and soft blue (#5BA9FF).  
- Use shadows in light mode to retain depth.

Theme switch updates CSS variables; component structure remains identical.

---

## 10. Accessibility

- Maintain 4.5:1 contrast for text (except muted meta text at >3:1).
- Ensure button/interactive focus states are visible in both themes.
- Always provide text alternatives for icon-only buttons.
- For color-coded statuses, add iconography or labels to support colorblind users.

---

## 11. Next Steps

- Build Figma library containing component variants using these tokens.
- Update global CSS / Tailwind config with tokens and themes.
- Refactor existing components (buttons, panels, grid cells, modals) to consume the style guide.
- Iterate with visibility tests (light vs dark theme, mobile vs desktop).
- Coordinate with sound design for synchronous cues (solve, streak, errors).

---

This document should evolve as new themes, features, and community feedback shape Hidden Grid. Keep it versioned and update tokens/components whenever the brand direction shifts. 

