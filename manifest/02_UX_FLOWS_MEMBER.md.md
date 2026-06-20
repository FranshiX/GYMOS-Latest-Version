# 02_UX_FLOWS_MEMBER.md — Member UX Flows

> **Read `00_PROJECT_DNA.md` first.**
> **Read `06_WORKOUT_SYSTEM.md` before touching any workout screen.**
> LLM: This file defines WHAT the screen does and HOW the user moves through it.
> Do not add flows that are not listed here.

---

## 1. Entry → Member AreaEntryScreen (/)  
└── User enters phone number  
├── Found → navigate(`/member/:phone`)  
└── Not found → shake animation + error message
---

## 2. Member Tab Structure

Bottom navigation — 3 tabs only:

| Tab | Icon | Route |
|-----|------|-------|
| Workout | Dumbbell | `/member/:phone/workout` |
| Progress | Activity | `/member/:phone/progress` |
| Profile | User | `/member/:phone` |

---

## 3. MyWorkoutScreen (`/member/:phone/workout`)

### Purpose
Answer one question: "What should I do right now?"

### Data Sources
- `useWorkoutPlanStore` → get member's assigned plan (CUSTOM first, fallback to GENERAL)
- `useWorkoutLogStore` → get logs to determine current day + completion status
- `useWorkoutLogStore.getStreakForMember` → streak count

### Layout (top to bottom)
┌─────────────────────────────────┐  
│ Welcome back, [Name] │ ← greeting header  
├─────────────────────────────────┤  
│ 🔥 Streak Widget │ ← StreakWidget component  
├─────────────────────────────────┤  
│ TODAY'S WORKOUT │  
│ ┌───────────────────────────┐ │  
│ │ Day 3 — Legs Day │ │ ← featured card (large)  
│ │ 5 Exercises · ~45 min │ │  
│ │ [████████░░] 2/5 done │ │  
│ │ │ │  
│ │ [ Start Workout ] │ │ ← primary CTA  
│ └───────────────────────────┘ │  
├─────────────────────────────────┤  
│ MY PROGRAM │  
│ ✓ Day 1 — Push Day │ ← completed (muted green)  
│ ✓ Day 2 — Pull Day │ ← completed (muted green)  
│ ▶ Day 3 — Legs Day │ ← CURRENT (volt green highlight)  
│ ○ Day 4 — Upper Body │ ← upcoming (dimmed)  
│ ○ Day 5 — Core │ ← upcoming (dimmed)  
└─────────────────────────────────┘
### Day Status Logic
A day is `completed` if a WorkoutLog exists for that dayId with today's date OR any prior date
Current day = first day with no completed log
Upcoming = all days after current

### Navigation
- Tap featured card OR "Start Workout" → `WorkoutDayScreen`
- Tap any day in timeline → `WorkoutDayScreen` for that day
- Current day is always tappable
- Completed days are tappable (to review)
- Upcoming days are NOT tappable (locked)

### Current State (what exists)
- Shows streak widget ✅
- Shows plan days list ✅
- "Today" detection is based on log date — needs fix (should be based on sequence, not calendar date)
- No featured "Today's Workout" hero card ❌ — must be added in Task 3.4
- No progress ring ❌ — must be added in Task 3.4
- Upcoming days are tappable (bug) — must be fixed in Task 3.4

---

## 4. WorkoutDayScreen (`/member/:phone/workout/:dayId`)

### Purpose
Execute the workout. Log sets inline. No navigation away during session.

### Data Sources
- `useWorkoutPlanStore` → find day by `dayId` across all plans
- `useWorkoutLogStore` → `startLog`, `updateSetLog`, `addExerciseLog`, `getTodayLog`
- `useExerciseStore` → exercise names + details
- `useWorkoutLogStore.getLogsForMember` → last session data per exercise

### Layout
┌─────────────────────────────────┐  
│ ← Back Day 3 — Legs Day │  
│ Exercise 2/4 ⏱ 12:34 │  
│ [████████░░░░░░░] │  
├─────────────────────────────────┤  
│ SQUAT │  
│ Target: 4 Sets × 10 Reps │  
│ │  
│ Set Target Weight Reps ✓ │  
│ 1 10 [ 80 kg] [ 10] [✓] │  
│ 2 10 [ 80 kg] [ ] [ ] │  
│ 3 10 [ kg] [ ] [ ] │  
│ 4 10 [ kg] [ ] [ ] │  
│ │  
│ ── Last Session ── │  
│ 80kg×10 / 80kg×10 / 85kg×8 │  
│ ↑ +5 kg from last time │  
├─────────────────────────────────┤  
│ BENCH PRESS ✓ Done │ ← collapsed (completed)  
├─────────────────────────────────┤  
│ LAT PULLDOWN │ ← upcoming (locked until current done)  
│ 4 Sets × 12 Reps │  
└─────────────────────────────────┘

### Interaction Rules
1. Session starts → `startLog()` is called once, logId stored in local state
2. User fills weight + reps for a set → inputs update local state
3. User taps ✓ on a set → `updateSetLog()` called → checkmark animates (checkVariants)
4. Weight autofills from previous set when user moves to next set
5. When ALL sets of an exercise are completed → card collapses (collapseVariants) → next exercise expands
6. When ALL exercises completed → navigate to `SessionCompleteScreen`
7. Back button → confirm dialog "End workout?" before navigating away

### Last Session Display
- Fetch last `ExerciseLog` for same `exerciseId` from `getLogsForMember`
- Show: `[weight]kg × [reps]` per set
- Show delta vs current session avg weight: `+5 kg` / `Same` / `-2 kg`

### Session Timer
- `useState` + `useEffect` with `setInterval` — counts up from 00:00
- Displayed in header
- Value passed to `SessionCompleteScreen` on finish

