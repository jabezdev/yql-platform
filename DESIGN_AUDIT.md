# YQL Platform — Design & UI/UX Audit

**Date:** 2026-03-22
**Scope:** Landing Page, Workspace/Dashboard, Chat
**Method:** Full source read of all TSX, CSS, and config files
**Last Updated:** 2026-03-22 — All C1–C7 resolved. 3-token blue system. ProfileCard/Editor rebranded. Ghost/card header rule established.

---

## Status Key

| Symbol | Meaning |
|---|---|
| ✅ | Fixed and verified in code |
| ⚠️ | Partially addressed — notes below |
| 🔲 | Open — not yet addressed |

---

## Executive Summary

The platform has a distinctive and coherent visual identity — the geometric corner-radius motif (`rounded-tl-*xl rounded-br-*xl`), the navy/blue/yellow brand palette, and the offset-shadow card system are applied consistently across most surfaces. The foundation is strong. The issues below are refinements, not rewrites.

The most impactful issues were: (1) a parallel "off-brand" component layer (`Card`, `EmptyState`, `StatusBadge`, `StatCard`) using raw Tailwind grays/emeralds, (2) dynamic class names in WeeklyHub that Tailwind cannot detect at build time, (3) `text-[9px]` / `text-[8px]` font sizes scattered across pages that are unreadable at screen resolution, and (4) interactive states in modals and loading screens that break out of the design language.

The critical and high-priority issues have been resolved. Medium-priority issues are mostly resolved. Several low-priority structural and accessibility improvements remain open.

---

## 1. Design System & Tokens

### 1.1 🔲 Two parallel CSS token systems — neither fully used
`src/index.css` defines a complete set of CSS custom properties (`--color-light-blue`, `--color-bg-light`, `--shadow-soft`, etc.) that are almost entirely **unused**. All actual color work is done through Tailwind brand tokens in `tailwind.config.js`. The two systems define different values for the same semantic concept (e.g., `--color-bg-light: #f0f9ff` vs `brand-bgLight: #f5f6f8`). This is dead code that creates confusion about what the "real" design token is.

**Impact:** Maintenance burden, no visual impact currently, but a source of future drift.

### 1.2 ✅ Raw Tailwind colors in core components
All raw Tailwind gray/emerald/red classes replaced with brand tokens across:

| Component | Status |
|---|---|
| `Card.tsx` | ✅ `border-brand-blueDark/15`, `bg-brand-bgLight`, geometric corners + offset shadow |
| `PageHeader.tsx` — `EmptyState` | ✅ Brand yellow bg, geometric motif, `font-display`, `font-extrabold` |
| `PageHeader.tsx` — `StatusBadge` | ✅ `brand-green`, `brand-yellow`, `brand-red`, `brand-blue`, `brand-bgLight` |
| `DashboardCard.tsx` — `StatCard` color variants | ✅ yellow/gray/green all use brand tokens |
| `DashboardCard.tsx` — trend badges | ✅ `brand-green/10`, `brand-red/10`, `brand-bgLight` |
| `MessageItem.tsx` — `ActionBtn` danger | ✅ `brand-wine/60`, `hover:bg-brand-wine/10`, `hover:text-brand-wine` |
| `WorkspaceLayout.tsx` | ✅ All `gray-*` replaced with `brand-*` tokens |

### 1.3 ✅ `Card.tsx` aligned to brand system
`Card.tsx` variants now use brand-token borders, `bg-brand-bgLight` for subtle variant, geometric `rounded-tl-xl rounded-br-xl` corners, and offset shadows consistent with `DashboardCard`. Interactive mode uses brand hover pattern with `translate` + shadow lift.

### 1.4 🔲 Unused CSS component classes
`index.css` defines `.btn-primary`, `.btn-secondary`, `.btn-wine`, `.card-minimal`, `.card-subtle` under `@layer components`. These are duplicates of `Button.tsx` and card components and are not used anywhere in the codebase. Dead CSS adds weight to the stylesheet.

### 1.5 ✅ `text-[9px]` and `text-[8px]` — below legibility threshold
All occurrences raised to `text-[10px]` minimum:

| File | Fixed |
|---|---|
| `WeeklyHubPage.tsx` — RSVP counts, review modal labels, status badge, hours | ✅ |
| `DirectoryPage.tsx` — placeholder, admin badge, role badge, pending badge | ✅ |
| `ChatSidebar.tsx` — DM unread count badge | ✅ |
| `VolunteerMatrixPage.tsx` — 6 occurrences | ✅ |
| `AboutPage.tsx` — Alumni label | ✅ |
| `MentionSuggestion.tsx` — mention dropdown avatar | ✅ |
| `GlobalCalendarPage.tsx` — type badges, event labels | ✅ |
| `AdminFormsPage.tsx` | ✅ |

