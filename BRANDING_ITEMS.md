# YQL Design System — Branding Page To-Do

## Status key
- ✅ Done
- 🔄 In progress
- ✅ Not started

---

## FOUNDATION (above components)

| # | Section | Status | Notes |
|---|---------|--------|-------|
| 1 | Principles | ✅ | 4 design principles |
| 2 | **Logo & Brand Identity** | ✅ | Mark, lockup, clearspace, do/don't |
| 3 | Colors | ✅ | Blue scale, accents, neutrals, combos, opacity |
| 4 | Typography | ✅ | Space Grotesk + Inter, scale reference |
| 5 | **Iconography** | ✅ | Size scale, canonical icons per concept, aria rules |
| 6 | Spacing | ✅ | 4px grid, horizontal bar chart |
| 7 | Motif | ✅ | Corner system, shadow system |
| 8 | Motion | ✅ | Duration scale, easing, what to animate |

---

## LAYOUT (between foundation and components)

| # | Section | Status | Notes |
|---|---------|--------|-------|
| 9 | **Layout System** | ✅ | Breakpoints, sidebar widths, content area, z-index stack |

---

## COMPONENTS — Form Controls

| # | Section | Status | Notes |
|---|---------|--------|-------|
| 10 | Buttons | ✅ | All variants, table matrix, dark bg |
| 11 | **Forms** (expand Inputs) | ✅ | Input ✅ + Textarea, Select, Checkbox, Radio, Toggle/Switch |

---

## COMPONENTS — Display

| # | Section | Status | Notes |
|---|---------|--------|-------|
| 12 | Cards | ✅ | Card, DashboardCard, StatCard |
| 13 | Badges | ✅ | StatusBadge sm/md, trend badges |
| 14 | **Tables** | ✅ | Header, row, hover, sort, selection, compact vs default |
| 15 | **Progress** | ✅ | Linear bar, step indicator |
| 16 | Avatars | ✅ | Sizes, deterministic color, dark bg |

---

## COMPONENTS — Navigation

| # | Section | Status | Notes |
|---|---------|--------|-------|
| 17 | **Navigation / Sidebar** | ✅ | Structure, active/hover, section groups, mobile drawer |
| 18 | **Breadcrumbs** | ✅ | Simple, truncated, separator style |
| 19 | **Tabs** | ✅ | Underline tabs, pill tabs, active/inactive |
| 20 | **Pagination** | ✅ | Page chips, prev/next, ellipsis truncation |
| 21 | **Search** | ✅ | Composed search bar, result dropdown pattern |

---

## COMPONENTS — Overlays

| # | Section | Status | Notes |
|---|---------|--------|-------|
| 22 | **Modals & Drawers** | ✅ | Overlay, sizes, footer actions, right-side drawer |
| 23 | **Tooltips & Popovers** | ✅ | Dark tooltip, placement variants |
| 24 | **Toasts & Alerts** | ✅ | success/warning/error/info, with action, positioning |

---

## COMPONENTS — Structural

| # | Section | Status | Notes |
|---|---------|--------|-------|
| 25 | Page Headers | ✅ | card/ghost variants, lg/sm sizes |
| 26 | Empty States + Loading | ✅ | EmptyState, spinner, pulse; add Skeleton pattern |

---

## PATTERNS

| # | Section | Status | Notes |
|---|---------|--------|-------|
| 27 | **Chat System** | ✅ | Message bubbles, mention chips, reactions, polls, composer |
| 28 | **Copy & Content** | ✅ | Voice/tone, date formatting, error anatomy, truncation |

---

## Nav group structure (sticky header)

```
Foundation  Colors  Typography  Icons  Spacing  Motif  Motion
Layout
Buttons  Forms  Cards  Badges  Tables  Progress  Avatars
Nav  Breadcrumbs  Tabs  Pagination  Search
Modals  Tooltips  Toasts
Headers  Empty/Load
Chat  Copy
```

---

## Implementation order

1. Logo & Brand Identity → insert after Principles
2. Iconography → insert after Typography
3. Layout System → insert after Motion
4. Forms (expand) → replace Inputs section
5. Tables → insert after Badges
6. Progress → insert after Tables
7. Navigation/Sidebar → insert after Avatars section
8. Breadcrumbs, Tabs, Pagination, Search → after Navigation
9. Modals & Drawers → after Search
10. Tooltips & Popovers → after Modals
11. Toasts & Alerts → after Tooltips
12. Skeleton → expand existing Empty/Load section
13. Chat System → insert before footer
14. Copy & Content → insert before footer (after Chat)
15. Update NAV array with group labels
