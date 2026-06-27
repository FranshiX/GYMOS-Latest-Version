# 09_CRITICAL_FIX_PLAN.md — Workout Flow Critical Fix Sequence


> **Status**: ACTIVE — HIGHEST PRIORITY
> **Supersedes**: All other open tasks in 05/06/07 until this file is closed
> **Rule**: STRICT LINEAR ORDER. Do not start Fix N+1 until Fix N is
> manually verified by the user using 08_AUDIT_CHECKLIST.md.
> **Do NOT add features here.** This file fixes existing promised
> behavior only — nothing new.

---

## Why This File Exists

Audit (08_AUDIT_CHECKLIST.md) revealed the workout execution flow is
visually complete but functionally disconnected. Root cause: no
persistence layer, and SetLogger never writes to the store.

Everything below traces back to ONE root cause. Fix in this exact
order — each fix unblocks the next.
ROOT CAUSE: No persistence layer exists at all

│

▼

FIX 1: Add localStorage persistence to Zustand stores

│

▼

FIX 2: Connect SetLogger to useWorkoutLogStore (real writes)

│

▼

FIX 3: Real session timer (replace "--:--" placeholder)

│

▼

FIX 4: Auto-navigate to SessionCompleteScreen on completion

│

▼

FIX 5: Real data in SessionCompleteScreen (no more mock duration)

│

▼

FIX 6: Fix "Last Session" to show actual previous log, not today's

│

▼

FIX 7: Fix MyWorkoutScreen day-completion + progress ring (now that

real data exists, recalculate from real store state)

│

▼

FIX 8: Fix streak reset logic (now that real dated logs exist)

---

## FIX 1 — Persistence Layer (Foundation — Do First)

### Problem
All Zustand stores are in-memory only. Refresh = data loss.

### Solution
Add Zustand's `persist` middleware to stores that hold user-generated
data. Do NOT persist stores that only hold static reference data
(e.g. exercise library if it never changes from JSON).

### Stores That MUST Persist
- `useWorkoutLogStore` (sessions, exercise logs, set logs)
- `useMeasurementStore` (body measurements)
- `useMemberStore` (if it allows admin edits — confirm first)
- `useWorkoutPlanStore` (if trainer-created plans must survive refresh)

### Stores That Do NOT Need Persistence
- `useExerciseStore` (static library, re-seeds from JSON each load — confirm with user if exercises are ever edited by trainer)
- `useDashboardStore` (always derived/computed, never persisted)

### Implementation Pattern
```typescript
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export const useWorkoutLogStore = create<WorkoutLogState>()(
  persist(
    (set, get) => ({
      // ...existing store logic unchanged...
    }),
    {
      name: 'gymos-workout-logs', // localStorage key
      storage: createJSONStorage(() => localStorage),
    }
  )
)
```

### Verification Before Moving to Fix 2
- [ ] Add a set log entry → refresh the page → entry still exists
- [ ] Check browser DevTools → Application → Local Storage →
      confirm key `gymos-workout-logs` exists with real data

**STOP. Do not proceed to Fix 2 until this is manually verified.**

---

## FIX 2 — Connect SetLogger to the Store

### Problem
SetLogger manages only local component state (`useState`). Nothing
is written to `useWorkoutLogStore`.

### Solution
On every set completion (checkmark tap), SetLogger must call the
store action that updates the log — not just update local UI.

### Required Store Action (verify it exists, create if missing)
```typescript
// useWorkoutLogStore.ts
updateSetLog: (
  sessionId: string,
  programExerciseId: string,
  setNumber: number,
  data: { weightKg: number; actualReps: number; completed: boolean }
) => void
```

### SetLogger Behavior Change
```typescript
const handleSetComplete = (setNumber: number, weight: number, reps: number) => {
  // 1. Update local UI state for immediate visual feedback
  setLocalSets(prev => /* update checkmark, animation */)

  // 2. Write to the store — THIS WAS MISSING
  useWorkoutLogStore.getState().updateSetLog(
    sessionId,
    programExerciseId,
    setNumber,
    { weightKg: weight, actualReps: reps, completed: true }
  )
}
```