### 1.6 ✅ `text-md` is not a valid Tailwind class
`LoginPage.tsx` line 24 fixed: `text-md` → `text-base`. Also fixed `text-green-600` → `text-brand-green` in the Clerk appearance overrides.

### 1.7 ✅ Global scrollbar is too large
`index.css` global `::-webkit-scrollbar` reduced from **10px** to **6px**. The `custom-scrollbar` utility (4px) remains for chat panels. The Tiptap placeholder color `#94a3b8` was also replaced with `rgba(10, 22, 48, 0.30)` to match brand conventions.

---

## 2. Landing Page

### 2.1 ✅ Navbar — logo link and scroll shadow
- Logo `href="#"` → `href="/"` — correct root navigation.
- Scroll shadow added via `useEffect` + `window.addEventListener('scroll')`. Shadow class `shadow-[0px_4px_0px_0px_rgba(57,103,153,0.12)]` is applied when `scrollY > 8px`.
- **Note:** Mobile menu hit target (bare icon, ~24px) remains below the 44×44px recommended minimum. 🔲

### 2.2 🔲 Hero — typographic hierarchy break
The hero has `<h1>Join our Team, Be a</h1>` at `text-3xl md:text-5xl` and `<h2>Young Quantum Leader</h2>` at `text-5xl md:text-7xl`. The `h2` is significantly larger than the `h1`. While the visual intent is clear, breaking heading hierarchy this way is semantically confusing for screen readers and SEO crawlers. The phrase also reads as an incomplete sentence due to the line break after "Be a."

### 2.3 ✅ About — right panel replaced
The empty decorative panel ("Build. Lead. Innovate." + corner blobs) was replaced with:
1. A dark `bg-brand-blueDark` card with headline and subtitle.
2. A stats row: "50+ Active Members", "6 Committees", "3+ Years Running" — each in a branded mini-stat card with an icon.

This converts dead whitespace into useful, scannable content.

### 2.4 🔲 Benefits — cards lack differentiation
All six benefit cards are visually identical with no body copy under the title. Nothing draws the eye to which benefit is most compelling. Adding 1–2 sentences of supporting copy per card would significantly improve scannability and content depth.

### 2.5 ✅ Mission grid — orphaned last row
Changed from `md:grid-cols-3` to `grid-cols-2 md:grid-cols-3 lg:grid-cols-5`. On large screens, all 5 items appear in a single balanced row. On medium screens, 3+2 layout with better proportions than before.

### 2.6 🔲 HowItWorks — alternating layout issues
The zigzag text alignment at intermediate breakpoints and the vertical connector/card collision on mobile are unresolved.

### 2.7 ✅ Apply — zero-indexed steps fixed
Step circles now display `{index + 1}` (1–5) instead of `{step.stage}` (0–4). First step reads "1", last reads "5". The CTA "Reach Stage 4" text still refers to the old numbering and should be updated to "Reach Stage 5" to stay consistent — but that is copy, not code.

### 2.8 ✅ WhoCanApply — emoji replaced
`👉` replaced with `<Sparkles size={24} className="text-brand-yellow" />` inside the existing styled container. Stays on-brand with the Lucide icon system used throughout the app.

### 2.9 ✅ Footer — undefined token and oversized logo
- `text-brand-blueLight/90` → `text-brand-lightBlue/90` (correct token name from `tailwind.config.js`).
- Logo `h-32` (128px) reduced to `h-16` (64px) — more appropriate for a footer context.

### 2.10 ✅ Three consecutive gray-background sections
Fixed by changing section variants:
- `Benefits.tsx` — removed `variant="gray"` → now white (was the middle of the three-gray block)
- `Commitment.tsx` — added `variant="gray"` → breaks the WhoCanApply+Commitment white-white pair

Final sequence: About(white) → Mission(gray) → Benefits(white) → HowItWorks(gray) → WhoCanApply(white) → Commitment(gray) → Apply(gray) → Footer(dark). Commitment and Apply are still consecutive gray, but the contrast shift into the dark footer provides a natural visual break.

### 2.11 🔲 No visual separation between sections
No decorative separators, geometric strips, or transitional elements between sections. Background alternation alone provides the section breaks. The geometric footer strip pattern could be reused here at reduced scale.

