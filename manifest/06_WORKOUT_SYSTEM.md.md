# 06_WORKOUT_SYSTEM.md

````markdown
# 06_WORKOUT_SYSTEM.md — Workout Program System Design

> **Version**: 1.0
> **Status**: Active
> **Scope**: Data Architecture + UX Flows + Screen Specs
> **Roles**: Trainer (Creator) | Member (Executor)

---

## 1. Core Philosophy

The trainer manages the plan.
The member executes the plan.

The system must always answer one question for the member:
> "What should I do right now?"

**Anti-patterns to avoid:**
- No weeks, no calendar dates, no periodization terminology
- No overwhelming dashboards on first open
- No friction between opening the app and starting a workout

---

## 2. Domain Data Models

### 2.1 WorkoutProgram

```typescript
interface WorkoutProgram {
  id: string;
  name: string;
  type: 'general' | 'private';
  trainerId: string;
  memberId?: string;          // only if type === 'private'
  assignedAt?: string;        // ISO date, only if type === 'private'
  days: WorkoutDay[];
  createdAt: string;
  updatedAt: string;
}
````

### 2.2 WorkoutDay

```typescript
interface WorkoutDay {
  id: string;
  programId: string;
  order: number;              // 1, 2, 3, 4 ... (NOT monday/tuesday)
  title: string;              // "Push Day", "Pull Day", "Legs Day"
  exercises: ProgramExercise[];
}
```

### 2.3 ProgramExercise

```typescript
interface ProgramExercise {
  id: string;
  exerciseId: string;         // ref to Exercise library
  order: number;
  sets: number;
  targetReps: number;
  restSeconds?: number;
  notes?: string;
}
```

### 2.4 WorkoutSession (Member Execution)

```typescript
interface WorkoutSession {
  id: string;
  programId: string;
  workoutDayId: string;
  memberId: string;
  status: 'in_progress' | 'completed' | 'skipped';
  startedAt: string;
  completedAt?: string;
  durationSeconds?: number;
  totalVolume?: number;       // kg — sum of (weight × reps) across all sets
  perceivedExertion?: 'easy' | 'moderate' | 'hard' | 'very_hard';
  notes?: string;
  logs: ExerciseLog[];
}
```

### 2.5 ExerciseLog

```typescript
interface ExerciseLog {
  id: string;
  sessionId: string;
  programExerciseId: string;
  exerciseId: string;
  sets: SetLog[];
}
```

### 2.6 SetLog

```typescript
interface SetLog {
  setNumber: number;
  targetReps: number;
  actualReps?: number;
  weightKg?: number;
  completed: boolean;
  completedAt?: string;
}
```

### 2.7 MemberProgramProgress

```typescript
interface MemberProgramProgress {
  memberId: string;
  programId: string;
  currentDayOrder: number;    // which day is next to execute
  totalSessions: number;      // total days in the program
  completedSessions: number;
  missedSessions: number;
  currentStreak: number;
  totalVolumeLifted: number;
  totalExercisesCompleted: number;
  lastSessionAt?: string;
}
```

---

## 3. Business Logic Rules

### 3.1 Program Progression

- Days progress sequentially: Day 1 → Day 2 → Day 3 → ...
- After completing the last day, the cycle restarts from Day 1
- Skipping a day still advances `currentDayOrder`
- A session is only marked `completed` when ALL exercises have at least one set logged

### 3.2 Volume Calculation

```
totalVolume = Σ (weightKg × actualReps) for all completed sets
```

### 3.3 Progress Comparison (Last Session Reference)

- For each exercise in a session, fetch the most recent `ExerciseLog` for the same `exerciseId` from any previous session
- Compare: average weight, average reps
- Display delta: `+5 kg` / `+2 reps` / `Same` / `-1 rep`

### 3.4 Streak Logic

- Streak increments if a session is completed within 48 hours of the previous one
- Streak resets on the second missed day (grace period: 1 day)

---

## 4. Trainer UX Flow

### 4.1 Create Program Flow

```
[Create Workout Program]
        │
        ▼
[Select Type]
  ┌─────┴─────┐
  │           │
General    Private
  │           │
  │     [Select Member]
  │           │
  └─────┬─────┘
        │
  [Enter Program Name]
        │
        ▼
  [Program Builder Screen]
  ┌─────────────────────┐
  │ + Add Day           │
  │                     │
  │ Day 1 — Push Day    │
  │   + Add Exercise    │
  │   └ Bench Press     │
  │     Sets: 4  Reps: 10│
  │                     │
  │ Day 2 — Pull Day    │
  │   + Add Exercise    │
  └─────────────────────┘
        │
  [Save Program]
