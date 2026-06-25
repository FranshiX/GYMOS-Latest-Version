# 11_MYPROGRESS_ROADMAP.md — MyProgressScreen Rebuild Roadmap

> Part of: Phase 2 — Member Core Rebuild
> Status: Not started. This is a plan, not a claim of progress.

---

## 1. CONFIRMED CURRENT STATE (via real code review of MyProgressScreen.tsx)

- Screen has 3 tabs: Overview, Exercises, Body.
- **Overview tab**: shows a streak card (real data, via `getStreakForMember`),
  then renders a *local* `MonthlyReportCard` component defined inside
  `MyProgressScreen.tsx` itself, which is a hardcoded stub:
  ```tsx
  const MonthlyReportCard: React.FC<{ memberId: string }> = ({ memberId }) => (
    <Card variant="default" padding="md">
      <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
        Monthly summary — {memberId}
      </p>
    </Card>
  )
  ```
  This shadows the real, fully-implemented component at
  `src/components/shared/MonthlyReportCard.tsx`, which already computes
  real KPIs (sessions this month, sets logged, best lift, weight change)
  and is never imported or used anywhere in this screen.
- **Exercises tab**: pulls up to 5 exercise IDs from the member's logs and
  renders a small recharts line chart per exercise via
  `getWeightProgressForExercise`. This logic appears real and functional —
  not yet manually verified on device.
- **Body tab**: renders a weight-over-time line chart from
  `getMeasurementsForMember`, plus a button linking to MeasurementsScreen.
  Appears real and functional — not yet manually verified on device.
- There is also a separate, unused shared component
  `src/components/shared/ProgressChart.tsx` that is never imported here —
  needs investigation to determine if it was meant to replace the inline
  recharts blocks (possible earlier abandoned refactor) or is unrelated.

---

## 2. EXPLICITLY REJECTED (do not suggest, do not add without the user asking again)

Following the same discipline as `07_WORKOUT_PLANS_ROADMAP.md`:

- ❌ Adding new analytics/metrics beyond what already exists in
  `MonthlyReportCard.tsx` and the existing tabs — fix what's broken first.
- ❌ Adding a 4th tab, filters, or date-range pickers — no requested need.
- ❌ Replacing recharts with another charting library — recharts is part
  of the approved stack.
- ❌ Redesigning the visual theme/colors — Volt Green/Tech Cyan OLED system
  is locked.
- ❌ Touching `MeasurementsScreen.tsx` or `MemberProfileScreen.tsx` as part
  of this file's work — out of scope, tracked separately in the DNA file.

---

## 3. PHASED TASK LIST

### Phase A — Fix the shadowed component (small, isolated, do first)
1. Remove the local stub `MonthlyReportCard` definition from
   `MyProgressScreen.tsx`.
2. Import the real `MonthlyReportCard` from
   `@/components/shared/MonthlyReportCard`.
3. Confirm the prop contract matches (`memberId: string`) — it does, per
   code review, so this should be a clean swap.
4. Manual test: open Overview tab for a member with at least one completed
   session this month and at least one measurement entry this month.
   Confirm real numbers appear (sessions, sets, best lift, weight change),
   not placeholder text.

### Phase B — Investigate ProgressChart.tsx
1. Before writing any fix, the coding LLM must determine: was
   `ProgressChart.tsx` ever wired up anywhere in the app? (grep usage
   across `src/`)
2. If unused and superseded by the inline recharts blocks: confirm with
   the architect persona before deleting — don't delete dead code
   silently without a decision logged here.
3. If it was intended to replace the inline charts in Exercises/Body tabs:
   that becomes its own Phase C task, not bundled into Phase A.

### Phase C — Manual verification of Exercises & Body tabs
1. Manually test Exercises tab with a member who has logged the same
   exercise across 2+ completed sessions — confirm the line chart shows
   real progression, not empty/broken state.
2. Manually test Body tab with 2+ measurement entries — confirm weight
   chart renders correctly.
3. These tabs are currently *assumed* functional from code review only —
   per the Verification Doctrine, "looks correct in code" is not the same
   as "confirmed working," so this phase is mandatory before this screen
   can be marked ✅ in any tracking document.

---

## 4. WHAT "DONE" MEANS FOR THIS FILE

This screen is only marked complete in `00_PROJECT_DNA.md` (once rewritten)
when:
- Phase A diff has been shown, reviewed, and manually tested ✅
- Phase B decision has been made and logged (fix, defer, or delete)
- Phase C manual tests have passed on a real device with real member data

Until then, status stays: **Not started.**
