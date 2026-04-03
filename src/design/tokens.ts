/**
 * YQL Platform — Design Tokens
 *
 * Single source of truth for all brand values.
 * These values are mirrored in:
 *   - tailwind.config.js  (brand.* colors, font-display / font-sans)
 *   - src/index.css       (CSS custom properties)
 *   - src/components/ui/geometry/shape-utils.ts (BrandColors for SVG work)
 *
 * Usage:
 *   import { colors, radius, shadow, duration } from '@/design/tokens';
 */

// ── Colors ────────────────────────────────────────────────────────────────────

export const colors = {
  // 3-token blue scale
  darkBlue:  '#2f567f', // hover / press on blue surfaces
  blue:      '#396799', // PRIMARY — text, borders, active fills
  lightBlue: '#3d8ccb', // secondary — icons, links, subtle fills

  // Accent & semantic
  yellow: '#fed432', // primary accent / highlights (CTA on dark)
  red:    '#ef4444', // destructive actions
  wine:   '#bc594f', // form validation errors
  green:  '#10b981', // success indicators
  gray:   '#97abc4', // muted text / section labels

  // Surfaces
  white:   '#ffffff',
  bgLight: '#f5f6f8', // default page background
  
  // Functional (Mapped to custom properties in index.css)
  border:  'var(--color-border)',
  accent:  'var(--color-accent)',
} as const;

export type ColorToken = keyof typeof colors;

// ── Opacity scale (applied to brand.blue) ─────────────────────────────────────
//   Use as Tailwind modifiers: text-brand-blue/80, border-brand-blue/25, etc.

export const opacity = {
  primary:   100, // headings, labels
  body:       80, // body text (preferred)
  secondary:  70, // secondary text
  tertiary:   65, // metadata labels — minimum for readable text on white
  border:     25, // input borders
  cardBorder: 15, // card borders
  divider:    10, // dividers / subtle backgrounds
} as const;

// ── Semantic Tokens (Theme Aware) ─────────────────────────────────────────────

export const text = {
  primary:   'text-[var(--text-primary)]',
  secondary: 'text-[var(--text-secondary)]',
  muted:     'text-[var(--text-muted)]',
} as const;

export const surfaces = {
  bg:      'bg-[var(--color-bg)]',
  light:   'bg-[var(--color-bg-light)]',
  surface: 'bg-[var(--color-surface)]',
} as const;

// ── Geometric motif (asymmetric corner cuts) ──────────────────────────────────
//   Always round top-left + bottom-right; leave top-right + bottom-left square.

export const radius = {
  /** Inputs, avatars, small chips, nav hover states */
  sm:   'rounded-tl-lg rounded-br-lg',
  /** Buttons, small cards, active nav items */
  md:   'rounded-tl-xl rounded-br-xl',
  /** Dashboard cards, page headers */
  lg:   'rounded-tl-2xl rounded-br-2xl',
  /** Hero elements, large feature blocks */
  xl:   'rounded-tl-3xl rounded-br-3xl',
} as const;

export type RadiusToken = keyof typeof radius;

// ── Isometric shadow system ───────────────────────────────────────────────────
//   Shadows always offset down-right; hover lifts element up-left by the same amount.
//   Only interactive elements get shadows.

export const shadow = {
  /** Static cards — barely visible depth */
  subtle:  'shadow-[2px_2px_0px_0px_rgba(57,103,153,0.08)]',
  /** Interactive elements at rest */
  default: 'shadow-[4px_4px_0px_0px_rgba(57,103,153,0.15)]',
  /** Hover / lifted state */
  lifted:  'shadow-[6px_6px_0px_0px_rgba(57,103,153,0.15)]',
  /** Modals and drawers */
  modal:   'shadow-[6px_6px_0px_0px_rgba(10,22,48,0.25)]',
  /** Press / active state — no shadow */
  none:    'shadow-none',
} as const;

export type ShadowToken = keyof typeof shadow;

// ── Hover lift pattern (combine with shadow tokens) ───────────────────────────

export const lift = {
  /** Standard cards and buttons */
  sm: 'hover:-translate-y-[1px] hover:-translate-x-[1px]',
  /** Dashboard cards and larger interactive blocks */
  md: 'hover:-translate-y-[2px] hover:-translate-x-[2px]',
} as const;

// ── Transition durations ──────────────────────────────────────────────────────

export const duration = {
  /** Micro interactions: tooltip open, badge pop */
  micro:  'duration-75',
  /** Default: hover state, button press */
  fast:   'duration-150',
  /** Subtle enter: dropdown, popover */
  enter:  'duration-200',
  /** Layout shifts, slide-in panels */
  normal: 'duration-300',
  /** Full-page transitions (rare) */
  slow:   'duration-500',
} as const;

// ── Easing ────────────────────────────────────────────────────────────────────

export const easing = {
  in:     'ease-in',    // elements leaving
  out:    'ease-out',   // elements entering
  inOut:  'ease-in-out', // position transforms, lifts
  linear: 'linear',    // spinners and infinite loops only
} as const;

// ── Typography ────────────────────────────────────────────────────────────────

export const font = {
  /**
   * Space Grotesk — headings, labels, badges, stat values
   * Tailwind: font-display
   */
  display: 'font-display',
  /**
   * Inter — body copy, paragraphs, inputs
   * Tailwind: font-sans
   */
  sans: 'font-sans',
  /**
   * Monospace — code references only
   * Tailwind: font-mono
   */
  mono: 'font-mono',
} as const;

// ── Z-index stack ─────────────────────────────────────────────────────────────

export const zIndex = {
  base:    'z-0',
  elevated: 'z-10', // hover cards, popovers
  sticky:  'z-20',  // header / sidebar
  drawer:  'z-30',  // side panels
  modal:   'z-40',  // dialog + backdrop
  toast:   'z-50',  // always on top
} as const;

// ── Spacing reference ─────────────────────────────────────────────────────────
//   Base unit: 4px. Use as a mental model — prefer Tailwind classes directly.

export const spacing = {
  /** 12px — card padding (compact) */
  cardSm:  'p-3',
  /** 20px — card padding (standard) */
  card:    'p-5',
  /** 24px — card padding (spacious) */
  cardLg:  'p-6',
  /** 32px — section gap */
  section: 'mb-8',
  /** 80px — major section separation */
  page:    'mb-20',
} as const;

// ── Content width ─────────────────────────────────────────────────────────────

export const layout = {
  /** Wrap all page content in this */
  wrapper: 'max-w-6xl mx-auto px-4 sm:px-6',
} as const;

// ── Sidebar palette (Theme Aware) ──────────────────────────────────────────

export const sidebar = {
  bg:           'bg-brand-blue dark:bg-[var(--color-bg)]',
  itemBase:     'flex items-center gap-2.5 px-3 py-2 rounded-tl-lg rounded-br-lg transition-colors duration-150',
  itemDefault:  'text-white/65 dark:text-white/50 hover:bg-white/8 hover:text-white/85 dark:hover:text-white/90',
  itemActive:   'bg-white/15 dark:bg-white/10 border-l-2 border-brand-yellow text-white font-bold',
  itemDisabled: 'text-white/30 dark:text-white/20 pointer-events-none',
  iconDefault:  'text-white/55 dark:text-white/40',
  iconActive:   'text-brand-yellow',
} as const;
