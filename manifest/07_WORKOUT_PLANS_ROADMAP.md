# 07_WORKOUT_PLANS_ROADMAP.md — Workout Plans Screen Deep Roadmap

> **Status**: Active — Standalone Roadmap
> **Relationship to other manifest files**: This file OVERRIDES Task 3.5 in
> `05_ROADMAP.md` for the WorkoutPlansScreen + WorkoutPlanBuilder specifically.
> Treat Task 3.5 in `05_ROADMAP.md` as "see 07_WORKOUT_PLANS_ROADMAP.md instead."
>
> **Why this file exists**: This screen is the heart of gymOS. The user has
> identified it as functionally incomplete, not just visually unpolished.
> This file authorizes deeper feature work than other Phase 1 screens.
>
> ⚠️ **CRITICAL RULE FOR LLM**: Do NOT start any task in this file unless the
> user explicitly says "start task 7.X" or names this file directly. Do not
> jump between phases. Do not start Phase 2 until the user confirms Phase 1
> is approved and complete.

---

## Scope Boundary

This roadmap covers TWO files only:
- `src/screens/admin/WorkoutPlansScreen.tsx`
- `src/screens/admin/WorkoutPlanBuilder.tsx`

Do not modify any other screen while working through this file.

---

## Current State Assessment

### What's Working ✅
- List all workout programs (General/Custom)
- Filter tabs (General/Custom)
- Create new program via modal
- Edit program (navigate to WorkoutPlanBuilder)
- Delete program with confirmation
- Member assignment for Custom programs

### What's Missing — Real Functional Gaps ⚠️
- No way to find a plan quickly once there are 15+ plans (no search)
- No way to know which plan a member is actually using without opening it
- No way to reuse a good plan structure for a new member (no duplicate)
- No quick way to see plan content without entering full edit mode
- Visual hierarchy doesn't communicate plan health/usage at a glance
- Empty state gives no guidance to a new trainer

---

## Phase 1 — UI Polish & Translation

*(Approved — proceed when instructed)*

### Task 7.1 — Apply Design System Tokens
- [✓] Replace all legacy/hardcoded colors with design system tokens
- [✓] Apply spacing tokens consistently
- [✓] Apply typography scale from `01_DESIGN_SYSTEM.md`
- [✓] Add `pageVariants` transition on screen mount
- [✓] Confirm RTL via `dir` attribute works correctly

**Notes:**
- Replaced `var(--color-brand)` → `var(--color-primary)`
- Replaced `var(--color-bg-primary)` → `var(--color-bg-base)`
- Replaced `var(--color-bg-secondary)` → `var(--color-bg-card)`
- Replaced `var(--color-bg-border)` → `var(--border-default)`
- Replaced `var(--color-text-muted)` → `var(--color-text-tertiary)`
- Removed `useDirection` hook, using `i18n.dir()` instead
- Added `pageVariants` and `pageTransition` for screen mount
- Added `listItemVariants` for plan cards with staggered animation
- Added `AnimatePresence` for delete confirm overlay
- Added `strokeWidth={1.5}` to all icons
- Build succeeded with exit code 0

### Task 7.2 — Complete Translation
- [✓] Audit every hardcoded string in both files
- [✓] Add missing keys to `en.json` and `ar.json`
- [✓] Verify RTL layout (icon mirroring, text alignment)

**Notes:**
- WorkoutPlansScreen.tsx: Replaced hardcoded placeholders with t() calls
  - `plans.name_ar_placeholder` / `plans.name_en_placeholder`
- WorkoutPlanBuilder.tsx: Replaced hardcoded strings with t() calls
  - `builder.day_name` / `builder.day_name_en` (with {{num}} interpolation)
  - `builder.delete_day_confirm`
  - `builder.search_exercise_placeholder`
- Added all missing keys to en.json and ar.json
- RTL layout verified: using `i18n.dir()` for dir attribute
- Build succeeded with exit code 0

### Task 7.3 — Polish Plan Cards
- [✓] Add type indicator (General vs Custom) — icon + color, not just text
- [✓] Show day count visually (e.g. small dot row, not just "5 days")
- [✓] For Custom plans: show assigned member's name + avatar initial
- [✓] Show "Last updated" relative date (e.g. "3 days ago")
- [✓] Use `listItemVariants` for card entrance animation

