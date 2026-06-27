
```markdown
# 03_ARCHITECTURE_MAP.md — GymOS Architecture Map

> **Version**: 1.0
> **Stack**: React 19 + Vite 8 + TypeScript + Zustand + TailwindCSS v4
> **Pattern**: Feature-Sliced + Domain-Driven (Lite)
> **Backend**: Mock JSON (Phase 1) → Real API (Phase 2, future)

---

## 1. Core Stack Decisions

| Concern | Solution | Why |
|---------|----------|-----|
| Framework | React 19 + Vite 8 | PWA-friendly, fast DX, no overhead |
| Language | TypeScript strict | Type safety across domain layer |
| Styling | Tailwind v4 + CSS tokens | Design system native integration |
| UI Primitives | Lucide React | Already in project, consistent |
| Animation | Framer Motion | Rich interactions, mobile gestures |
| State — UI | React useState | Simple local component state |
| State — App | Zustand v5 | Lightweight, no boilerplate |
| State — Server | Zustand + service layer | Swap to real API with zero refactor |
| Routing | React Router v7 | Already in project |
| PWA | vite-plugin-pwa + Serwist | Offline support, install prompt |
| i18n | i18next + react-i18next | AR/EN with RTL support |
| Forms | Native controlled inputs | No form library needed at this scale |
| Validation | Zod (domain layer only) | Runtime safety on mutated data |

---

## 2. Folder Structure (Final)

```

src/ │ ├── app/ # App bootstrap │ ├── App.tsx # Root component, providers │ ├── Router.tsx # All route definitions │ └── main.tsx # Vite entry point │ ├── components/ │ ├── ui/ # Atomic primitives (Button, Card, Input...) │ │ └── [Never import from domain/] │ ├── layout/ # AppShell, TopBar, BottomNav, Sidebar │ └── shared/ # Cross-feature components (KPICard, StampBar...) │ ├── domain/ # ⚠️ Framework-agnostic — NO React imports │ ├── member/types.ts │ ├── membership/types.ts │ ├── workout/types.ts │ ├── workoutLog/types.ts │ ├── exercise/types.ts │ ├── measurement/types.ts │ ├── payment/types.ts │ ├── plan/types.ts │ └── checkin/types.ts │ ├── services/ # ⭐ NEW — Data abstraction layer │ ├── memberService.ts # getMember(), getMembers(), updateMember() │ ├── workoutService.ts # getProgram(), saveSession()... │ ├── exerciseService.ts │ └── _mockAdapter.ts # reads from JSON files (Phase 1) │ # swap to _apiAdapter.ts in Phase 2 │ ├── store/ # Zustand stores (app-wide state) │ ├── useMemberStore.ts │ ├── useMembershipStore.ts │ ├── useWorkoutPlanStore.ts │ ├── useWorkoutLogStore.ts │ ├── useExerciseStore.ts │ ├── useMeasurementStore.ts │ ├── useCheckinStore.ts │ └── useDashboardStore.ts │ ├── hooks/ # Custom React hooks │ ├── useDirection.ts # RTL/LTR detection │ ├── useMemberSearch.ts │ └── useWorkoutSession.ts # ⭐ NEW — session timer, progress logic │ ├── screens/ │ ├── admin/ │ │ ├── DashboardScreen.tsx │ │ ├── MembersScreen.tsx │ │ ├── CheckInScreen.tsx │ │ ├── ReportsScreen.tsx │ │ ├── SettingsScreen.tsx │ │ ├── WorkoutPlansScreen.tsx │ │ ├── WorkoutPlanBuilder.tsx # ⭐ Major rework │ │ ├── ExerciseLibraryScreen.tsx │ │ ├── MemberProgressScreen.tsx │ │ ├── MemberDrawer.tsx │ │ └── RegistrationModal.tsx │ ├── member/ │ │ ├── MemberProfileScreen.tsx │ │ ├── MyWorkoutScreen.tsx # ⭐ Major rework │ │ ├── WorkoutDayScreen.tsx # ⭐ Major rework │ │ ├── ExerciseDetailScreen.tsx │ │ ├── MyProgressScreen.tsx │ │ ├── MeasurementsScreen.tsx │ │ └── SessionCompleteScreen.tsx # ⭐ NEW │ └── entry/ │ └── EntryScreen.tsx │ ├── data/ # Static JSON (Phase 1 mock data) │ ├── members.json │ ├── memberships.json │ ├── plans.json │ ├── payments.json │ ├── checkins.json │ ├── exercises.json │ ├── workoutPlans.json │ ├── workoutLogs.json │ └── measurements.json │ ├── i18n/ │ ├── index.ts │ ├── en.json │ └── ar.json │ └── utils/ ├── dateUtils.ts ├── volumeUtils.ts # ⭐ NEW — weight × reps calculations └── streakUtils.ts # ⭐ NEW — streak logic