---

## 3. Workspace / Dashboard

### 3.1 ✅ Workspace loading screen is unbranded
Replaced plain `<div>Loading...</div>` with a branded spinner:
```tsx
<div className="w-12 h-12 border-4 border-brand-blueDark/15 border-t-brand-blueDark rounded-full animate-spin" />
<p className="text-xs font-extrabold uppercase tracking-widest text-brand-blueDark/40">Loading...</p>
```
Centered on `bg-brand-bgLight`, consistent with chat loading pattern.

### 3.2 ⚠️ WorkspaceLayout has its own `UserAvatar` — always yellow
The local `UserAvatar` in `WorkspaceLayout.tsx` still renders yellow initials fallback for all users — it does not use the chat `UserAvatar`'s deterministic color generation. The existing implementation now uses correct brand styling (`bg-brand-yellow border-2 border-brand-blueDark rounded-tl-xl rounded-br-xl`), so it is visually on-brand, but every user sees the same yellow avatar color in the sidebar. The chat system generates unique colors per user. If visual distinctiveness between users in the sidebar matters, migrate to the shared `UserAvatar` from `components/chat/shared/UserAvatar`.

### 3.3 🔲 Sidebar active state uses "pressed" styling as "selected"
Active nav items use `bg-brand-blueDark text-white -translate-y-[1px] shadow-[3px_3px_0px_0px_...]`. The `translate-y` + shadow combination is the app's press animation idiom. Using it as a persistent selected state makes active items always look mid-click. Consider `bg-brand-blueDark text-white` without the transform for persistent selection, reserving the shadow/translate for the hover state.

### 3.4 ✅ Sidebar hover uses raw `hover:bg-gray-50`
All `hover:bg-gray-50 rounded-lg` occurrences replaced with `hover:bg-brand-bgLight rounded-tl-lg rounded-br-lg` (brand token + geometric corners).

### 3.5 ✅ Sidebar section dividers use `border-gray-100`
All `border-gray-100` in `WorkspaceLayout.tsx` replaced with `border-brand-blueDark/10`. Also `bg-gray-50/50` → `bg-brand-bgLight/80` and `text-gray-900` → `text-brand-blueDark`.

### 3.6 ✅ `PageHeader` lg variant min-h reduced
`min-h-[160px]` → `min-h-[130px]` for `lg` variant. `min-h-[110px]` → `min-h-[96px]` for `sm` variant. Padding unchanged.

### 3.7 ✅ `WeeklyHubPage.tsx` — dynamic Tailwind classes fixed
Replaced all template literal class construction with an explicit lookup object:
```tsx
const activeClass = {
    yes:   "bg-brand-green/20 border-brand-green text-brand-blueDark",
    maybe: "bg-brand-yellow/20 border-brand-yellow text-brand-blueDark",
    no:    "bg-brand-red/20 border-brand-red text-brand-blueDark",
} as const;
```
Tailwind can now statically detect all three class sets at build time. RSVP selected state colors now compile and appear correctly.

### 3.8 ✅ `WeeklyHubPage.tsx` — `ManageModal` absolute → fixed
`absolute inset-0 z-50` → `fixed inset-0 z-50`. The modal now covers the full viewport including the sidebar.

### 3.9 ✅ `ResourceLibraryPage.tsx` — modal overlay absolute → fixed
Same fix: `absolute inset-0 z-50` → `fixed inset-0 z-50`.

### 3.10 ✅ `ResourceLibraryPage.tsx` — hover shadow opacity
Resource card hover shadow: `rgba(57,103,153,0.8)` → `rgba(57,103,153,0.25)`. Also added `hover:-translate-x-[2px]` to complete the brand's two-axis lift pattern. Tags changed from `rounded-full` → `rounded-sm` to match brand motif.

### 3.11 ✅ `AdminControlRoom` — inconsistent active tab color
Fixed: AdminControlRoom tabs now use `bg-brand-blueDark text-white` (matching chat sidebar). Container also changed from `rounded-xl` to `rounded-tl-xl rounded-br-xl`.

### 3.12 ✅ `DirectoryPage` — loading state fixed
`<div className="p-8 text-center text-gray-500">` replaced with branded spinner + tracking-widest label, matching the WorkspaceLayout loading pattern.

### 3.13 🔲 `DirectoryPage` — "The Network" vs "Directory" mismatch
Sidebar nav shows "Directory"; page heading shows "The Network." Users navigating via the sidebar will see the heading and wonder if they landed in the right place. Consider aligning the heading with the nav label, or making "The Network" the canonical name in both places.