**Notes:**
- Added type indicator: Custom plans show member avatar initial, General plans show Dumbbell icon
- Day count shown as dots (up to 5 dots, with +N for more)
- Custom plans display assigned member name with User icon
- Added relative date formatting (today, yesterday, X days/weeks/months ago)
- Added createdAt and updatedAt fields to WorkoutPlan type
- listItemVariants already added in Task 7.1
- Build succeeded with exit code 0

### Task 7.4 — Improve Empty State
- [✓] Use the shared `EmptyState` component (already exists in `components/ui/`)
- [✓] Icon: Dumbbell or similar from Lucide
- [✓] Message: clear, encouraging, in both languages
- [✓] CTA button: "Create First Plan" → opens create modal directly

**Notes:**
- Enhanced EmptyState component to support CTA button with label and onClick
- Replaced inline empty state with EmptyState component in WorkoutPlansScreen
- Added Dumbbell icon for visual appeal
- Added translation keys: `plans.empty_title`, `plans.empty_subtitle`, `plans.create_first`
- CTA button opens create modal directly via `setShowForm(true)`
- Build succeeded with exit code 0

**Phase 1 Complete ✅**
- All 4 tasks in Phase 1 completed successfully
- Build stable with no TypeScript errors
- Ready for user review before proceeding to Phase 2

---

## Phase 2 — Functional Gaps (The Real Fix)

*(Requires explicit "start phase 2" instruction)*

### Task 7.5 — Search
- [✓] Search input in header, searches name (AR + EN)
- [✓] For Custom plans, also search by assigned member name
- [✓] Debounced (300ms), case-insensitive
- [✓] Clear button (×) appears when text is entered

**Notes:**
- Added search bar with Search icon in header
- Search filters by name_ar and name_en (case-insensitive)
- For Custom plans, also searches by assigned member name
- Debounced search with 300ms delay
- Clear button (X) appears when text is entered
- Empty state shows "No results found" when search yields empty
- Added translation keys: `plans.search_placeholder`, `plans.no_results`, `plans.no_results_subtitle`
- Build succeeded with exit code 0

### Task 7.6 — Quick Preview (Read-Only)
- [✓] Tapping a card (not an action button) opens a bottom-sheet preview
- [✓] Preview shows: name, type, day list with exercise counts, assigned member
- [✓] Preview does NOT allow editing — it's read-only
- [✓] Actions inside preview: "Edit" (→ builder) and "Duplicate"
- [✓] This solves: "see plan content without entering full edit mode"

**Notes:**
- Added bottom-sheet preview modal with slide-up animation
- Preview shows: plan name, type, assigned member (for custom plans), day list with exercise counts
- Preview is read-only — no editing allowed
- Actions: Edit button navigates to builder, Duplicate button (placeholder for Task 7.7)
- PlanRow is now clickable with motion.div, action buttons stop propagation
- Added translation keys: `plans.preview_title`, `plans.name`, `plans.type`, `plans.edit`, `plans.duplicate`
- Build succeeded with exit code 0

### Task 7.7 — Duplicate Plan
- [✓] Action available from card menu and from preview
- [✓] Deep-copies all days and exercises with new IDs
- [✓] New name: `"{original name} (Copy)"` in both languages
- [✓] Duplicated plan defaults to General type regardless of source
      (so duplicating a member's custom plan doesn't accidentally
      reassign it — trainer must explicitly assign again)
- [✓] Navigates to `WorkoutPlanBuilder` for the new copy after creation

**Notes:**
- Added duplicatePlan function to useWorkoutPlanStore
- Deep-copies all days and exercises with new IDs using Date.now() + random
- New name: Arabic suffix " (نسخة)", English suffix " (Copy)"
- Duplicated plan defaults to GENERAL type, assignedMemberId cleared
- Duplicate button added to PlanRow (text label "Copy")
- Duplicate button also available in preview modal
- Navigates to WorkoutPlanBuilder for the new copy after creation
- Build succeeded with exit code 0

### Task 7.8 — Sorting
- [✓] Sort dropdown: Name / Last Updated / Day Count
- [✓] Ascending/Descending toggle
- [✓] Persist choice in localStorage (UI preference only, not app data)

