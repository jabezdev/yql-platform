# YQL Platform — Design System

> **Live reference:** run the app and visit `/branding` to see every token, component, and pattern rendered in context.

---

## Quick start

Everything you need is available from one import:

```ts
import { Button, Card, Input, tokens } from '@/design';
```

`@/design` re-exports all UI components **and** the typed `tokens` namespace, so there is no need to hunt down individual file paths.

---

## Token reference

`tokens` is imported from `@/design` and contains every design constant as a typed object.

```ts
import { tokens } from '@/design';

// colors
tokens.colors.blue       // '#396799' — primary
tokens.colors.lightBlue  // '#3d8ccb' — icons, links
tokens.colors.yellow     // '#fed432' — accent / CTA on dark

// geometric radius (always asymmetric tl/br)
tokens.radius.sm   // 'rounded-tl-lg rounded-br-lg'
tokens.radius.md   // 'rounded-tl-xl rounded-br-xl'
tokens.radius.lg   // 'rounded-tl-2xl rounded-br-2xl'

// isometric shadows
tokens.shadow.subtle   // static cards
tokens.shadow.default  // interactive at rest
tokens.shadow.lifted   // hover state

// motion
tokens.duration.fast   // 'duration-150'  (default)
tokens.duration.normal // 'duration-300'

// layout
tokens.layout.wrapper  // 'max-w-6xl mx-auto px-4 sm:px-6'
```

Use these when building custom components so values never drift from the source of truth. For standard components, prefer the pre-built components below.

---

## Tailwind classes (the fast path)

Most design work uses Tailwind classes directly. The brand palette is registered under the `brand.*` namespace:

| Token | Class | Value |
|---|---|---|
| Primary blue | `text-brand-blue` / `bg-brand-blue` / `border-brand-blue` | `#396799` |
| Dark blue | `text-brand-darkBlue` | `#2f567f` |
| Light blue | `text-brand-lightBlue` | `#3d8ccb` |
| Yellow accent | `bg-brand-yellow` | `#fed432` |
| Wine (form errors) | `border-brand-wine` | `#bc594f` |
| Red (destructive) | `bg-brand-red` | `#ef4444` |
| Green (success) | `text-brand-green` | `#10b981` |
| Gray (muted) | `text-brand-gray` | `#97abc4` |
| Page background | `bg-brand-bgLight` | `#f5f6f8` |

Opacity is applied with Tailwind's `/` modifier: `text-brand-blue/70`, `border-brand-blue/25`, etc.

### Opacity scale

| Level | Modifier | Use |
|---|---|---|
| 100% | (none) | Headings, labels |
| 80% | `/80` | Body text (preferred) |
| 70% | `/70` | Secondary text |
| 55% | `/55` | Metadata — minimum readable on white |
| 25% | `/25` | Input borders |
| 15% | `/15` | Card borders |
| 10% | `/10` | Dividers, subtle backgrounds |

### Fonts

| Use | Class | Typeface |
|---|---|---|
| Headings, labels, badges, stats | `font-display` | Space Grotesk |
| Body, paragraphs, inputs | `font-sans` | Inter |
| Code | `font-mono` | System mono |

---

## Geometric motif

The brand signature is **asymmetric corner cuts**: top-left and bottom-right are rounded; top-right and bottom-left stay square.

| Context | Class |
|---|---|
| Inputs, avatars, chips, nav hover | `rounded-tl-lg rounded-br-lg` |
| Buttons, small cards, active nav | `rounded-tl-xl rounded-br-xl` |
| Dashboard cards, page headers | `rounded-tl-2xl rounded-br-2xl` |
| Hero elements, large features | `rounded-tl-3xl rounded-br-3xl` |

Never use symmetric `rounded-*` classes on interactive or brand-facing elements.

---

## Shadow system

Shadows are isometric (offset down-right) and belong only on **interactive** elements. Static elements have no shadow.

```
at rest  →  shadow-[4px_4px_0px_0px_rgba(57,103,153,0.15)]
hover    →  shadow-[6px_6px_0px_0px_rgba(57,103,153,0.15)]  +  -translate-y-[2px] -translate-x-[2px]
press    →  shadow-none  +  translate-y-[4px] translate-x-[4px]
```

Use `tokens.shadow.*` for the string values, or copy the pre-built `Button` / `Card` / `DashboardCard` components which already encode the full lift pattern.

---

## Components

All components are exported from `@/design`. Import what you need:

