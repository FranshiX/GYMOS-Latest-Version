# 00_PROJECT_DNA.md — GymOS Architectural Source of Truth

> **For LLMs reading this before touching code**: This file documents
> verified architectural reality — not aspirations. Every version number,
> rule, and pattern here has been confirmed against the actual codebase.
> When this file conflicts with a comment in code, trust this file and
> flag the discrepancy.

---

## 1. Tech Stack (Locked)

Verified against `package.json`, `vite.config.ts`, `tsconfig.json`,
and `src/index.css`. Do not suggest replacing any item in this list.

### Runtime dependencies (exact installed versions)

| Package | Version | Role |
|---|---|---|
| `react` / `react-dom` | ^19.2.6 | UI framework |
| `vite` | ^8.0.12 | Build tool + dev server |
| `typescript` | ~6.0.2 | Language (strict mode — see below) |
| `zustand` | ^5.0.14 | State management (with `persist` middleware) |
| `tailwindcss` / `@tailwindcss/vite` | ^4.3.0 | Styling — CSS-first config (see below) |
| `framer-motion` | ^12.40.0 | Animation |
| `react-router-dom` | ^7.16.0 | Routing |
| `i18next` / `react-i18next` | ^26.3.0 / ^17.0.8 | Internationalisation |
| `lucide-react` | ^1.17.0 | Icons (always `strokeWidth={1.5}`) |
| `recharts` | ^3.8.1 | Charts (consumed via `ProgressChart.tsx` — see Section 5) |
| `date-fns` | ^4.4.0 | Date utilities |
| `clsx` + `tailwind-merge` | ^2.1.1 / ^3.6.0 | Class composition helpers |
| `vite-plugin-pwa` | ^1.3.0 | PWA manifest + service worker |

### TypeScript config (strict)

`tsconfig.json` enforces:
- `"strict": true`
- `"noUnusedLocals": true`
- `"noUnusedParameters": true`
- Path alias `@/*` → `./src/*` (mirrored in `vite.config.ts` via
  `resolve.alias`)

**No `any` casts permitted** in new code. Existing legacy `any` casts
in stores are technical debt, not precedent.

### Tailwind v4 — CSS-first, no config file

Tailwind is loaded as a Vite plugin (`@tailwindcss/vite`), not via
PostCSS. There is **no `tailwind.config.ts`** — this is correct and
expected for v4.

`src/index.css` is the single source of truth for the design system:

```css
@import "tailwindcss";

@theme {
  /* Tailwind v4 token registration */
  --color-primary:   #B3FF00;
  --color-secondary: #00E5FF;
  --color-danger:    #E05252;
  --color-success:   #4CAF7D;
  --color-warning:   #E8A838;
}

:root {
  /* Full token set: backgrounds, text, borders,
     spacing, radii, fonts, durations, easings, shadows */
}

[dir="rtl"] {
  /* IBM Plex Arabic overrides font-display + font-body in RTL */
}
```

**Rule**: zero hardcoded Tailwind color class names anywhere in the
codebase. All color via `style={{ color: 'var(--color-*)' }}` or CSS
variable references. The `@theme` block registers a subset for use as
Tailwind utilities; `:root` carries the full extended set.

### Key design tokens (do not change without explicit discussion)

| Token | Value | Usage |
|---|---|---|
| `--color-primary` | `#B3FF00` | Volt Green — primary CTA, active states |
| `--color-secondary` | `#00E5FF` | Tech Cyan — accent |
| `--bg-base` | `#080808` | OLED black — root background |
| `--font-display` (LTR) | Hanken Grotesk | Headings in English |
| `--font-body` (LTR) | Inter | Body text in English |
| `--font-arabic` / RTL override | IBM Plex Arabic | All text in Arabic |
| `--font-mono` | JetBrains Mono | Code/data display |

### Explicitly rejected — do not suggest again

| Technology | Reason |
|---|---|
| **Next.js** | Attempted migration caused unmanageable chaos; reverted to Vite. Settled decision, do not reopen. |
| **TanStack Query** | Not in the approved stack |
| **shadcn/ui** | Not in the approved stack |
| **Redux** | Zustand is sufficient |
| Any additional state library | Zustand covers all cases |

