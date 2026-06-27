# 00_HANDOFF_CONTEXT.md
> **LLM ENTRY POINT** — Read this first, then load only what Section 7
> of `00_PROJECT_DNA.md` tells you to load for the current task.
> Never load the full DNA unless explicitly told to.

---

## Current State (as of 2026-06-27)

**Phase 2 is functionally complete.**
All member-facing screens are implemented and wired to live store data.

### Active blockers (fix before anything else)

| ID | File | Issue |
|---|---|---|
| BUG-001 | `src/screens/member/MeasurementsScreen.tsx` | Unresolved Git merge conflict — build may break |
| BUG-002 | `src/screens/member/ExerciseDetailScreen.tsx` | `getLogsForMember(phone)` should be `getLogsForMember(member.id)` |

Full details in `manifest/99_KNOWN_ISSUES.md`.

### Last verified working

| Screen | Status |
|---|---|
| `MemberProfileScreen` | ✅ Working — KPICard untested on narrow physical device |
| `MyWorkoutScreen` | ✅ Working |
| `WorkoutDayScreen` | ✅ Working — identity bug fixed |
| `SessionCompleteScreen` | ✅ Working — identity bug fixed |
| `MyProgressScreen` | ✅ Working |
| `MeasurementsScreen` | ⚠️ Blocked by BUG-001 |
| `ExerciseDetailScreen` | ⚠️ Blocked by BUG-002 |

---

## How to load context for a task

1. Read this file (done).
2. Fix any active blocker that touches your task's files.
3. Open `00_PROJECT_DNA.md` Section 7 — load only the listed sections
   and domain files for your task type.
4. Begin.

---

## Next milestone

**Not yet decided.** Consult `05_ROADMAP.md` to pick the next phase.

---

## Critical rules (memorize before writing any code)

- `phone` is for URL routing only. All store calls use `member.id`.
  See DNA Section 3.
- Zero hardcoded Tailwind color classes. Colors via `var(--color-*)`.
  See DNA Section 4.
- All visible strings through `t()`. No bare literals in JSX.
  See DNA Section 6.
- Check DNA Section 5 before building any new component.
  It probably already exists.