### Session Start Requirement
Before any set can be logged, a session (`WorkoutSession`) must exist
in the store. WorkoutDayScreen must call `startLog()` ONCE when the
screen mounts (not on every render) and store the returned `sessionId`
in local state to pass down to SetLogger.

### Verification Before Moving to Fix 3
- [ ] Start a workout, log a set, refresh — set data still there
- [ ] Open DevTools storage — confirm the specific set's weight/reps
      appear in the persisted JSON, not just "completed: true"

**STOP. Do not proceed to Fix 3 until this is manually verified.**

---

## FIX 3 — Real Session Timer

### Problem
Timer shows static "--:--" placeholder.

### Solution
```typescript
// In WorkoutDayScreen
const [elapsedSeconds, setElapsedSeconds] = useState(0)

useEffect(() => {
  const interval = setInterval(() => {
    setElapsedSeconds(prev => prev + 1)
  }, 1000)
  return () => clearInterval(interval)
}, [])

const formatTime = (totalSeconds: number) => {
  const min = Math.floor(totalSeconds / 60)
  const sec = totalSeconds % 60
  return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}
```

Display `formatTime(elapsedSeconds)` in the session header.
Store `elapsedSeconds` to pass to SessionCompleteScreen on finish
(this becomes the REAL duration, replacing the `totalSets * 3min` mock).

### Verification Before Moving to Fix 4
- [ ] Timer counts up visibly from 00:00 in real time
- [ ] Timer does not reset if you scroll or interact with inputs

**STOP. Do not proceed to Fix 4 until this is manually verified.**

---

## FIX 4 — Auto-Navigate to SessionCompleteScreen

### Problem
No navigation happens after the last exercise is completed. The
screen just sits there.

### Solution
After Fix 2, the store now has reliable completion state. Add a
derived check in WorkoutDayScreen:

```typescript
const allExercisesComplete = day.exercises.every(ex =>
  isExerciseFullyLogged(sessionId, ex.id) // helper using store data
)

useEffect(() => {
  if (allExercisesComplete) {
    finishLog(sessionId) // mark session as completed in store
    navigate(`/member/${phone}/workout/${dayId}/complete`, {
      state: { duration: elapsedSeconds }
    })
  }
}, [allExercisesComplete])
```

### Required Route (add if missing in Router.tsx)
```tsx
<Route path="workout/:dayId/complete" element={<SessionCompleteScreen />} />
```

### Verification Before Moving to Fix 5
- [ ] Complete every set of every exercise in a day
- [ ] App automatically navigates to SessionCompleteScreen without
      any manual button press for "finish workout"

**STOP. Do not proceed to Fix 5 until this is manually verified.**

---

## FIX 5 — Real Data in SessionCompleteScreen

### Problem
Duration is `totalSets * 3min` (mock). Volume may also be fake.

### Solution
Pass real data via route state (from Fix 3 + Fix 4), and calculate
volume from actual logged sets:

```typescript
// Received via useLocation().state or recalculated from store
const duration = state.duration // from Fix 3, real elapsed seconds

const totalVolume = sessionLogs.reduce((sum, exerciseLog) =>
  sum + exerciseLog.sets.reduce((setSum, set) =>
    set.completed ? setSum + (set.weightKg * set.actualReps) : setSum
  , 0)
, 0)

const exercisesCompleted = sessionLogs.length
const setsCompleted = sessionLogs.reduce((sum, e) =>
  sum + e.sets.filter(s => s.completed).length, 0)
```

### Verification Before Moving to Fix 6
- [ ] Manually log known weights/reps for a full workout
      (e.g. 3 sets of 80kg×10) and confirm displayed volume matches
      your manual calculation exactly
- [ ] Duration shown matches the actual time you spent in the session

**STOP. Do not proceed to Fix 6 until this is manually verified.**

---

## FIX 6 — "Last Session" Shows Real Previous Data

### Problem
Currently shows today's logs instead of the actual previous session.

### Solution
```typescript
// Must EXCLUDE the current/in-progress session
const getLastSessionForExercise = (exerciseId: string, currentSessionId: string) => {
  const allLogs = useWorkoutLogStore.getState().logs
  const pastLogs = allLogs
    .filter(log =>
      log.exerciseId === exerciseId &&
      log.sessionId !== currentSessionId &&  // exclude current session
      log.status === 'completed'              // only finished sessions
    )
    .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())

  return pastLogs[0] ?? null
}
```

