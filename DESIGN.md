# YQL Platform Design System 🎨

This document outlines the design principles, color palettes, and structural guidelines for the YQL platform to ensure a consistent and premium user experience across all modules (Landing, Auth, Admissions, Recruitment, Operations, and Admin panels).

## 1. Core Principles

- **Unified Geometric Aesthetic:** The platform blends sharp, precise geometric shapes (e.g., solid drop shadows, distinct borders, alternating border-radii) with clean, open space to create a modern, slightly brutalist but premium look.
- **Vibrant & Distinct Colors:** Rely on the YQL brand palette (Fresh Blues, Sunshine Yellow, Alert Wine, Success Green). Deep Navy (`bg-brand-blueDark`) is our anchor color for text, borders, and dominant primary buttons.
- **Consistency is Key:** A card in the admin dashboard should feel like it belongs to the same universe as the login page or the hero section.

---

## 2. Color Palette

All colors are mapped in `index.css` under the `:root` pseudo-class and exposed via Tailwind classes (`bg-brand-*`, `text-brand-*`, `border-brand-*`).

### Primary Brand
- **Deep Ocean Blue / Navy (`--color-blue-dark`):** Primary text, strong borders, dark backgrounds.
- **Standard Blue (`--color-blue`):** Accents, hover states, active states.
- **Fresh Sky Blue (`--color-light-blue`):** Soft shapes, light highlights.

### Accents
- **Sunshine Yellow (`--color-yellow`):** Highlighting primary actions, geometric shapes, avatars.
- **Action Wine/Red (`--color-wine`):** Destructive actions, warnings, and attention grabbers.
- **Success Green (`--color-green`):** Validations, success states, active statuses.

### Neutrals
- **Background Light (`--color-bg-light`):** The standard background for the app and dashboards (often paired with a subtle geometric pattern).
- **White (`--color-bg`):** Core component surfaces (Cards, Inputs, Sidebar).

---

## 3. Typography

- **Headings (Display):** Use `font-display` (e.g., Space Grotesk or similar configured in tailwind matching the geometric vibe). Heavy weights (`font-bold`, `font-extrabold`).
- **Body Content:** Use `font-sans` (Inter/Outfit). High legibility for data-heavy dashboard tables. `text-brand-darkBlue` or `text-gray-900` for primary reading text, `text-gray-500` for secondary text.

---

## 4. UI Component Architecture

### The "Geometric" Element Style
Unlike softer SaaS products that rely entirely on blurred shadows and ultra-rounded corners (`rounded-2xl`), YQL uses:

1.  **Solid Drop Shadows:** Instead of a soft blur, components often use a hard offset shadow to pop off the page.
    *Example:* `shadow-[4px_4px_0px_0px_rgba(57,103,153,1)]`
2.  **Thick Borders:** Prominent borders (`border-2`, `border-4`) in `brand-blueDark` or `brand-gray` to define component edges clearly.
3.  **Unique Border Radii:** Buttons and key cards may use alternating radii to create a shape rather than a generic box.
    *Example:* `rounded-none`, or `rounded-tl-2xl rounded-br-2xl`.

### Buttons
Buttons must look tactile.
- **Primary:** `bg-brand-blueDark text-white border-2 border-brand-blueDark shadow-[4px_4px_0px...`
- **Secondary:** `bg-white text-brand-blueDark border-2 border-brand-blueDark`

### Cards & Surfaces (Dashboards)
Dashboard cards (KPIs, pipelines, lists) should adopt geometric aesthetics:
- **Base:** `bg-white`
- **Border:** `border-2 border-brand-blueDark` (or lighter gray if secondary)
- **Shadow:** Solid geometric drop shadows instead of soft blurred shadows.

---

## 5. Structural Layouts

### The Standard Sidebar
The sidebar is the primary navigation method for authenticated workspaces.
- Always pinned to the left on desktop, collapsible on mobile.
- **Header:** Contains the distinctive YQL logo icon and text.
- **Navigation Items:** Links use clear hover states. Active routes are highlighted prominently (e.g., geometric highlight or text/icon color shift).
- **Footer:** Contains the user profile pill and global actions (e.g., Sign Out).

### Page Content (Dashboards)
- **Header:** A clean, spacious header for the page title and primary page-level actions.
- **Content Area:** Placed on `bg-brand-bgLight` (or similar patterned background) so that the white geometric cards contrast strongly against the back.
- **Scrollbars:** Use the custom geometric scrollbar defined in `index.css`.
