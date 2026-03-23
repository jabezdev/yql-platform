# Redesign Audit: Aligning to the Branding Standard

This document identifies the biggest design mismatches between the `/branding` design system and the live pages (Landing, Dashboard, Chat), and describes what it would take to fix each one.

---

## The Standard (from `/branding`)

The branding page establishes these non-negotiable rules:

1. **Geometric corner motif** — ONLY `rounded-tl-*` + `rounded-br-*` (diagonal cuts). Never `rounded-*`, `rounded-lg`, or `rounded-full` on any brand surface.
2. **Isometric hover lift** — `hover:-translate-y-0.5 hover:-translate-x-0.5` together. Not `-translate-y` alone.
3. **Typography** — `font-display` (Space Grotesk) for all headings, labels, stats, and badges. `font-sans` (Inter) for body only.
4. **Buttons** — Use the `<Button>` component. No handrolled `<button>` elements for primary actions.
5. **Inputs** — Use the `<Input>` component or match its exact classes. `rounded-tl-lg rounded-br-lg`, `border-2 border-brand-blue/25`.
6. **Shadow direction** — Shadow offset matches hover translate direction (`4px 4px` → lifts `up-left`).

---

## Priority 1 — Geometric Corner Motif Violations

The most pervasive and visible mismatch. `rounded-full` and `rounded-lg` appear throughout all three pages where the design system forbids them.

### 1a. Landing — `HowItWorks.tsx` (line 55)

**Problem:** Step connector dots are `rounded-full` circles.

```tsx
// Current — violates geometric motif
<div className="w-12 h-12 bg-white rounded-full border-4 border-brand-blue ...">
```

**Fix:** Replace with a geometric shape. Either use a square with `rounded-tl-xl rounded-br-xl`, or replace the vertical-connecting-line layout entirely with a numbered badge using `font-display font-extrabold` inside a `rounded-tl-lg rounded-br-lg` container.

---

### 1b. Landing — `Apply.tsx` (line 38)

**Problem:** Application stage number circles are `rounded-full`.

```tsx
// Current — violates geometric motif
<div className="w-12 h-12 rounded-full bg-white border-4 border-brand-blue ...">
```

**Fix:** Same treatment as HowItWorks — replace with `rounded-tl-xl rounded-br-xl` square badges.

---

### 1c. Landing — Decorative corner blobs

**Files:** `About.tsx` (lines 45–46), `Commitment.tsx` (lines 45–46), `WhoCanApply.tsx` (lines 23, 37–38)

**Problem:** Decorative accent shapes inside dark blue cards use `rounded-bl-full`, `rounded-tr-full`, etc.

```tsx
// In About.tsx
<div className="absolute top-0 right-0 w-32 h-32 bg-brand-yellow/10 rounded-bl-full" />
<div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-tr-full" />
```

**Fix:** Replace with geometric insets. Use `rounded-tl-3xl rounded-br-3xl` clipped quadrant shapes, or remove them and use a YQL geometric pattern tile (e.g. `GeometricPattern` / `GeometricShapes`) at low opacity instead. The brand vocabulary does not include circular blobs.

---

### 1d. Chat — `ChatSidebar.tsx` (lines 43, 52)

**Problem:** Tab switcher buttons (`Channels` / `Direct`) use `rounded-lg`.

```tsx
// Current
className={`flex-1 text-xs font-bold py-1.5 rounded-lg transition-all ...`}
```

**Fix:** Change to `rounded-tl-lg rounded-br-lg` on both tab buttons.

---

### 1e. Chat — `ConversationHeader.tsx` (line 30, 83)

**Problem:** All icon buttons in the conversation header use `rounded-lg`.

```tsx
// Current
className={`p-2 rounded-lg transition-colors ...`}
```

**Fix:** Change to `rounded-tl-lg rounded-br-lg` on all icon action buttons.

---

### 1f. Chat — `MessageComposer.tsx` (line 187)

**Problem:** Composer toolbar buttons (Bold, Italic, Code, List, Attach, Emoji, Poll) use `rounded-lg`.

```tsx
// Current
const btnClass = (active = false) =>
  `p-1.5 rounded-lg transition-colors ...`
```

