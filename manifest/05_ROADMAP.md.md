# 05_ROADMAP.md — GymOS Development Roadmap

> **Read `00_PROJECT_DNA.md` first.**
> LLM: Do not start any task not listed here.
> Do not add tasks. Do not combine tasks without approval.

---

## Phase 1 — UI & Workout System (Active)

Goal: Elevate UI from acceptable to excellent.
Build the workout execution system end to end.
No backend. No auth. Mobile-first.

---

### Block 1 — Foundation (Do First)

- [✓] **1.1** Apply `index.css` with full token system + legacy aliases
- [✓] **1.2** Add Google Fonts import to `index.html`
      (Hanken Grotesk, IBM Plex Arabic, Inter, JetBrains Mono)
- [✓] **1.3** Install Framer Motion
      `npm install framer-motion`
- [✓] **1.4** Create `src/utils/variants.ts`
      Copy all presets from `04_ANIMATION_SYSTEM.md` exactly

---

### Block 2 — Shared Components Upgrade

- [✓] **2.1** Upgrade `Button.tsx` — add glow effect on primary variant
- [✓] **2.2** Upgrade `Card.tsx` — align with new token names
- [✓] **2.3** Upgrade `BottomNav.tsx` — add Framer Motion active indicator
- [✓] **2.4** Upgrade `TopBar.tsx` — mobile-first height and spacing
- [✓] **2.5** Create `src/components/ui/ProgressRing.tsx`
      Animated SVG circular progress — used in workout and member profile

---

### Block 3 — Workout System (Core Priority)

Read `06_WORKOUT_SYSTEM.md` before starting any task in this block.

- [✓] **3.1** Rebuild `WorkoutDayScreen.tsx`
      — Show day title, exercise list, set logging inline
      — No navigation to separate exercise screen during session
      — Session timer
      — Uses `listItemVariants` for exercise cards

- [✓] **3.2** Build `SetLogger` component (real, not placeholder)
      — Located: `src/components/shared/SetLogger.tsx`
      — Inputs: weight + reps per set
      — Tap to complete set → `checkVariants` animation
      — Shows last session data below each exercise

- [✓] **3.3** Build `SessionCompleteScreen.tsx`
      — Located: `src/screens/member/SessionCompleteScreen.tsx`
      — Shows: duration, volume, exercises, sets
      — Perceived exertion selector
      — Uses `celebrationVariants`
      — Add route: `/member/:phone/workout/:dayId/complete`

- [✓] **3.4** Rebuild `MyWorkoutScreen.tsx`
      — Today's workout card (large, prominent)
      — Program progress ring
      — Days timeline (✓ / current / upcoming)
      — Uses `pageVariants` + `listItemVariants`

- [✓] **3.5** Rebuild `WorkoutPlanBuilder.tsx` (Trainer)
      — Day-based structure (Day 1, Day 2...)
      — Inline exercise picker
      — Sets/Reps inputs per exercise
      — General vs Private program toggle

---

### Block 4 — Member Screens Polish

- [✓] **4.1** Rebuild `MemberProfileScreen.tsx`
      — Membership status card
      — Quick stats
      — Navigation to workout + progress

- [✓] **4.2** Polish `MyProgressScreen.tsx`
      — Strength charts per exercise
      — Streak widget upgrade

- [✓] **4.3** Polish `MeasurementsScreen.tsx`
      — Weight chart
      — Body measurements log

---

### Block 5 — Admin Screens Polish

- [✓] **5.1** Polish `DashboardScreen.tsx`
      — KPI cards with new design tokens
      — Expiring members alert list

- [✓] **5.2** Polish `MembersScreen.tsx`
      — Member cards with status colors
      — Search + filter bar

- [✓] **5.3** Polish `CheckInScreen.tsx`
      — Grant / Deny animation feedback

---

### Block 6 — PWA & Performance

- [✓] **6.1** Configure Serwist offline strategy
- [✓] **6.2** Add install prompt UI
- [✓] **6.3** Audit mobile touch targets (minimum 44×44px)
- [✓] **6.4** Audit and fix any RTL layout issues

---

## Phase 2 — Backend & Auth (Future)

> Do not start Phase 2 until Phase 1 Block 3 is fully complete.

- [ ] Design backend API schema
- [ ] Swap `src/services/` from JSON adapters to API calls
- [ ] Add authentication (Trainer PIN → real auth, Member login)
- [ ] Push notifications for workout reminders
- [ ] Progress photos storage

---

## Phase 3 — Workout Plans Screen Enhancement (New)

> See `07_WORKOUT_PLANS_ROADMAP.md` for detailed roadmap

- [ ] Sprint 1: UI Polish & Translation
- [ ] Sprint 2: Search & Sorting
- [ ] Sprint 3: Advanced Features
- [ ] Sprint 4: UX Improvements

---

## Rules For LLM

- Work on ONE task at a time (e.g. task 3.1 only)
- When task is done, stop and report what was completed
- Do not jump to next task without instruction
- Do not modify files outside the current task scope
- If a task requires a new file, state the file path before creating it
- Current active task is always communicated by the user