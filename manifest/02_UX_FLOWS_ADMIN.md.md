# 02_UX_FLOWS_ADMIN.md — Admin (Trainer) UX Flows

> **Read `00_PROJECT_DNA.md` first.**
> **Read `06_WORKOUT_SYSTEM.md` before touching workout builder screens.**
> LLM: This file defines WHAT each admin screen does and HOW the trainer moves through it.
> Do not add flows not listed here.

---

## 1. Entry → Admin Area
EntryScreen (/)  
└── Staff taps "Staff Access"  
└── PIN input (4 digits)  
├── Correct (1234) → navigate('/admin/dashboard')  
└── Wrong → shake animation + clear PIN
---

## 2. Admin Navigation Structure

### Desktop (md and above)
Sidebar — persistent left rail

### Mobile (below md)
Bottom navigation — 6 items (small label, 9px font)

| Tab | Route |
|-----|-------|
| Dashboard | `/admin/dashboard` |
| Members | `/admin/members` |
| Check-in | `/admin/checkin` |
| Workouts | `/admin/workouts` |
| Reports | `/admin/reports` |
| Settings | `/admin/settings` |

---

## 3. DashboardScreen (`/admin/dashboard`)

### Purpose
At-a-glance gym health. No actions taken here — read only.

### Layout
┌─────────────────────────────────┐  
│ KPI Grid (2×2) │  
│ ┌──────────┬──────────┐ │  
│ │ Total │ Active │ │  
│ │ Members │ Members │ │  
│ ├──────────┼──────────┤ │  
│ │ Expiring │ Today's │ │  
│ │ Soon │ Check-ins│ │  
│ └──────────┴──────────┘ │  
├─────────────────────────────────┤  
│ Expiring Soon — Alert List │  
│ [Member] expires in 3 days │  
│ [Member] expires in 5 days │  
└─────────────────────────────────┘

### Data Source
`useDashboardStats()` hook — computes from members + memberships + checkins

### Current State
- Functional ✅
- Needs KPI card visual upgrade (Task 5.1)

---

## 4. MembersScreen (`/admin/members`)

### Purpose
Browse, search, and filter all members. Register new members.

### Layout
┌─────────────────────────────────┐  
│ [Search...________] [+ Add] │  
├─────────────────────────────────┤  
│ [All] [Active] [Expiring] [Exp]│ ← filter chips with counts  
├─────────────────────────────────┤  
│ Member Card │  
│ [A] Ahmed Ali [ACTIVE] │  
│ 0507654321 │  
│ ■■■■■■■■░░ Plan Name │  
│ 28 days remaining │  
└─────────────────────────────────┘
### Member Card States
| Status | Border color | Badge |
|--------|-------------|-------|
| ACTIVE | subtle | green |
| EXPIRING_SOON | warning | yellow |
| EXPIRED | danger | red |

### Tap Member Card → MemberDrawer (bottom sheet)
MemberDrawer shows:
- Full membership details
- Renew membership option
- Navigate to member progress
- Navigate to member's workout

### Current State
- Functional ✅
- Needs card animation (listItemVariants) (Task 5.2)
- MemberDrawer exists and works ✅

---

## 5. MemberDrawer (bottom sheet)

### Purpose
Quick view of member details without leaving MembersScreen.

### Sections
- Member header (name, phone, avatar)
- Membership status + dates
- Stamp bar
- Actions: View Progress / Assign Workout / Renew

### Current State
- Functional ✅
- Needs design polish

---

## 6. CheckInScreen (`/admin/checkin`)

### Purpose
Process member check-ins by phone number. Show instant result.

### Flow
[Phone Input] → [Check In button]  
│  
▼  
processCheckInByPhone(phone)  
│  
┌───┴───┐  
GRANTED DENIED  
│ │  
Green Red  
feedback feedback  
│ │  
Auto-clear after 3s


### Feedback Display
- GRANTED: green card, member name, stamps remaining, ✓ animation
- DENIED: red card, reason (expired / not found)

### Current State
- Functional ✅
- Needs grant/deny animation upgrade (Task 5.3)

---

## 7. WorkoutPlansScreen (`/admin/workouts`)

### Purpose
List all workout programs. Create new. Tap to edit.

### Layout
┌─────────────────────────────────┐  
│ Workout Programs [+ Create] │  
├─────────────────────────────────┤  
│ [General] [Private] │ ← filter tabs  
├─────────────────────────────────┤  
│ Push Pull Legs │  
│ General · 3 Days │  
│ │  
│ Ahmed's Custom Plan │  
│ Private · Ahmed Ali · 5 Days │  
└─────────────────────────────────┘
### Navigation
- Tap plan → `WorkoutPlanBuilder` (`/admin/workouts/:planId`)
- "+ Create" → create new plan → `WorkoutPlanBuilder` (new)

### Current State
- Functional ✅
- Needs visual polish

---

## 8. WorkoutPlanBuilder (`/admin/workouts/:planId`)

### Purpose
Create or edit a workout program day by day.

### Flow
[Program Name — editable inline]  
[General] / [Private + member selector]  
│  
├── Day 1 — Push Day  
│ Bench Press 4 × 10 [edit] [delete]  
│ Incline DB 3 × 12 [edit] [delete]  
│ + Add Exercise  
│  
├── Day 2 — Pull Day  
│ ...  
│  
└── + Add Day  
│  
[Save Program]
### Exercise Picker (modal/drawer)
- Search bar
- Filter by muscle group
- Tap exercise → set Sets + Reps → confirm → added to day

### Critical UX Rules (from `06_WORKOUT_SYSTEM.md`)
- Days labeled as "Day 1", "Day 2" — NOT Monday/Tuesday
- No weeks, no calendar, no periodization
- General and Private programs feel identical — only difference is member selector

### Current State
- Exists and works ✅
- UX needs cleanup to match philosophy (Task 3.5)
- Day ordering is correct ✅
- Exercise picker exists ✅

---

## 9. ExerciseLibraryScreen (`/admin/exercises`)

### Purpose
Browse and manage the exercise library.

### Layout
- Search + muscle group filter
- Exercise grid/list
- Tap → exercise detail + edit
- + Add new exercise

### Current State
- Functional ✅
- Needs visual polish only

---

## 10. MemberProgressScreen (`/admin/members/:id/progress`)

### Purpose
Trainer views a specific member's progress.

### Sections
- Weight progress chart
- Strength progress per exercise
- Session history

### Current State
- Functional ✅
- Needs polish

---

## 11. ReportsScreen (`/admin/reports`)

### Purpose
Revenue and attendance overview.

### Current State
- Exists ✅
- Revenue values are hardcoded to 0 (no payment data model wired yet)
- Low priority for Phase 1

---

## 12. SettingsScreen (`/admin/settings`)

### Purpose
App settings — language toggle, PIN change (future).

### Current State
- Basic ✅
- Low priority for Phase 1
