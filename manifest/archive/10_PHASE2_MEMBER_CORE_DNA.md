# 10_PHASE2_MEMBER_CORE_DNA.md — Phase 2: Member Core Rebuild

> **Era name**: Phase 2 — Member Core Rebuild
> **Starts after**: 09_CRITICAL_FIX_PLAN.md fully closed and manually verified
> (Fix 6, Fix 7, Fix 8, and the memberId/phone identity bug are all confirmed
> working on real device, with real member data — Layla Khalid, m-04)

---

## 1. WHY THIS ERA EXISTS

The workout execution flow (MyWorkoutScreen → WorkoutDayScreen →
SessionCompleteScreen) is now functionally correct and verified. That flow
was the most complex, highest-risk part of the app (real timer, session
persistence, idempotency, streak logic, identity consistency).

What's left are three screens that are simpler in logic but currently the
weakest part of the app visually and functionally — described by the
developer as **"the soul of the app, but currently the worst screens."**
This era exists to bring them up to the same standard of correctness and
polish as the workout flow.

---

## 2. SCOPE — SCREENS INCLUDED

| Screen | File | Priority | Known state (verified by code review, not assumption) |
|---|---|---|---|
| MyProgressScreen | `src/screens/member/MyProgressScreen.tsx` | **1 — start here** | Has a real, fully-implemented `MonthlyReportCard` component (`src/components/shared/MonthlyReportCard.tsx`) with real KPI math, but the screen shadows it with a local dummy stub that renders static placeholder text. Real component is never used. |
| MeasurementsScreen | `src/screens/member/MeasurementsScreen.tsx` | 2 | Has a `bodyFat` input field in the form, but `handleSubmit` never includes it in the `addMeasurement` call — entered data is silently discarded. Also the open simplification request (weight-only) from a previous session is still pending. |
| MemberProfileScreen | `src/screens/member/MemberProfileScreen.tsx` | 3 | Relatively complete and functional already. Mainly needs a responsiveness pass (shares the `grid-cols-3` narrow-screen risk flagged in the CSS backlog), not a rebuild. |

---

## 3. CARRIED-OVER RULES (do not relax these for this era)

- **Verification Doctrine still applies in full.** No screen in this era is
  marked done until: real code shown (diffs, not summaries) → architect
  review → real manual test on device → only then ✅.
- **No "Fixed ✅" claims from the coding LLM** — only "Applied — awaiting
  verification".
- **One screen at a time.** Do not let MeasurementsScreen or
  MemberProfileScreen work start while MyProgressScreen is still open,
  even if the user is eager to move faster.
- All roadmap files, prompts, and code comments for this era are written
  in **English**, regardless of the spoken language used in conversation.

---

## 4. BACKLOG — LOGGED, NOT FORGOTTEN, NOT YET SCHEDULED

These are real, confirmed issues that are deliberately NOT part of this
era's active work yet. They are written here so they survive a manifest
rewrite and are not lost to fatigue or context-window resets.

1. **Global responsive CSS issue** — confirmed root cause: header
   containers (`TopBar.tsx`, and the custom header inside
   `WorkoutDayScreen.tsx`) use `flex justify-between` without `min-w-0` /
   `flex-1` / `truncate` on the title-containing side. On very narrow
   screens (~320px), this can push trailing elements (back button,
   language toggle, session timer) off-edge or cause clipping. Also
   present as a general risk pattern in any `grid-cols-3`/`grid-cols-4`
   layout with KPI-style cards (seen in `CheckInScreen.tsx`,
   `MemberProfileScreen.tsx`). Not yet scheduled — explicitly deferred
   per the user's decision, but kept in this DNA file so it is not
   dropped from the project's memory.
2. **MeasurementsScreen simplification** — open request to reduce the
   form to weight (kg) only, removing body fat %, chest, waist, hips.
   This is now reinforced by the discovery that `bodyFat` is already
   silently broken (see Section 2) — strengthens the case for removing
   it rather than fixing it.
3. **SessionCompleteScreen duration accuracy** — never independently
   verified whether displayed duration matches real wall-clock time.
   Low risk, dismissed once already by the user. Not reopened unless it
   resurfaces naturally.

---

## 5. NEXT FILE

See `11_MYPROGRESS_ROADMAP.md` for the detailed, screen-specific roadmap
for MyProgressScreen — the first active task of this era.