```ts
import {
  // Primitives
  Button, Card, Input,
  // Page structure
  PageHeader, DashboardPage, EmptyState, StatusBadge,
  // Dashboard
  DashboardCard, InfoCard, DashboardSectionTitle,
  // Forms
  DateInput, TimeInput, DateTimeInput, DateRangeInput, TimeSlotPicker,
  // Layout
  Container, Section,
  // Auth
  RoleGuard,
} from '@/design';
```

### Button

```tsx
// Workspace actions
<Button variant="primary">Save</Button>
<Button variant="secondary">Cancel</Button>
<Button variant="ghost">Learn more</Button>
<Button variant="outline">Filter</Button>
<Button variant="destructive">Delete</Button>

// Landing page CTAs (larger, stronger shadow)
<Button variant="geometric-primary" size="lg">Get started</Button>
<Button variant="geometric-secondary" size="lg">Learn more</Button>

// Sizes: sm | md (default) | lg
// As link: <Button as="a" href="/path">Go</Button>
// Full width: <Button fullWidth>Submit</Button>
```

### Card

```tsx
<Card variant="minimal">...</Card>      // white, subtle border + shadow
<Card variant="subtle">...</Card>       // bgLight, thin border, no shadow
<Card variant="bordered">...</Card>     // white, full border weight, deeper shadow
<Card variant="minimal" interactive>... // hover lift effect
```

### Input

```tsx
<Input label="Email" type="email" required />
<Input label="Search" icon={Search} placeholder="Find..." />
<Input label="Password" error="Password is required" />
```

### PageHeader

```tsx
// Full page title (most pages)
<PageHeader
  title="Members"
  subtitle="Manage your team roster"
  action={<Button>Invite</Button>}
/>

// Compact (filter-heavy pages)
<PageHeader title="Events" variant="card" size="sm" />

// Inline heading (no card chrome)
<PageHeader title="Settings" variant="ghost" />
```

### DashboardCard

```tsx
<DashboardCard>...</DashboardCard>
<DashboardCard variant="static" noPadding>...</DashboardCard>

<InfoCard
  icon={Users}
  label="Total members"
  value={42}
  trend={{ direction: 'up', value: '+12%' }}
/>
```

### StatusBadge

```tsx
<StatusBadge status="Active" variant="success" />
<StatusBadge status="Pending" variant="warning" />
<StatusBadge status="Archived" variant="neutral" size="md" />
```

### EmptyState

```tsx
<EmptyState
  icon={FolderOpen}
  title="No documents yet"
  description="Upload your first document to get started."
  action={<Button>Upload</Button>}
/>
```

### Avatar

```tsx
// Initials (deterministic brand colour from name)
<Avatar name="Jamie Chen" size="md" />
<Avatar name="Alex Rivera" size="lg" border />

// With photo
<Avatar name="Sam Park" photoUrl="/photos/sam.jpg" size="sm" />

// Sizes: xs | sm | md (default) | lg
// border: adds white ring — use when overlapping a banner or another avatar

// Stack of avatars with +N overflow
<AvatarStack people={members} max={4} size="sm" />
```

### Tabs

```tsx
const [tab, setTab] = useState('overview');

// Underline variant (default — page-level navigation)
<Tabs value={tab} onValueChange={setTab}>
  <TabsList>
    <TabsTrigger value="overview">Overview</TabsTrigger>
    <TabsTrigger value="members">Members</TabsTrigger>
    <TabsTrigger value="settings" disabled>Settings</TabsTrigger>
  </TabsList>
  <TabsContent value="overview">…</TabsContent>
  <TabsContent value="members">…</TabsContent>
</Tabs>

// Pill variant (filter bars, compact switchers)
<Tabs value={tab} onValueChange={setTab} variant="pill">
  <TabsList>
    <TabsTrigger value="all">All</TabsTrigger>
    <TabsTrigger value="active">Active</TabsTrigger>
    <TabsTrigger value="archived">Archived</TabsTrigger>
  </TabsList>
</Tabs>
```

### Toast & Alert

```tsx
// Inline, persistent alert
<Alert variant="warning" message="Complete your profile before the deadline." />
<Alert variant="error" label="Validation" message="Some fields have errors." />

// Transient toast via hook
const { toasts, toast, dismiss } = useToast();
// In root/layout:
<ToastStack toasts={toasts} onDismiss={dismiss} />
// Trigger anywhere:
toast({ variant: 'success', title: 'Saved!', message: 'Changes saved successfully.' });
toast({ variant: 'error', title: 'Error', message: 'Something went wrong.' }, 6000);

// Variants: success | warning | error | info
```

