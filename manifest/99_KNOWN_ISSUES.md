
# 99_KNOWN_ISSUES.md — GymOS Active Bug & Debt Registry

> Issues confirmed against real code via repomix audit.
> Each entry has a severity, a location, and the exact fix needed.
> When an issue is fixed, delete its entry — do not mark it "resolved".

---

## BUG-001 — Merge Conflict in MeasurementsScreen

**Severity**: 🔴 Critical (build-breaking or silent runtime corruption)
**File**: `src/screens/member/MeasurementsScreen.tsx`
**Status**: Open

**What**: Unresolved Git merge conflict markers exist in the file:
```
<<<<<<< HEAD
      ...(form.weight ? { weight: Number(form.weight) } : {}),
=======
      ...(form.weight   ? { weight: Number(form.weight) } : {}),
      measurements: {
        ...(form.chest ? { chest: Number(form.chest) } : {}),
        ...(form.waist ? { waist: Number(form.waist) } : {}),
        ...
      },
>>>>>>> 63ad4f5680b56914e77dae47b3fd41813be8c984
```

**Fix**: Decide which branch wins:
- **HEAD (current)**: weight-only — simpler form, fewer fields.
- **incoming**: includes chest/waist/bodyFat/hips measurements.
Choose one, delete the markers and the losing block entirely.

---

## BUG-002 — Identity Model Violation in ExerciseDetailScreen

**Severity**: 🟠 High (silent data bug — wrong member sees wrong logs)
**File**: `src/screens/member/ExerciseDetailScreen.tsx`
**Status**: Open

**What**: `getLogsForMember` is called with `phone` instead of `member.id`:
```ts
// ❌ Wrong
const logs = getLogsForMember(phone);

// ✅ Correct
const member = members.find(m => m.phone === phone)
const logs = getLogsForMember(member.id)
```
See Section 3 of `00_PROJECT_DNA.md` for the full identity rule.

**Fix**:
```ts
const { phone, id: exerciseId } = useParams<{ phone: string; id: string }>()
const members = useMemberStore(s => s.members)
const member = members.find(m => m.phone === phone)
const { getLogsForMember } = useWorkoutLogStore()
const prevSessions = useMemo(() => {
  if (!member || !exerciseId) return []
  const logs = getLogsForMember(member.id) // ← member.id, not phone
  ...
}, [member, exerciseId, getLogsForMember])
```

---

## DEBT-001 — Hardcoded Tailwind Colors in ExerciseCard

**Severity**: 🟡 Low (visual inconsistency, not a runtime bug)
**File**: `src/components/shared/ExerciseCard.tsx`
**Status**: Acknowledged — fix during next ExerciseCard iteration

**What**: Muscle-group badge colors use hardcoded Tailwind classes:
`bg-indigo-500/10 text-indigo-400 border-indigo-500/20` etc.
Violates the CSS-variables-only rule from Section 4 of DNA.

**Fix**: Replace `muscleColors` record with CSS variable equivalents,
or add `--color-muscle-*` tokens to `src/index.css @theme`.

---

## DEBT-002 — (s: any) Casts in App.tsx Store Hooks

**Severity**: 🟡 Low (type safety loss, not a runtime bug)
**File**: `src/app/App.tsx`
**Status**: Acknowledged — not a pattern to follow

**What**:
```ts
const loadMembers     = useMemberStore((s: any) => s.loadMembers)
const loadMemberships = useMembershipStore((s: any) => s.loadMemberships)
const loadCheckins    = useCheckinStore((s: any) => s.loadCheckins)
```
These `any` casts exist because the stores were typed before the hook
signatures stabilized. They work at runtime but bypass TypeScript.

**Fix**: Each store already has a typed interface. Replace `(s: any)`
with the correct type parameter, e.g.:
```ts
const loadMembers = useMemberStore((s: MemberStore) => s.loadMembers)
```
```

---
## 7. Manifest File Index

When starting a task, load ONLY the sections relevant to that task.
Do not load the full DNA unless explicitly required.

### Core files (always available)

| File | What it covers | Load when |
|---|---|---|
| `00_PROJECT_DNA.md` | This file — stack, structure, identity, components, i18n | See section guide below |
| `99_KNOWN_ISSUES.md` | Active bugs and technical debt | Starting any task that touches a flagged file |

### Domain files (load on demand)

| File | What it covers | Load when |
|---|---|---|
| `02_UX_FLOWS_ADMIN.md` | Admin screen flows and transitions | Working on any admin screen |
| `02_UX_FLOWS_MEMBER.md` | Member screen flows and transitions | Working on any member screen |
| `05_ROADMAP.md` | Milestone overview and feature priorities | Planning a new milestone |
| `06_WORKOUT_SYSTEM.md` | Workout log store, set logging, day completion flow | Touching `WorkoutDayScreen`, `SetLogger`, `useWorkoutLogStore` |
| `07_WORKOUT_PLANS_ROADMAP.md` | Workout plan builder roadmap | Touching `WorkoutPlanBuilder` or `WorkoutPlansScreen` |
| `11_MYPROGRESS_ROADMAP.md` | MyProgress and measurements roadmap | Touching `MyProgressScreen` or `MeasurementsScreen` |

### DNA section quick-reference

| Task type | Sections to load |
|---|---|
| New screen from scratch | 2, 3, 4, 5, 6 |
| Fix a data/store bug | 3, 5 |
| New UI component | 1, 4, 5 |
| i18n / RTL fix | 6 |
| Touching member workout flow | 3, 5 + `06_WORKOUT_SYSTEM.md` |
| Admin dashboard or reports | 2, 5 |
| Anything touching `KPICard` | 5 only |
| Anything touching `ProgressChart` | 5 only |

### Archived files (do not load)

The following have been superseded and moved to `manifest/archive/`:
`00_HANDOFF_CONTEXT.md`, `01_DESIGN_SYSTEM.md`, `03_ARCHITECTURE_MAP.md`,
`04_ANIMATION_SYSTEM.md`, `09_CRITICAL_FIX_PLAN.md`,
`10_PHASE2_MEMBER_CORE_DNA.md`.