### 3.14 ✅ `DashboardPage` — right column gap fixed
Right column `gap-8` → `gap-6`, matching the left column's `space-y-6`. Also updated `AdminStatsBar` stat cards to use `rounded-tl-xl rounded-br-xl shadow-[2px_2px_0px_0px_...]` and `rounded-tl-lg rounded-br-lg` icon boxes — consistent with brand motif.

### 3.15 🔲 Two `PageHeader` sizing modes with no usage guidance
`PageHeader` has variants `card`/`ghost` and sizes `lg`/`sm`, but most workspace pages override defaults with `!mb-0` or `className`. If every consumer overrides the same defaults, the defaults are wrong. Consider establishing a documented pattern or a workspace-specific `WorkspacePageHeader` wrapper with correct defaults built in.

---

## 4. Chat

### 4.1 ✅ Timestamp format inconsistency
Both grouped and non-grouped message timestamps now use `"h:mm a"` (12-hour with AM/PM):
- **Non-grouped** (header): was `"h:mm a"` — unchanged ✓
- **Grouped** (left gutter hover): was `"HH:mm"` → fixed to `"h:mm a"` ✓

### 4.2 ✅ `MessageItem` action toolbar — hardcoded role checks replaced
`user?.role === "T3" || user?.role === "T2" || user?.role === "T1" || user?.role === "Super Admin"` replaced with `isManager(user.role)` from `convex/roleHierarchy`. Both the "Move" button and the "Delete" button permission checks now use the helper.

### 4.3 ✅ `ActionBtn` danger uses brand tokens
`text-red-400 hover:bg-red-50 hover:text-red-600` → `text-brand-wine/60 hover:bg-brand-wine/10 hover:text-brand-wine`.

### 4.4 ✅ Mobile "···" button opacity raised
`text-brand-blueDark/20` → `text-brand-blueDark/40`. Contrast ratio improves from ~1.3:1 to approximately 2.5:1 against white. Still below WCAG 3:1 minimum for UI components — `/60` would be needed to fully pass, but `/40` is a meaningful improvement.

### 4.5 ✅ Chat sidebar `text-[9px]` on unread badge
`ChatSidebar.tsx` DM unread count badge: `text-[9px]` → `text-[10px]`.

### 4.6 🔲 `ConversationHeader` — member count not visible on mobile
"X members" is hidden on small screens with no fallback. Users on mobile cannot tell how many people are in a channel without opening the Members panel.

### 4.7 🔲 `ChatSidebar` — no empty state for channels
If no channels exist (e.g., fresh deployment), the channel list renders nothing with no explanation. An empty state prompting channel creation would improve the new-user experience.

### 4.8 🔲 `ConversationView` — new channel empty state is minimal
"No messages yet. Say something!" floats in a large empty area. A more intentional empty state with icon and channel name would feel more polished.

### 4.9 🔲 Right panels — no uniform empty state pattern
Each right panel (Thread, Pinned, Bookmarks) has its own empty state design. There is no shared empty state component used consistently across all three.

### 4.10 🔲 `MessageComposer` — formatting toolbar no labels on mobile
Formatting toolbar icons use `title=""` tooltips (desktop hover only). On mobile, `ImagePlus`, `Smile`, and `BarChart2` (poll) icons are not self-evident without labels or a discoverable affordance.

### 4.11 🔲 `EmojiPicker` — can clip off-screen
The picker opens `bottom-full mb-1` (above the toolbar). Near the top of a long channel, the picker opens upward and clips against the viewport edge. No boundary detection is implemented.

---

## 5. Shared Components

### 5.1 ✅ `PageHeader.tsx` — `EmptyState` is on-brand
Replaced with:
```tsx
<div className="w-16 h-16 bg-brand-yellow/20 border-2 border-brand-blueDark/15 rounded-tl-2xl rounded-br-2xl ...">
    <Icon size={28} className="text-brand-blueDark/50" />
</div>
<h3 className="text-lg font-display font-extrabold text-brand-blueDark mb-1">{title}</h3>
<p className="text-sm font-medium text-brand-blueDark/50 ...">{description}</p>
```
Uses geometric motif, brand colors, and `font-display` for the title.