### Tooltip & Popover

```tsx
// Simple hover tooltip
<Tooltip content="Edit member" placement="top">
  <button>…</button>
</Tooltip>

// On a dark surface (inverted colours)
<Tooltip content="Settings" placement="bottom" dark>
  <button>…</button>
</Tooltip>

// Click-triggered popover panel
<Popover trigger={({ open, onToggle }) => (
  <button onClick={onToggle}>User Info {open ? '↑' : '↓'}</button>
)}>
  <div className="p-3">…rich content…</div>
</Popover>

// Placements: top | bottom | left | right (Tooltip only)
```

### Modal & Drawer

```tsx
// Centred modal — z-40
<Modal
  open={open}
  onClose={() => setOpen(false)}
  title="Confirm Action"
  footer={
    <>
      <Button variant="secondary" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
      <Button variant="destructive" size="sm">Remove</Button>
    </>
  }
>
  <p className="text-xs text-brand-blue/70 leading-relaxed">
    Are you sure you want to remove this member?
  </p>
</Modal>

// Right-side drawer — z-30, scrollable body
<Drawer
  open={drawerOpen}
  onClose={() => setDrawerOpen(false)}
  title="Member Details"
  footer={<Button size="sm">Save</Button>}
>
  <p>Panel content</p>
</Drawer>
```

### PageHeader (updated)

```tsx
// With eyebrow label
<PageHeader
  eyebrow="Cohort 2 · Admin"
  title="Members"
  subtitle="Manage your team roster"
  action={<Button>Invite</Button>}
/>

// Compact (filter-heavy pages)
<PageHeader title="Events" variant="card" size="sm" />

// Inline heading (no card chrome)
<PageHeader title="Settings" variant="ghost" />
```


---

## Motion guidelines

- Use `ease-out` for elements entering, `ease-in` for leaving.
- Prefer `transform` and `opacity` — never animate `width`, `height`, or `background-color` alone.
- Wrap with `motion-safe:` or check `prefers-reduced-motion` for anything non-trivial.
- Never use `transition-all` — be explicit.

```tsx
// Standard hover lift
className="transition-[transform,box-shadow] duration-150 ease-in-out
           hover:-translate-y-[2px] hover:-translate-x-[2px]"

// Fade + slide enter
className="transition-[opacity,transform] duration-200 ease-out
           opacity-0 translate-y-1 data-[open]:opacity-100 data-[open]:translate-y-0"
```

---

## Layout

All pages wrap content in the standard container:

```tsx
<div className="max-w-6xl mx-auto px-4 sm:px-6">
  {/* page content */}
</div>
```

Or use the `Container` component which applies this automatically.

### Z-index stack

| Layer | Class | Use |
|---|---|---|
| Default | `z-0` | |
| Elevated | `z-10` | Hover cards, popovers |
| Sticky | `z-20` | Header, sidebar |
| Drawer | `z-30` | Side panels |
| Modal | `z-40` | Dialog + backdrop |
| Toast | `z-50` | Always on top |

---

## Sidebar navigation

Sidebar always uses `bg-brand-blue`. Item states:

```tsx
// Default
'text-white/65 hover:bg-white/8 hover:text-white/85'

// Active (yellow left border is the indicator)
'bg-white/15 border-l-2 border-brand-yellow text-white font-bold'

// Icon colors
'text-white/55'        // inactive
'text-brand-yellow'    // active
```

Use `tokens.sidebar.*` for these values programmatically.

---

## Dark surfaces

When content sits on `bg-brand-blue` or another dark background:

- Text hierarchy: `text-white` → `text-white/80` → `text-white/55`
- Borders: `border-white/15` to `border-white/25`
- Card backgrounds: `bg-white/8` to `bg-white/12`
- Shadows: swap blue-tinted with `rgba(0,0,0,0.25–0.5)`
- CTA button: `bg-brand-yellow text-brand-blue` (never white-on-yellow)

---

## Adding a new component

1. Create `src/core/components/ui/MyComponent.tsx`
2. Export from `src/core/components/ui/index.ts`
3. It's automatically available via `import { MyComponent } from '@/design'`
4. Document it at `/branding` by adding a section to the relevant `*Section.tsx` file

Use existing components as templates. Every component should:
- Use asymmetric `rounded-tl-* rounded-br-*` corners
- Use `font-display` for labels/headings, `font-sans` for body
- Express interactivity through the shadow lift system, not color change alone
- Accept a `className` prop for one-off overrides
