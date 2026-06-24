# 08_AUDIT_CHECKLIST.md — Post-Implementation Verification Pass

> **Status**: Active
> **Purpose**: Verify that completed tasks (Manifest 00-07) actually work
> as specified — not just that code was written.
> **Rule**: This is a VERIFICATION task, not a development task.
> Do NOT write new features here. Only confirm, list bugs, or flag gaps.

---

## Why This File Exists

7 manifest files were completed. The user reports the app "works but
feels incomplete" without being able to name why. This is the signal
that completion was declared by the LLM without human verification.

This file forces a systematic walk-through of every promised behavior,
screen by screen, against what was actually specified.

---

## How To Use This File

For each item below:
1. Open the actual running app (not the code) on a real mobile screen
2. Try the exact interaction described
3. Mark: ✅ Works as specified / ⚠️ Works but feels off / ❌ Broken or missing
4. If ⚠️ or ❌ — write one sentence describing what's wrong, no fixing yet

Do this for BOTH languages (Arabic RTL + English LTR) and on an actual
phone screen size, not desktop browser resized.

---

## Section A — Member Workout Flow (Highest Risk)

This is the most complex flow built. Walk through it as if you are a
real member with no prior knowledge of the app.

- [ ] Open MyWorkoutScreen — does "Today's Workout" card show the
      CORRECT next day, not day 1 every time?
- [ ] Progress ring/bar on MyWorkoutScreen — does the number match
      actual completed sessions, or is it stuck/wrong?
- [ ] Timeline (✓ / current / upcoming) — tap an upcoming day.
      Does it correctly block you, or does it let you in?
- [ ] Tap "Start Workout" — does WorkoutDayScreen open the CORRECT day?
- [ ] Inside a session — enter a weight, enter reps, tap the checkmark.
      Does it actually save? Refresh the page — is it still there?
- [ ] Complete one full exercise (all sets) — does it collapse and
      move to the next one automatically, or do you have to navigate?
- [ ] Look at "Last Session" data under an exercise — is it showing
      REAL previous data, or is it empty/wrong/showing today's data?
- [ ] Complete ALL exercises in a day — does SessionCompleteScreen
      actually appear? Or does nothing happen?
- [ ] On SessionCompleteScreen — is the duration/volume/exercise count
      ACCURATE, or hardcoded/wrong?
- [ ] Tap "Back to Home" — does it return correctly, and does
      MyWorkoutScreen now show this day as ✓ completed?
- [ ] Repeat the entire flow in Arabic — does every screen mirror
      correctly (RTL), and is every string translated?

## Section B — Trainer Workout Builder

- [ ] Create a new General program — does it save and appear in the list?
- [ ] Create a new Private program — does the member selector work,
      and does it actually assign to that specific member only?
- [ ] Add a day, add an exercise, set sets/reps — save — reopen the
      program. Is everything still there exactly as entered?
- [ ] Delete a day — does it actually remove it, or just hide it visually?
- [ ] Assign a Custom plan to a member — open that member's
      MyWorkoutScreen — does the assigned plan actually show there?

## Section C — Workout Plans Screen (07 Roadmap)

- [ ] Search a plan by name — does it filter in real time?
- [ ] Search a Custom plan by member name — does that work too,
      or only plan name search works?
- [ ] Open Quick Preview — does it show real data, all days, all
      exercises — or partial/wrong data?
- [ ] Duplicate a plan — open the duplicate. Are ALL days and
      exercises actually copied, or just the plan shell?
- [ ] Sort by "Last Updated" — does it actually reorder, or does
      nothing visually change?

## Section D — Design System Consistency

- [ ] Pick 5 random screens. Do they all use the SAME shade of
      background, or do some still show old/different colors?
- [ ] Check every screen in Arabic — is the font actually
      IBM Plex Arabic, or did some screens slip back to Inter?
- [ ] Check spacing — do cards/buttons feel consistent across
      screens, or does one screen feel cramped/different?

## Section E — Data Integrity (Silent Killer)

- [ ] Log out and back in (re-enter the same phone number) — is
      ALL previous data (logs, streak, measurements) still there?
- [ ] Open the same member's progress from BOTH the member view
      AND the admin's MemberProgressScreen — do the numbers MATCH?
- [ ] Check the streak number — does it actually reset correctly
      if you skip 2+ days, or does it stay wrong forever?

---

## Output Format

After walking through everything, produce a simple list:
✅ WORKS: [list]

⚠️ WORKS BUT FEELS OFF: [list + one-line reason each]

❌ BROKEN OR MISSING: [list + one-line reason each]

Do not fix anything yet. Just produce this list and bring it back.