```

---

## 3. Data Flow Architecture

```

JSON Files (data/) │ ▼ Service Layer (services/) ← ONLY layer that touches raw data │ In Phase 2: replace with fetch() calls ▼ Zustand Stores (store/) ← App-wide state, loaded once on mount │ ▼ Custom Hooks (hooks/) ← Business logic + derived state │ ▼ Screens (screens/) ← UI only, no business logic │ ▼ Components (components/) ← Purely presentational

````

### The Golden Rule
> A component never reads from `data/` directly.
> A screen never calculates business logic directly.
> The domain layer never imports React.

---

## 4. Store Responsibilities

| Store | Owns | Does NOT own |
|-------|------|--------------|
| useMemberStore | members list, active member | membership status logic |
| useMembershipStore | memberships, plans | payment records |
| useWorkoutPlanStore | programs, workout days | session execution state |
| useWorkoutLogStore | sessions, exercise logs | plan structure |
| useExerciseStore | exercise library | workout assignments |
| useMeasurementStore | body measurements | progress calculations |
| useCheckinStore | check-in records | membership validation |
| useDashboardStore | aggregated KPIs | raw data |

---

## 5. Service Layer Pattern (Phase 1 → Phase 2)

### Phase 1 — Mock (current)
```typescript
// services/memberService.ts
import membersData from '../data/members.json';
import { Member } from '../domain/member/types';

export const memberService = {
  getAll: (): Member[] => membersData,
  getById: (id: string): Member | undefined =>
    membersData.find(m => m.id === id),
};
````

### Phase 2 — Real API (future, zero refactor in stores)

```typescript
// services/memberService.ts
export const memberService = {
  getAll: async (): Promise<Member[]> => {
    const res = await fetch('/api/members');
    return res.json();
  },
  getById: async (id: string): Promise<Member | undefined> => {
    const res = await fetch(`/api/members/${id}`);
    return res.json();
  },
};
```

> Stores call `memberService.getAll()` — they never know if it's mock or real.

---

## 6. PWA Offline Strategy

|Data Type|Strategy|
|---|---|
|Exercise library|Cache on install (static)|
|Member's active program|Cache on program assign|
|Workout session logs|Write to LocalStorage queue|
|Session sync|Background sync when online|
|Images / icons|Cache first|

---

## 7. RTL / LTR Architecture

- `dir` attribute set on `<html>` tag via `useDirection` hook
- All spacing uses CSS logical properties: `margin-inline-start` not `margin-left`
- Framer Motion animations respect direction:
    - LTR: slide in from right
    - RTL: slide in from left
- Font switching via `[dir="rtl"]` CSS selector (defined in `01_DESIGN_SYSTEM.md`)

---

## 8. What We Are NOT Building

To protect scope, the following are explicitly out:

- ❌ No Next.js migration
- ❌ No backend in Phase 1
- ❌ No TanStack Query (until real API exists)
- ❌ No authentication system (Phase 2)
- ❌ No payment gateway integration
- ❌ No calendar or date-based scheduling
- ❌ No periodization or training cycle logic
- ❌ No social features

---

## 9. Phase Roadmap

### Phase 1 — Current (Active)

- [ ] Lock design system tokens into globals.css
- [ ] Rebuild UI components with new design tokens
- [ ] Add Framer Motion to key transitions
- [ ] Rework WorkoutPlanBuilder (Trainer)
- [ ] Rework MyWorkoutScreen + WorkoutDayScreen (Member)
- [ ] Build SessionCompleteScreen
- [ ] Mobile responsiveness audit

### Phase 2 — Future

- [ ] Real backend integration via service layer swap
- [ ] Authentication (Trainer vs Member login)
- [ ] Push notifications
- [ ] Progress photos