Section 2 لا تحتاج repomix جديد — هيكل المجلدات موجود بالكامل في الـ XML اللي رفعته للتو. أكتب مباشرة.

---

```markdown
## 2. Project Structure

```
src/
├── app/                    # Entry point: App.tsx, Router.tsx, main.tsx
├── components/
│   ├── ui/                 # Atomic primitives (Button, Card, Input, Modal,
│   │                       #   Badge, Drawer, EmptyState, ProgressRing)
│   ├── layout/             # AppShell, BottomNav, Sidebar, TopBar
│   └── shared/             # Cross-screen reusable components (see Section 5)
├── domain/                 # Pure TypeScript — ZERO React imports allowed here.
│   │                       #   Types + pure logic per domain aggregate.
│   ├── checkin/
│   ├── exercise/
│   ├── measurement/
│   ├── member/
│   ├── membership/
│   ├── payment/
│   ├── plan/
│   ├── workout/
│   └── workoutLog/
├── services/               # Data abstraction layer — mock JSON today, API later.
│   │                       #   Screens import from here, never from data/ directly.
├── store/                  # Zustand stores (one file per domain aggregate)
├── hooks/                  # Shared React hooks (useDirection, useMemberSearch)
├── screens/
│   ├── admin/              # Trainer-role screens
│   ├── member/             # Member-role screens
│   └── entry/              # Pre-auth / role-selection screen
├── data/                   # Static JSON seed files (Phase 1 only — no backend yet)
├── i18n/                   # Translation files: en.json, ar.json, index.ts
├── types/                  # Global TypeScript ambient declarations
└── utils/                  # Pure utility functions (dateUtils, variants)
```

### Structural rules

- `domain/` has zero React imports — it is framework-agnostic pure
  TypeScript. Any React dependency found here is a violation.
- Screens import data through `services/`, not by importing from
  `data/*.json` directly. This is the seam that will be replaced when
  a real backend arrives.
- `components/ui/` primitives use **dual export** (named + default) so
  both `import { Button }` and `import Button` work.
```

---

## 3. The Identity Model

A member has two distinct identifiers that serve different purposes.
Mixing them is a silent bug — it produces no runtime error but breaks
data completely.

| Identifier | Example | Purpose |
|---|---|---|
| `member.id` | `"m-04"` | Stable primary key. **All store calls use this.** |
| `member.phone` | `"0504445566"` | URL routing param only: `/member/:phone/...` |

### The rule

Every member screen must follow this exact sequence:

```ts
// 1. Get phone from the URL
const { phone } = useParams()

// 2. Resolve the member object — this is the only place phone is used
const member = useMemberStore(s => s.members.find(m => m.phone === phone))

// 3. All store calls use member.id — never phone
const logs = useWorkoutLogStore(s => s.getLogsForMember(member.id))
const streak = useWorkoutLogStore(s => s.getStreakForMember(member.id))
```

`phone` must never be passed directly into `useWorkoutLogStore`,
`useMeasurementStore`, or any domain store function.

### Why this rule exists

Two screens (`WorkoutDayScreen.tsx` and `SessionCompleteScreen.tsx`)
historically passed raw `phone` into store functions. This silently
broke day-completion and streak tracking for all members. The bug was
found, fixed, and verified. Every new or modified member screen is
audited for this pattern before it is considered done.

## 4. Component Contracts

Rules that apply to every component in the codebase without exception.

### `data-screen` attribute

Every screen's root element must carry a `data-screen` attribute with
the screen's kebab-case name:

```tsx
<div data-screen="member-profile" ...>
```

This is a real, grep-checkable contract — not a soft convention.

### Colors via CSS variables only

Zero hardcoded Tailwind color class names in any component. All color
must flow through CSS variables:

```tsx
// ✅ Correct
<div style={{ color: 'var(--color-primary)' }}>

// ❌ Wrong — never do this
<div className="text-green-400">
```

### All user-facing strings through `t()`

No bare string literals in JSX. Every visible string uses the i18n
hook:

```tsx
const { t } = useTranslation()
// ...
<p>{t('dashboard.title')}</p>
```

### Dual export for `components/ui/*`

Every primitive in `ui/` exports both named and default:

```ts
export function Button(props: ButtonProps) { ... }
export default Button
```

This allows both `import { Button }` and `import Button` to work
without error.

## 5. Shared Components Inventory

This is the highest-value section for any LLM touching this codebase.
Before building a new component, check here. Duplicate-component
discovery has happened repeatedly: MonthlyReportCard, ProgressChart,
and KPICard were all "rediscovered" mid-task rather than known upfront.

### `components/shared/` — cross-screen components

**`KPICard.tsx`**
Props: `{ label: string, value: number | string, icon?: LucideIcon, color?: string, subtitle?: string, trend?: 'up' | 'down' | 'neutral' }`
Note: `trend` prop is accepted but not yet rendered — no visual output for it.
Visually larger than ad-hoc stat cards: `p-4`, `text-2xl` value, `w-9 h-9` icon box.
Current usage: `DashboardScreen.tsx`, `MemberProfileScreen.tsx`.

**`MonthlyReportCard.tsx`**
Props: `{ memberId: string }`
Computes real KPIs from live store data (sessions, sets, best lift, weight
change) for the current calendar month. Renders a 2×2 grid of stats.
Current usage: `MyProgressScreen.tsx`.

**`ProgressChart.tsx`**
Props: `{ data: Array<{ date: string; value: number }>, label: string, color?: string, height?: number }`
Recharts `LineChart` wrapper. Default color `var(--color-brand)`, default
height 200px. Takes pre-formatted `{ date, value }` pairs — caller is
responsible for slicing and mapping raw store data.
Current usage: `MyProgressScreen.tsx` (weight + exercise charts),
`MeasurementsScreen.tsx` (weight chart).
**Not yet adopted**: `MemberProgressScreen.tsx` (admin) has its own
inline duplicate — future admin polish pass.

**`AlertRow.tsx`**
Props: `{ name: string, phone: string, status: MemberStatus, detail: string, onClick?: () => void }`
Renders a tappable member row with a colored status dot and badge.
Current usage: `DashboardScreen.tsx` (expiring alerts list).

**`ExerciseCard.tsx`**
Props: `{ exercise: Exercise, onClick?: () => void, selected?: boolean, showEquipment?: boolean, compact?: boolean }`
⚠️ Known exception: uses hardcoded Tailwind color classes for muscle-group
badges (`bg-indigo-500/10`, `text-sky-400`, etc.) — violates the
CSS-variables-only rule. This is acknowledged technical debt, not a
pattern to follow.
Current usage: `ExerciseLibraryScreen.tsx`, `WorkoutPlanBuilder.tsx`.

**`SetLogger.tsx`**
Props: `{ sessionId?: string, exerciseId?: string, onComplete?: () => void, targetSets?: number, targetReps?: number }`
Manages set rows (weight, reps, completed) and writes to
`useWorkoutLogStore` via `updateSetLog` and `addExerciseLog`.
Current usage: `WorkoutDayScreen.tsx`.

**`StampBar.tsx`**
Props: `{ total: number, used: number, size?: 'sm' | 'md', showLabel?: boolean }`
Renders either dot-stamps (≤20 total) or a progress bar (>20 total)
with color thresholds (success/warning/danger).
Current usage: `MembersScreen.tsx`, `MemberDrawer.tsx`,
`MemberProfileScreen.tsx`.

**`StatusBadge.tsx`**
Props: `{ status: MemberStatus | 'active' | 'expiring' | 'expired', size?: 'sm' | 'md' }`
Accepts both canonical `MemberStatus` strings and lowercase aliases —
normalizes internally. Renders colored pill with pulsing dot.
Current usage: `MembersScreen.tsx`, `MemberDrawer.tsx`,
`MemberProfileScreen.tsx`, `ReportsScreen.tsx`.

**`StreakWidget.tsx`**
Props: `{ streak: number, totalSessions?: number, lastWorkoutDate?: string, compact?: boolean, size?: 'sm' | 'md' | 'lg' }`
Renders a streak counter with flame emoji (color shifts amber → orange → red
based on streak count). Compact mode: inline row. Full mode: card with
last-session label.
Current usage: not confirmed in any screen via this audit — verify before
assuming it is unused.

**`PWAInstallPrompt.tsx`**
Props: none. Listens for `beforeinstallprompt`, renders an animated bottom
banner with install/dismiss. Mounted once in `App.tsx`.

---

### `components/ui/` — atomic primitives

All `ui/` primitives use dual export (named + default).

| Component | Key props | Notes |
|---|---|---|
| `Button` | `variant` (primary/secondary/ghost/danger), `size` (sm/md/lg), `fullWidth`, `loading`, `leftIcon`, `rightIcon` | Framer Motion wrapper; `full` alias for `fullWidth` |
| `Card` | `variant` (default/elevated/brand/ghost), `padding` (none/sm/md/lg), `onClick` | Becomes `motion.button` when `onClick` provided |
| `Input` | `label`, `error`, `prefix`, `leftIcon`, `rightIcon` | `forwardRef`; `prefix` and `leftIcon` are aliases |
| `Modal` | `open`, `onClose`, `title`, `size` (sm/md/lg) | Locks body scroll while open |
| `Drawer` | `open`, `onClose`, `title` | Slides from inline-end; RTL-aware |
| `Badge` | `variant` (brand/success/warning/danger/neutral), `size` (sm/md) | Pill shape |
| `EmptyState` | `icon`, `title`, `subtitle`, `cta` | Centered; `cta` renders a primary button |
| `ProgressRing` | `progress` (0–100), `size`, `strokeWidth`, `color`, `backgroundColor`, `children` | SVG ring; children centered inside |

## 6. i18n Convention

### Setup (verified against `src/i18n/index.ts`)

- Library: `i18next` + `react-i18next`
- **Default language: Arabic** (`lng: 'ar'`)
- Fallback: English (`fallbackLng: 'en'`)
- Two translation files: `src/i18n/ar.json`, `src/i18n/en.json`
- Imported once at entry: `import '@/i18n/index'` in `main.tsx`

### Key structure

Keys are nested, dot-separated. Both files must have identical key trees:

```json
{
  "app":           { "name": "GymOS" },
  "nav":           { "dashboard": "...", "members": "..." },
  "dashboard":     { "title": "...", "total_members": "..." },
  "members":       { ... },
  "checkin":       { ... },
  "registration":  { ... },
  "plans":         { ... },
  "workout":       { ... },
  "progress":      { ... },
  "measurements":  { ... },
  "profile":       { ... },
  "status":        { "active": "...", "expiring_soon": "...", "expired": "..." },
  "widget":        { "streak_label": "...", "sessions": "...", ... },
  "settings":      { ... },
  "pwa":           { ... }
}
```

A key missing from one file but present in the other silently falls
back to English — no error, no warning.

### Usage in components

```ts
// Always destructure t and i18n together
const { t, i18n } = useTranslation()

// String rendering — never bare literals
<p>{t('dashboard.title')}</p>

// Language check (prefer this over i18n.language === 'ar')
const isAr = i18n.language === 'ar'

// dir attribute on screen root elements
const dir = i18n.dir()   // returns 'rtl' or 'ltr'
<div dir={dir}>
```

### RTL / direction

`useDirection` is the single hook for all direction-aware logic:

```ts
const { isRTL, language, toggleLanguage } = useDirection()
```

- Sets `document.documentElement.dir` and `lang` on language change
- Used by `Drawer.tsx` for slide direction, `TopBar.tsx` for back icon,
  and any component that needs directional icons (`ChevronLeft` vs
  `ChevronRight`)
- Never use `document.dir` directly in a component — always `useDirection`

### Font switching

Handled automatically by CSS — no JS needed:

```css
/* LTR (default) */
:root {
  --font-display: "Hanken Grotesk", ...;
  --font-body:    "Inter", ...;
}

/* RTL — both slots override to IBM Plex Arabic */
[dir="rtl"] {
  --font-display: "IBM Plex Arabic", ...;
  --font-body:    "IBM Plex Arabic", ...;
}
```

### Rules for new keys

- Add to **both** `ar.json` and `en.json` in the same PR — never one
  without the other.
- Keys are `snake_case`, nested under the most relevant domain group.
- Never use inline bilingual fallback in JSX (`isAr ? 'عربي' : 'English'`)
  except inside `StreakWidget.tsx` where it exists as acknowledged debt;
  do not add new instances of this pattern.