### 5.2 ✅ `Input.tsx` — focus visibility restored
`focus:ring-0` replaced with a focus shadow that provides visible feedback:
- Normal: `focus:border-brand-blue focus:shadow-[0_0_0_3px_rgba(57,103,153,0.12)]`
- Error: `focus:border-brand-wine shadow-[0_0_0_3px_rgba(153,57,57,0.12)]`
Also fixed: icon color `text-gray-400` → `text-brand-blueDark/40`, placeholder `placeholder-gray-400` → `placeholder:text-brand-blueDark/30`, disabled `bg-gray-50` → `bg-brand-bgLight`, corners `rounded-lg` → `rounded-tl-lg rounded-br-lg`.

### 5.3 ⚠️ `Input.tsx` — error state uses `brand-wine` not `brand-red`
The error border remains `border-brand-wine` (`#bc594f`). The audit recommended `brand-red` (`#ef4444`) for maximum clarity. This was not changed because the required-field asterisk `*` also uses `text-brand-wine`, so keeping wine for error states maintains internal form consistency. If this is revisited, both the `*` and error states should be changed together to `brand-red`.

### 5.4 🔲 `ProfileSlideover` — renders in three separate places
`ChatLayout.tsx`, `WorkspaceLayout.tsx`, and `DirectoryPage.tsx` each render their own `ProfileSlideover` instance. This is architecturally fine (separate controlled state), but worth centralizing into a layout-level context if the pattern grows.

### 5.5 🔲 `RoleGuard` — no visual "access denied" for direct URL access
Locked sidebar items show a lock icon at 40% opacity. But direct URL navigation to a restricted route renders `RoleGuard`'s `fallback` (defaults to blank div). No redirect to `/dashboard/unauthorized` or visible "access denied" message.

---

## 6. Accessibility & Usability

### 6.1 🔲 No `focus-visible` states on interactive elements
The app uses `hover:` states extensively but almost no `focus-visible:` states. For keyboard users, buttons, nav links, and custom interactive elements have no reliable visible focus ring. Should add `focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:outline-none` to the base `Button` component and nav links.

### 6.2 🔲 Modals — no focus trap
None of the modal implementations implement a focus trap. Keyboard users can tab through background content while a modal is open. A focus trap library or `inert` on the background content is needed.

### 6.3 🔲 Modals — no `aria-modal` or `role="dialog"`
Modal divs are plain `<div>` elements. Screen readers won't announce them as dialogs. Should have `role="dialog" aria-modal="true" aria-labelledby="..."`.

### 6.4 🔲 Confirm dialogs use `window.confirm()`
`MessageItem.tsx` and `DashboardPage.tsx` use browser `confirm()` for destructive confirmations. These cannot be styled, look untrustworthy, and are blocked in some embedded contexts. Should be replaced with in-UI confirmation dialogs.

### 6.5 🔲 Color contrast — muted text at `/30` and `/35` opacity
`text-brand-blueDark/35` and `/30` on white backgrounds renders at approximately 1.5:1 contrast — far below the WCAG AA minimum of 4.5:1 for normal text. Specific occurrences: message timestamps, metadata labels, section subheadings. Minimum should be `/60` (~2.5:1) but `/70` or `/80` is needed for full compliance.

### 6.6 🔲 Locked nav items — no explanatory `aria-disabled` tooltip
Lock icon communicates restriction but `aria-disabled="true"` and a tooltip explaining the minimum role required would improve accessibility.

### 6.7 ✅ Images missing `loading="lazy"` in Directory
`DirectoryPage.tsx` member profile chip images now have `loading="lazy"`. Images load on demand as the user scrolls, rather than all at once.

---

## 7. Responsive & Mobile

### 7.1 🔲 Dashboard page has no mobile layout
`DashboardPage.tsx` stacks into three fixed-height scroll panels on mobile. Multiple simultaneous scroll contexts on a phone creates a confusing UX. A tab or accordion pattern is likely needed for small screens.

### 7.2 🔲 Mobile header vs desktop sidebar height mismatch
Mobile header is `h-16`; desktop sidebar header is `h-20`. The logo renders visually smaller on mobile. Minor inconsistency.

### 7.3 🔲 `WeeklyHubPage` right column cramped on medium screens
`lg:grid-cols-[0.7fr_0.3fr]` — the 30% column is approximately 200px on a 1024px viewport, forcing the RSVP section, location, join link, and 3 buttons to compete for very narrow space.

### 7.4 🔲 Chat layout tight on iPad-size screens
At `lg` (1024px), the sidebar (288px) + right panel (320px) leaves 416px for the conversation. This is workable but tight, and the collapse toggle may not be available at this breakpoint boundary.

---

## 8. Typography