### Verification Before Moving to Fix 7
- [ ] Complete a workout today (this becomes "session A")
- [ ] Start the SAME workout day again tomorrow (or simulate by
      changing system date) — "Last Session" must show session A's
      data, NOT empty, NOT today's in-progress data

**STOP. Do not proceed to Fix 7 until this is manually verified.**

---

## FIX 7 — MyWorkoutScreen: Real Progress + Day Completion

### Problem
- "Today's Workout" defaults to last day when all are done
- Progress ring uses in-memory data that didn't persist
- Upcoming days disabled with no visual explanation

### Solution

**Current day detection** (now using persisted real data from Fix 1-6):
```typescript
const currentDayOrder = getCurrentDayOrder(memberId, programId)
// = first day with no completed session, OR
// = if ALL days completed, cycle back to day 1 (per business rule
//   in 06_WORKOUT_SYSTEM.md section 3.1)
```

**All-days-completed state** (currently missing):
```tsx
{allDaysCompleted && (
  <Card>
    <CheckCircle size={32} className="text-success" />
    <p>{t('workout.cycle_complete')}</p>
    <p>{t('workout.restarting_day_1')}</p>
  </Card>
)}
```

**Locked day visual feedback** (currently silent):
```tsx
{!isUnlocked && (
  <div className="flex items-center gap-2 opacity-50">
    <Lock size={14} />
    <span className="text-xs">{t('workout.complete_previous_first')}</span>
  </div>
)}
```

### Verification Before Moving to Fix 8
- [ ] Complete days 1, 2, 3 of a program with 3 days — confirm
      MyWorkoutScreen shows a clear "cycle complete" state, then
      correctly resets to Day 1 as current
- [ ] Tap a locked upcoming day — confirm it shows a clear reason
      why it's locked instead of doing nothing silently
- [ ] Refresh the page mid-cycle — progress ring shows the SAME
      percentage as before refresh

**STOP. Do not proceed to Fix 8 until this is manually verified.**

---

## FIX 8 — Streak Reset Logic

### Problem
Streak may not reset correctly after a gap in training.

### Solution (per rule in 06_WORKOUT_SYSTEM.md section 3.4)
```typescript
const calculateStreak = (memberId: string): number => {
  const completedSessions = getCompletedSessions(memberId)
    .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())

  if (completedSessions.length === 0) return 0

  let streak = 1
  for (let i = 0; i < completedSessions.length - 1; i++) {
    const current = new Date(completedSessions[i].completedAt)
    const previous = new Date(completedSessions[i + 1].completedAt)
    const hoursDiff = (current.getTime() - previous.getTime()) / (1000 * 60 * 60)

    if (hoursDiff <= 48) {
      streak++
    } else {
      break // gap too large, streak ends here
    }
  }
  return streak
}
```

### Verification — Final Step
- [ ] Complete sessions on day 1, day 2, day 3 (within 48h windows) —
      streak shows 3
- [ ] Simulate a 3+ day gap (change system date or wait) — complete
      a new session — streak resets to 1, not 4

---

## Definition of Done for This Entire File

This file is CLOSED only when:
- [ ] All 8 fixes verified individually (checkboxes above)
- [ ] Full end-to-end re-run of 08_AUDIT_CHECKLIST.md Section A
      (Member Workout Flow) — every item now shows ✅
- [ ] Tested in BOTH Arabic and English
- [ ] Tested after closing and reopening the browser entirely
      (not just refresh — full close, to confirm localStorage holds)

Only after this file is closed do we return to discussing new
features or returning to 07_WORKOUT_PLANS_ROADMAP.md Phase 3.

---

## What NOT To Do While Working On This File

- ❌ Do not add new UI elements beyond what's needed for the fix
      (e.g. Fix 7's lock icon is functional feedback, not decoration)
- ❌ Do not refactor unrelated code "while you're in there"
- ❌ Do not add TanStack Query or any new persistence library —
      Zustand's built-in `persist` middleware is sufficient and
      already approved in the stack
- ❌ Do not move to Fix N+1 without explicit user confirmation that
      Fix N was manually tested and works