### Current State (what exists)
- Shows exercise list ✅
- Navigates to ExerciseDetailScreen per exercise ❌ — WRONG, must be rebuilt (Task 3.1)
- No inline set logging ❌
- No session timer ❌
- No last session data inline ❌
- SetLogger is a placeholder ❌ — must be built (Task 3.2)

---

## 5. SessionCompleteScreen (`/member/:phone/workout/:dayId/complete`)

### Purpose
Celebrate completion. Show stats. Collect feedback.

### Data Sources
- Props/state passed from `WorkoutDayScreen`: duration, totalVolume, exerciseCount, setCount
- `useWorkoutLogStore.finishLog` → mark log as complete

### Layout
┌─────────────────────────────────┐  
│ │  
│ 🎉 │ ← celebrationVariants animation  
│ Workout Complete! │  
│ Day 3 — Legs Day │  
│ │  
│ ┌──────────┬──────────┐ │  
│ │ 48 min │ 5,240 kg │ │ ← statsRevealVariants (staggered)  
│ │ Duration │ Volume │ │  
│ ├──────────┼──────────┤ │  
│ │ 4 │ 16 │ │  
│ │Exercises │ Sets │ │  
│ └──────────┴──────────┘ │  
│ │  
│ How did it feel? │  
│ [Easy] [Moderate] [Hard] [💀] │  
│ │  
│ Notes (optional) │  
│ [________________________] │  
│ │  
│ [ Back to Home ] │  
└─────────────────────────────────┘

### Actions
- Perceived exertion selection → stored in WorkoutLog
- Notes → stored in WorkoutLog
- "Back to Home" → navigate to `/member/:phone/workout` (replace, not push)

### New Route Required
Add to `Router.tsx`:
```tsx
<Route path="workout/:dayId/complete" element={<SessionCompleteScreen />} />
```

### Current State
- Does not exist ❌ — must be built (Task 3.3)

---

## 6. MemberProfileScreen (`/member/:phone`)

### Purpose
Identity + membership status. Quick navigation hub.

### Layout (current — acceptable, needs token cleanup only)
- Avatar with status color
- Member name + phone
- Status badge
- Stamp circle + stamp bar
- Stats grid: days remaining / streak / sessions
- Membership details card
- Quick nav: Workout button + Progress button
- Recent check-in activity

### Current State
- Fully functional ✅
- Needs design token cleanup (Task 4.1)
- Uses hardcoded color `rgba(99,102,241...)` in some places — replace with tokens

---

## 7. MyProgressScreen (`/member/:phone/progress`)

### Purpose
Show improvement over time across 3 tabs.

### Tabs
| Tab | Content |
|-----|---------|
| Overview | Streak + MonthlyReportCard |
| Exercises | Weight progress charts per exercise |
| Body | Weight chart + body measurements |

### Current State
- Structure exists ✅
- MonthlyReportCard is a placeholder ❌
- Charts work but need styling polish (Task 4.2)

---

## 8. MeasurementsScreen (`/member/:phone/measurements`)

### Purpose
Log and track body measurements over time.

### Current State
- Functional ✅
- Needs design polish (Task 4.3)

---

## 9. i18n Keys — Workout System (Missing Keys to Add)

The following keys are needed and must be added to both `en.json` and `ar.json`:

```json
// en.json additions
{
  "workout": {
    "session_complete": "Workout Complete!",
    "session_duration": "Duration",
    "session_volume": "Total Volume",
    "session_exercises": "Exercises",
    "session_sets": "Sets",
    "session_feedback": "How did it feel?",
    "session_notes": "Notes (optional)",
    "session_notes_placeholder": "Felt strong today...",
    "feedback_easy": "Easy",
    "feedback_moderate": "Moderate",
    "feedback_hard": "Hard",
    "feedback_very_hard": "Very Hard",
    "back_to_home": "Back to Home",
    "end_workout_confirm": "End workout? Progress will be saved.",
    "set_number": "Set",
    "target_reps": "Target",
    "weight_kg": "Weight (kg)",
    "actual_reps": "Reps",
    "last_session": "Last Session",
    "improvement": "Improvement",
    "no_previous_data": "No previous data",
    "exercise_complete": "Exercise Complete",
    "today_workout": "Today's Workout",
    "exercises_remaining": "Exercises Remaining",
    "est_duration": "~{{min}} min"
  }
}
```

```json
// ar.json additions
{
  "workout": {
    "session_complete": "!اكتمل التمرين",
    "session_duration": "المدة",
    "session_volume": "إجمالي الحجم",
    "session_exercises": "التمارين",
    "session_sets": "الجولات",
    "session_feedback": "كيف كان تمرينك؟",
    "session_notes": "ملاحظات (اختياري)",
    "session_notes_placeholder": "شعرت بقوة اليوم...",
    "feedback_easy": "سهل",
    "feedback_moderate": "متوسط",
    "feedback_hard": "صعب",
    "feedback_very_hard": "صعب جداً",
    "back_to_home": "العودة للرئيسية",
    "end_workout_confirm": "إنهاء التمرين؟ سيتم حفظ تقدمك.",
    "set_number": "الجولة",
    "target_reps": "الهدف",
    "weight_kg": "الوزن (كغ)",
    "actual_reps": "التكرارات",
    "last_session": "آخر جلسة",
    "improvement": "التحسن",
    "no_previous_data": "لا توجد بيانات سابقة",
    "exercise_complete": "اكتمل التمرين",
    "today_workout": "تمرين اليوم",
    "exercises_remaining": "تمارين متبقية",
    "est_duration": "~{{min}} دقيقة"
  }
}
```