### 8.1 🔲 Heading hierarchy inverted on Hero
Covered in §2.2. `h2` is visually 40% larger than `h1`.

### 8.2 ✅ `StatCard` value font weight fixed
`StatCard` stat value `p` tag now uses `font-display font-extrabold` (matching all other dashboard card values). Previously used implicit `font-bold`.

### 8.3 ⚠️ `font-display` not applied consistently to all headings
`PageHeader.tsx` `EmptyState` `h3` now uses `font-display font-extrabold` ✅. `DashboardCard.tsx` `StatCard` value now uses `font-display font-extrabold` ✅. However, markdown content rendered via `ReactMarkdown` inside `.prose-custom` will use Inter (body font) for headings — `font-display` cannot be injected via Tailwind's prose class system without a custom rehype plugin.

### 8.4 ✅ `.prose-custom` leading too tight
`index.css`: `.prose-custom` base changed from `leading-tight` to `leading-relaxed`. `.prose-custom li` also changed from `leading-tight` to `leading-relaxed`. Weekly summary text and other rich-text content now has appropriate line height for reading.

---

## 9. Interaction Design

### 9.1 🔲 Geometric button shadow direction inconsistency
`WorkspaceLayout` nav items use `shadow-[3px_3px_0px_0px_...]` with only `-translate-y-[1px]` (up-only lift). Missing the `-translate-x` component means the shadow goes down-right but the item only lifts upward — they don't match. All other interactive brand elements use both X and Y translate to match the shadow direction.

### 9.2 ✅ `DashboardCard` — `static` variant added
A new `static` variant was added to `DashboardCard` for non-interactive containers:
```tsx
static: 'shadow-[4px_4px_0px_0px_rgba(57,103,153,0.12)]',
```
No hover animation. Use `variant="static"` on cards that are not clickable to avoid implying interactivity.

### 9.3 🔲 No page transitions
Route changes are instant. A simple `opacity-0 → opacity-100` fade on route change (via a wrapper around `<Outlet />`) would improve perceived polish significantly.

### 9.4 🔲 Toast notification positioning
`ToastProvider.tsx` positioning should be verified as `fixed bottom-4 right-4` at `z-50+` to avoid being covered by fixed mobile composer bars or other overlays.

---

## 11. Issues Identified During Showcase Build

### 11.1 ✅ `PageHeader` hardcodes `mb-8` — forces `!mb-0` overrides at call sites
`PageHeader.tsx` line 43 includes `mb-8` directly in the container class. Every page that wants different spacing must use `className="!mb-0"` with a Tailwind `!important` override. The default should be `mb-0` (or no margin), letting each call site opt into spacing with `className="mb-8"` when needed. This removes the reliance on `!` important and makes the component composable.

**Files affected:** All pages using `<PageHeader>` with `!mb-0`

### 11.2 ✅ `SectionTitle.tsx` — `accentColor="blue"` uses raw `text-blue-600`
`SectionTitle.tsx` line 30: `accentColor === 'blue'` renders `text-blue-600` — a raw Tailwind class. Should be `text-brand-blue`. The `gray` branch also uses `text-gray-500` → should be `text-brand-gray` or `text-brand-blueDark/50`.

### 11.3 ✅ `DashboardSectionTitle` border uses `border-brand-blueDark` (full opacity)
`DashboardCard.tsx` line 130: `DashboardSectionTitle` uses `border-b-2 border-brand-blueDark` — full-opacity border. All other internal dividers in the system use `/10` or `/15` opacity. This creates a heavy visual separator compared to the lighter motif used elsewhere.

### 11.4 ✅ `StatCard` icon box uses `rounded-xl` — breaks geometric motif
`DashboardCard.tsx` line 96: `<div className={"p-3 rounded-xl ...">` — standard round corners. Every other icon container in the system uses `rounded-tl-lg rounded-br-lg` or `rounded-tl-xl rounded-br-xl`. Should be `rounded-tl-xl rounded-br-xl`.

### 11.5 ✅ `Button` `secondary` variant uses `hover:bg-gray-50`
`Button.tsx` line 32: `secondary` variant includes `hover:bg-gray-50` — raw Tailwind color. Should be `hover:bg-brand-bgLight` to stay on-brand.

---

## 10. Priority Matrix