```

### 4.2 Program Builder Screen — UI Spec

**Header:**

- Back button
- Title: "New Program" / Program name (editable inline)
- Save button (top right)

**Program Type Toggle:**

```
[ General ]  [ Private ]
```

If Private → member selector appears below

**Day List (vertical, draggable to reorder):**

```
┌─────────────────────────────┐
│ Day 1                    ⋮  │
│ Push Day              [edit]│
│                             │
│  Bench Press   4 × 10       │
│  Incline DB    3 × 12       │
│  Tricep Pushdown 3 × 15     │
│                             │
│  + Add Exercise             │
└─────────────────────────────┘

+ Add Day
```

**Exercise Picker:**

- Search bar (filter by name or muscle group)
- Grid or list of exercises from the Exercise Library
- Tap to select → immediately shows Sets/Reps inputs

**Sets/Reps Input:**

```
Bench Press
Sets  [4]   Target Reps  [10]
Notes (optional) ____________
```

---

## 5. Member UX Flow

### 5.1 Home Screen — Program Widget

Member opens the app → immediately sees:

```
┌──────────────────────────────┐
│  Today's Workout             │
│                              │
│  Day 2 — Pull Day            │
│  4 Exercises · ~45 min       │
│                              │
│  [████████░░░░]  12/36 Done  │
│                              │
│        [ Start Workout ]     │
└──────────────────────────────┘
```

### 5.2 Program Overview Screen

**Header:**

- Program Name
- "Created by Coach [name]"
- Assigned date

**Stats Card:**

```
┌──────────────────────────────┐
│  Progress                    │
│                              │
│     ◯ 33%                    │
│   12 / 36 Sessions           │
│   78 Exercises Completed     │
│   🔥 5 Day Streak            │
└──────────────────────────────┘
```

**Workout Days Timeline:**

```
✓  Day 1 — Push Day
✓  Day 2 — Pull Day
▶  Day 3 — Legs Day     ← CURRENT (highlighted)
○  Day 4 — Upper Body
○  Day 5 — Core & Cardio
```

States:

- `✓` completed — muted green
- `▶` current — Volt Green (#B3FF00) highlight
- `○` upcoming — dimmed, visible but not interactive until current is done

### 5.3 Workout Session Screen

**Session Header:**

```
Day 3 — Legs Day
◀ Back                    ⏱ 00:12:34

Exercise 2 of 4
[████████░░░░░░░░]
```

**Exercise Card:**

```
┌──────────────────────────────┐
│  Squat                       │
│  Target: 4 Sets × 10 Reps   │
│                              │
│  Set  Target  Weight  Reps  ✓│
│   1     10   [  kg ] [ # ] □ │
│   2     10   [  kg ] [ # ] □ │
│   3     10   [  kg ] [ # ] □ │
│   4     10   [  kg ] [ # ] □ │
│                              │
│  Last Session ────────────── │
│  80kg×10 / 80kg×10 / 85kg×8 │
│  ↑ +5 kg from last time      │
└──────────────────────────────┘
```

**Interaction Rules:**

- Tapping ✓ on a set marks it complete
- Weight input persists across sets (autofills next set with same weight)
- After all sets done → card collapses with ✓ animation → next exercise slides in

### 5.4 Session Completion Screen

```
┌──────────────────────────────┐
│                              │
│         🎉                   │
│   Workout Complete!          │
│   Day 3 — Legs Day           │
│                              │
│   Duration     48 min        │
│   Volume    5,240 kg         │
│   Exercises    4 / 4         │
│   Sets        16 / 16        │
│                              │
│  How did it feel?            │
│  [ Easy ] [Moderate] [Hard]  │
│           [Very Hard]        │
│                              │
│  Notes (optional)            │
│  ________________________    │
│                              │
│     [ Back to Home ]         │
└──────────────────────────────┘
```

---

## 6. Screen Inventory

|Screen|Role|Route (future)|
|---|---|---|
|Program Builder|Trainer|`/admin/programs/new`|
|Program List|Trainer|`/admin/programs`|
|Assign Program|Trainer|`/admin/programs/[id]/assign`|
|Exercise Library Picker|Trainer|`/admin/exercises`|
|Home Widget|Member|`/member/home`|
|Program Overview|Member|`/member/program`|
|Workout Session|Member|`/member/program/session`|
|Session Complete|Member|`/member/program/session/complete`|
|Progress & Stats|Member|`/member/progress`|

---

## 7. Notification Triggers

|Event|Message|
|---|---|
|Day starts (morning)|"Today is {dayTitle} 💪"|
|Streak at risk|"Don't break your {n}-day streak 🔥"|
|Trainer updates program|"Your trainer updated your workout plan"|
|New personal record|"New PR on {exercise}! 🏆"|
|Session completed|"Day {n} done. Great work 💥"|

---

## 8. Open Questions

- [ ] Can a member **skip** a day and still advance? (current answer: yes)
- [ ] Can a trainer **edit** a program after it's been assigned mid-cycle?
- [ ] Do we show **rest day** as an explicit day or just a gap?
- [ ] Is there a **max days** limit per program? (suggest: 30 days)
- [ ] Offline-first: session logs must be queued and synced when back online