**Fix:** Change `rounded-lg` → `rounded-tl-lg rounded-br-lg`.

---

### 1g. Chat — `MessageItem.tsx` (line 180)

**Problem:** Emoji reaction pills use `rounded-full`.

```tsx
// Current
className={`flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs ...`}
```

**Fix:** Change to `rounded-tl-lg rounded-br-lg`. Reaction pills should look like compact geometric chips, not pills.

---

### 1h. Dashboard — `DashboardPage.tsx` — Inline form elements

**Problem:** Multiple handrolled form elements use `rounded-lg` instead of the geometric system:

- `PersonalToDoSection` input (line 64): `rounded-lg`
- `PersonalToDoSection` add button (line 67): `rounded-lg`
- `PersonalToDoSection` todo items (line 77): `rounded-lg`
- `AnnouncementsSection` "Manage" button (line 146): `rounded-lg`
- Announcement items (line 157): `rounded-lg`
- Announcement modal inputs (lines 178, 183): `rounded-lg`
- Task claim/drop/done buttons (lines 293, 298, 303): `rounded-lg`
- Task priority selector buttons (line 345): `rounded-lg`
- Task modal status `<select>` (line 368): `rounded`
- ManageModal close button (line 25): `rounded-lg`
- "Publish" button (line 190): `rounded-lg`
- "Create Task" button (line 351): `rounded-lg`

**Fix:** All of these need `rounded-tl-*` + `rounded-br-*` equivalents. Most can simply change `rounded-lg` → `rounded-tl-lg rounded-br-lg`. The `<select>` on line 368 needs `rounded-tl-lg rounded-br-lg`. Buttons should ideally use the `<Button>` component (see Priority 2).

---

## Priority 2 — Unregistered Buttons (Not Using `<Button>` Component)

The branding page defines a full button system. But across Dashboard and Chat, most action buttons are handrolled `<button>` elements with inconsistent styling. This is both a maintenance and consistency problem.

### 2a. Dashboard — Handrolled action buttons

**File:** `DashboardPage.tsx`

Every inner action button (Publish, Create Task, Take/Drop/Done task, Manage, add-todo) is a raw `<button>`. They use different hover effects, shadows, and border widths — none systematically matching the design system.

**Fix inventory:**
- "Publish announcement" → `<Button variant="primary" size="sm" fullWidth>`
- "Create Task" → `<Button variant="primary" size="sm" fullWidth>`
- "Manage" header button (announcements + tasks) → `<Button variant="ghost" size="sm">`
- "Take" / "Drop" / "Done" task buttons → `<Button variant="outline" size="sm">` or `ghost`
- "Add todo" submit button → `<Button variant="primary" size="sm">`
- ManageModal close button → `<Button variant="ghost" size="sm">` (or icon button pattern)

**Priority:** Medium. The current handrolled buttons look similar enough, but inconsistent details (shadow depth, border weight, hover offsets) break the visual coherence at close inspection.

---

### 2b. Chat — Handrolled action buttons

**File:** `ConversationHeader.tsx`, `MessageComposer.tsx`, `ChatSidebar.tsx`

Icon toolbar buttons are all raw `<button>` elements. The pattern is consistent within each file but doesn't use the design system's Button component.

**Note:** Icon-only toolbar buttons are a special case — the Button component doesn't currently have an icon-only variant. Before migrating, add an `icon` size/shape variant to `Button.tsx`, then update the chat toolbar buttons to use it.

---

## Priority 3 — Isometric Hover Lift Violations

The branding system specifies `hover:-translate-x-0.5 hover:-translate-y-0.5` (up and left together) for interactive cards. Several landing sections only translate on the Y axis.

### 3a. `Benefits.tsx` (line 25)

**Problem:** Cards only translate vertically.

```tsx
// Current
className="... hover:shadow-[6px_6px_0px_0px_...] hover:-translate-y-1 ..."
```

**Fix:** Change to `hover:-translate-y-0.5 hover:-translate-x-0.5` and keep the shadow depth consistent. The shadow offset should match the translate — `hover:shadow-[6px_6px_0px_...]` with `hover:-translate-y-0.5` is mismatched (too large a shadow for the lift amount). Either reduce shadow to `[4px_4px...]` or increase translate.

---