| Priority | Issue | File(s) | Status |
|---|---|---|---|
| **Critical** | WeeklyHub RSVP dynamic Tailwind classes | `WeeklyHubPage.tsx` | ✅ Fixed |
| **Critical** | `absolute` modals don't cover viewport | `WeeklyHubPage.tsx`, `ResourceLibraryPage.tsx` | ✅ Fixed |
| **Critical** | `text-[9px]`/`text-[8px]` below readability threshold | 8 files | ✅ Fixed |
| **High** | Raw Tailwind colors in core shared components | `Card.tsx`, `PageHeader.tsx`, `DashboardCard.tsx`, `MessageItem.tsx`, `WorkspaceLayout.tsx` | ✅ Fixed |
| **High** | `EmptyState` completely off-brand | `PageHeader.tsx` | ✅ Fixed |
| **High** | Workspace loading screen unbranded | `WorkspaceLayout.tsx` | ✅ Fixed |
| **High** | `text-md` invalid class + Clerk `text-green-600` | `LoginPage.tsx` | ✅ Fixed |
| **High** | Local `UserAvatar` always yellow in sidebar | `WorkspaceLayout.tsx` | ✅ Fixed — migrated to shared UserAvatar (deterministic color) |
| **High** | Footer undefined token `text-brand-blueLight` | `Footer.tsx` | ✅ Fixed |
| **High** | `focus:ring-0` kills keyboard focus visibility | `Input.tsx` | ✅ Fixed |
| **Medium** | Timestamp inconsistency (12h vs 24h) in MessageItem | `MessageItem.tsx` | ✅ Fixed |
| **Medium** | Hardcoded role checks in `MessageItem` | `MessageItem.tsx` | ✅ Fixed |
| **Medium** | Mobile ··· button barely visible (20% opacity) | `MessageItem.tsx` | ✅ Fixed → /40 |
| **Medium** | `ResourceLibraryPage` hover shadow too dark (0.8 alpha) | `ResourceLibraryPage.tsx` | ✅ Fixed → 0.25 |
| **Medium** | Right column gap inconsistency in Dashboard | `DashboardPage.tsx` | ✅ Fixed |
| **Medium** | Sidebar active state uses "pressed" visual | `WorkspaceLayout.tsx` | ✅ Fixed — flat fill, no translate on selected |
| **Medium** | Three consecutive gray landing sections | `LandingPage.tsx` | ✅ Fixed |
| **Medium** | `PageHeader` lg variant min-h too large | `PageHeader.tsx` | ✅ Fixed → 130px |
| **Medium** | `window.confirm()` for destructive actions | `MessageItem.tsx`, `DashboardPage.tsx` | 🔲 Open |
| **Medium** | Input error uses `brand-wine` not `brand-red` | `Input.tsx` | ✅ Fixed — error now uses brand-red, asterisk also brand-red |
| **Low** | No scroll state on landing navbar | `Navbar.tsx` | ✅ Fixed |
| **Low** | Hero logo `href="#"` not `href="/"` | `Navbar.tsx` | ✅ Fixed |
| **Low** | Apply section zero-indexed step numbers | `Apply.tsx` | ✅ Fixed → 1-indexed |
| **Low** | WhoCanApply emoji in formal design context | `WhoCanApply.tsx` | ✅ Fixed → Sparkles icon |
| **Low** | About section decorative right panel | `About.tsx` | ✅ Fixed → stats + dark CTA card |
| **Low** | Benefits cards need body copy | `Benefits.tsx` | 🔲 Open |
| **Low** | Mission 5-item 3-col grid orphan | `Mission.tsx` | ✅ Fixed → lg:grid-cols-5 |
| **Low** | `.prose-custom leading-tight` too dense | `index.css` | ✅ Fixed → leading-relaxed |
| **Low** | `DashboardCard` hover lift on non-interactive cards | `DashboardCard.tsx` | ✅ Fixed → `static` variant added |
| **Low** | Global scrollbar 10px — too wide | `index.css` | ✅ Fixed → 6px |
| **Low** | `images` missing `loading="lazy"` in Directory | `DirectoryPage.tsx` | ✅ Fixed |
| **Low** | No `aria-modal`/`role="dialog"` on modals | All modal implementations | 🔲 Open |
| **Low** | No focus traps in modals | All modal implementations | 🔲 Open |
| **Low** | Unused CSS classes (btn-*, card-*) | `index.css` | 🔲 Open |
| **Low** | Unused CSS variable system | `index.css` | 🔲 Open |
| **Low** | `PageHeader` hardcodes `mb-8`, forces `!mb-0` overrides | `PageHeader.tsx` | 🔲 Open |
| **Low** | `SectionTitle` accent colors use raw Tailwind (`text-blue-600`, `text-gray-500`) | `SectionTitle.tsx` | ✅ Fixed |
| **Low** | `DashboardSectionTitle` border is full-opacity (`border-brand-blueDark`) | `DashboardCard.tsx` | ✅ Fixed → `/15` |
| **Low** | `StatCard` icon box uses `rounded-xl` not geometric motif | `DashboardCard.tsx` | ✅ Fixed → `rounded-tl-xl rounded-br-xl` |
| **Low** | `Button` secondary variant uses `hover:bg-gray-50` not brand token | `Button.tsx` | ✅ Fixed → `hover:bg-brand-bgLight` |
| **Low** | `Button` disabled state has no visual indicator | `Button.tsx` | ✅ Fixed → `disabled:opacity-40 disabled:cursor-not-allowed` |
| **Low** | `AdminControlRoom` tab container uses `rounded-xl` not geometric | `AdminControlRoom.tsx` | ✅ Fixed → `rounded-tl-xl rounded-br-xl` |