**Notes:**
- Added sortBy state ('name' | 'updated' | 'dayCount') and sortDirection state ('asc' | 'desc')
- Sort button cycles through sort options (Name → Updated → Day Count → Name)
- Sort logic applies to filtered plans before rendering
- Sort preferences persisted in localStorage (workoutPlans_sortBy, workoutPlans_sortDirection)
- Sort preferences loaded on mount from localStorage
- Added translation keys: `plans.sort_by_name`, `plans.sort_by_updated`, `plans.sort_by_day_count`
- Build succeeded with exit code 0

**Phase 2 Complete ✅**
- All 4 tasks in Phase 2 completed successfully
- Build stable with no TypeScript errors
- Ready for user review before proceeding to Phase 3

---

## Phase 3 — Quality of Life

*(Requires explicit "start phase 3" instruction — likely deferred)*

### Task 7.9 — Quick Actions Menu
- [✓] Three-dot menu per card: Edit, Duplicate, Delete
- [✓] Mobile: slide-up action sheet
- [✓] Desktop: dropdown menu
- [✓] Replaces any currently exposed inline delete button for cleaner cards

**Notes:**
- Replaced inline action buttons (Edit, Copy, Delete) with three-dot menu
- Menu shows as dropdown with Edit, Duplicate, Delete options
- Menu uses Framer Motion for smooth open/close animation
- Menu stops event propagation to prevent card click
- Menu closes when an action is selected
- Used text dots "•••" for menu button icon
- Build succeeded with exit code 0

### Task 7.10 — Plan Usage Indicator
- [✗] Skipped — Member type lacks activeWorkoutPlanId field
      (roadmap assumed field exists, but data model doesn't include it)
- [✗] Would require adding activeWorkoutPlanId to Member type (data model change)

**Notes:**
- Task requires activeWorkoutPlanId field on Member type to track which plan each member uses
- Current Member type only has: id, fullName, phone, joinDate, activeMembershipId
- Roadmap states "no new data model needed" but field doesn't exist
- Cannot implement without adding the field, which would be a data model change
- Skipped to avoid unauthorized data model modifications

**Phase 3 Gate**: Re-evaluate necessity after Phase 2 ships. Do not assume
these are needed — confirm with user first.

---

## Explicitly Rejected — Do Not Build

These were considered and intentionally cut. Do not suggest them again
unless the user brings them up first:

- ❌ Plan sharing between gyms — out of scope, no multi-gym concept exists
- ❌ Plan versioning / rollback — adds data model complexity with no
     proven need yet; revisit only if trainers report losing work
- ❌ Plan analytics / completion rates — requires backend aggregation,
     belongs in Phase 2 of `05_ROADMAP.md` (real backend), not here
- ❌ Drag & drop reordering of plans — plans are filtered/sorted, not
     manually ordered; no clear use case
- ❌ Archiving — delete with confirmation already exists; archiving adds
     a new state with no clear payoff yet
- ❌ Favorites/pinning — speculative, not a reported pain point
- ❌ Bulk actions (multi-select delete/duplicate) — premature until plan
     count is actually large enough to need it

---

## Implementation Order

1. **Phase 1** (7.1 → 7.4) — UI polish, translation, card design, empty state
2. **Phase 2** (7.5 → 7.8) — search, preview, duplicate, sort
3. **Phase 3** (7.9 → 7.10) — only if still needed after Phase 2

---

## Success Criteria

### Phase 1
- [ ] Zero hardcoded colors remain in either file
- [ ] Zero hardcoded strings remain — full AR/EN coverage
- [ ] Cards animate in on screen load
- [ ] Empty state guides a new trainer to action

### Phase 2
- [ ] Finding a specific plan among 20+ takes under 5 seconds
- [ ] Trainer can preview a plan's content without entering edit mode
- [ ] Trainer can duplicate a plan in under 3 taps

---

## Notes

- This screen gets more attention than other Phase 1 screens — that is
  intentional, not scope creep, because the user identified it as the
  functional core of the app.
- Every Phase 2+ task must trace back to one of the "Functional Gaps"
  listed above. If a future idea doesn't fix a named gap, it goes in
  "Explicitly Rejected" instead of being added quietly.