### 3b. `WhoCanApply.tsx` (line 22)

**Problem:** "We welcome" card has `hover:-translate-y-0.5` but missing `-translate-x-0.5`.

**Fix:** Add `hover:-translate-x-0.5` alongside the existing `-translate-y-0.5`.

---

### 3c. `Mission.tsx` (line 43) and `HowItWorks.tsx` (line 48)

**Problem:** Cards have `hover:-translate-y-0.5` only.

**Fix:** Add `hover:-translate-x-0.5`.

---

## Priority 4 — Typography Violations

### 4a. `Footer.tsx` (line 14)

**Problem:** The main footer heading is missing `font-display`.

```tsx
// Current
<h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight mb-2">
```

**Fix:**

```tsx
<h2 className="text-2xl md:text-3xl font-display font-extrabold text-white tracking-tight mb-2">
```

---

### 4b. `ConversationHeader.tsx` (line 50)

**Problem:** Channel name heading uses `font-bold` without `font-display`.

```tsx
// Current
<h2 className="text-sm font-bold text-brand-blue truncate">
```

**Fix:**

```tsx
<h2 className="text-sm font-display font-bold text-brand-blue truncate">
```

---

### 4c. `Commitment.tsx` (line 35)

**Problem:** Commitment item labels use `font-display` but only `font-bold` — should be `font-extrabold` per the heading hierarchy rule.

**Fix:** Change `font-bold` → `font-extrabold` on the label text.

---

## Priority 5 — Login Page (Clerk Component)

### 5a. `LoginPage.tsx` — Clerk card styling

**Problem:** The Clerk-rendered card uses `rounded-none` and `border-4` but doesn't apply the geometric motif on its outer wrapper. The outer `div` wrapping the Clerk component has no card-like treatment at all — the Clerk card floats without the platform's visual frame.

**Fix:** Wrap the Clerk `<SignIn>` in a container with `rounded-tl-2xl rounded-br-2xl border-2 border-brand-blue overflow-hidden shadow-[8px_8px_0px_0px_rgba(10,22,48,0.3)]`, and update the Clerk `appearance.elements.card` to remove its own shadow/border (let the wrapper handle it). Update `rounded-none` inside Clerk's `formButtonPrimary` to match a `rounded-tl-lg rounded-br-lg` equivalent.

---

## Summary Table

| Area | Issue | Files | Effort |
|------|-------|-------|--------|
| All pages | `rounded-lg` / `rounded-full` instead of geometric corners | `ChatSidebar`, `ConversationHeader`, `MessageComposer`, `MessageItem`, `DashboardPage`, `HowItWorks`, `Apply` | Medium — global find-replace per file |
| Landing | Decorative `rounded-*-full` blobs on dark cards | `About`, `Commitment`, `WhoCanApply` | Low — remove or swap to `GeometricPattern` |
| Landing | Only Y-axis hover lift (`-translate-y`) | `Benefits`, `WhoCanApply`, `Mission`, `HowItWorks` | Low — add `-translate-x-0.5` |
| Dashboard | Handrolled buttons not using `<Button>` | `DashboardPage` | Medium — refactor all inline buttons |
| Chat | No icon-only Button variant for toolbars | `Button.tsx` + chat files | Medium — new variant + migration |
| Footer | Missing `font-display` on heading | `Footer` | Trivial |
| Chat header | Missing `font-display` on channel name | `ConversationHeader` | Trivial |
| Login | Clerk card doesn't use geometric frame | `LoginPage` | Low |

---

## Implementation Order

1. **Global geometric corner sweep** (biggest visual impact) — Fix all `rounded-lg` / `rounded-full` to `rounded-tl-* rounded-br-*` across chat, dashboard, and landing. Do it file-by-file.

2. **Landing decorative blobs** — Replace circular overflow decorations with `GeometricShapes` or remove them.

3. **Hover lift direction** — Add `-translate-x-0.5` to all landing card hover states.

4. **Typography fixes** — Footer, ConversationHeader, Commitment label. All trivial.

5. **Button component migration** — Dashboard inline buttons → `<Button>` variants. Add icon-only variant to Button.tsx for chat toolbars.

6. **Login page Clerk wrapper** — Geometric card frame around the Clerk SignIn component.