---

## 12. Decisions Required (Surfaced in Showcase Pass 2)

These are not bugs — they are open architectural/design decisions visible at `/branding` under "Open Conflicts". Each requires a choice before the codebase can be fully standardized.

### 12.1 ✅ [C1] Blue token consolidation — dropped to 3 tokens
`brand-blue` (#3d8ccb) and `brand-lightBlue` (#3986c0) are visually indistinguishable. `brand-blueDark` (#396799) and `brand-darkBlue` (#2f567f) are confusingly named. **Option A:** rename all 4 by role. **Option B:** consolidate to 3 tokens.

### 12.2 ✅ [C2] `rounded-full` on notification badges and reaction pills
Used in: `ChatSidebar.tsx` (unread badge), `UnreadBadge.tsx`, `MessageItem.tsx` (reactions). These break the geometric motif. **Option A:** keep rounded-full for small circular indicators. **Option B:** use `rounded-tl-md rounded-br-md` everywhere.

### 12.3 ✅ [C3] ProfileCard and ProfileEditor — entirely unbranded
`ProfileCard.tsx` and `ProfileEditor.tsx` use `gray-*` Tailwind classes throughout, no brand tokens, `rounded-2xl` instead of geometric corners, and `bg-gray-900` for buttons. Needs full rebrand or brand token pass.

### 12.4 ✅ [C4] Card.tsx vs DashboardCard.tsx — no documented usage rule
No rule specifies when to use `Card` (landing/directory) vs `DashboardCard` (workspace). Some workspace pages use both. **Option:** document strict context split (Card = landing+directory, DashboardCard = /dashboard/* only) and enforce in a codebase pass.

### 12.5 ✅ [C5] brand-wine vs brand-red — overlapping danger contexts
Both tokens appear in "danger" contexts with no clear rule. **Proposed:** wine = destructive buttons only, red = form validation only.

### 12.6 ✅ [C6] Sidebar `border-r-4` vs cards `border-2`
Desktop and mobile sidebars use `border-r-4 border-brand-blueDark` (4px full-opacity). All cards use `border-2`. Is the heavier sidebar border intentional for visual weight, or an oversight?

### 12.7 ✅ [C7] PageHeader `ghost` variant — no current workspace usage
`ghost` variant is defined and shown in the showcase but not used by any workspace page. Either document a use case or remove to simplify the API.

---

## Summary Counts

| Status | Count |
|---|---|
| ✅ Fixed | 40 |
| ⚠️ Partial | 1 |
| 🔲 Open (decisions) | 23 |
| **Total** | **64** |

### Remaining open items by category
- **Landing:** 2.2 (hero h1/h2 hierarchy), 2.4 (benefits copy), 2.6 (HowItWorks zigzag), 2.11 (section separators)
- **Workspace:** 3.13 (page title mismatch), 3.15 (PageHeader guidance)
- **Chat:** 4.6–4.11 (member count, empty states, emoji picker clipping, mobile labels)
- **Accessibility:** 6.1–6.6 (focus-visible, focus traps, ARIA, window.confirm, contrast)
- **Responsive:** 7.1–7.4 (mobile dashboard layout, height mismatches, chat iPad layout)
- **Interaction:** 9.3 (page transitions), 9.4 (toast position)
- **Decisions (showcase C1–C7):** blue token consolidation, rounded-full indicators, ProfileCard rebrand, Card vs DashboardCard rule, wine vs red split, sidebar border weight, ghost PageHeader usage

---

*End of audit. Total issues tracked: 64. Fixed: 40. Partial: 1. Open/decisions: 23.*
