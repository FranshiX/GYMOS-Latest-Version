
# GymOS — PROJECT STATE v3.0
> Last updated: 2026-06-06
> Status: Phase 2 COMPLETE ✅ → Ready for Deploy

---

## CRITICAL CONTEXT (read this first)

GymOS  NOT just a gym managemisent system.
GymOS is a complete gym ecosystem that gives gym owners a competitive advantage.

**Positioning:**
> "Your gym becomes smarter — every member trains with a custom plan,
>  tracks their progress, feels valued, and renews automatically."

**Demo goal:** Convince ONE gym owner to buy the full product.
**Tech stack:** React + Vite + TypeScript + Tailwind v4 + Zustand + Recharts + i18next
**Deployed:** https://gym-q0t7gizmi-franshixs-projects.vercel.app
**Repo:** GitHub (gymOS)

---

## WHAT IS BUILT ✅ (DO NOT REBUILD)

### Phase 1 — Core Gym Management
- [x] EntryScreen — PIN 0000 for staff, phone for member
- [x] DashboardScreen — KPIs + AreaChart + PieChart + Alerts
- [x] MembersScreen — Search + Filter + MemberCard + MemberDrawer + Renew
- [x] CheckInScreen — GRANTED/DENIED + Today log
- [x] ReportsScreen — Revenue + Attendance + Membership + Expired tabs
- [x] SettingsScreen — Plans view + Language toggle
- [x] RegistrationModal — 3-step flow (info → plan → confirm)
- [x] MemberDrawer — Full membership details + Renew modal
- [x] MemberProfileScreen — Status + Stamps circle + Membership details + History

### Phase 2 — Training System ✅
- [x] Domain types — exercise, workout, workoutLog, measurement
- [x] Mock data — 20 exercises, 4 plans, 7 logs, 10 measurements
- [x] 4 New stores — useExerciseStore, useWorkoutPlanStore, useWorkoutLogStore, useMeasurementStore
- [x] ExerciseCard, SetLogger, StreakWidget, ProgressChart, MonthlyReportCard
- [x] ExerciseLibraryScreen — list + filter + search + add + delete
- [x] WorkoutPlansScreen — General/Custom tabs + create + delete
- [x] WorkoutPlanBuilder — days + exercises + sets/reps inline edit
- [x] MemberProgressScreen — streak + weight chart + exercise charts + session history
- [x] MyWorkoutScreen — member sees plan + days + streak
- [x] WorkoutDayScreen — exercises list + start/continue CTA
- [x] ExerciseDetailScreen — info + SetLogger + coach notes + video link
- [x] MyProgressScreen — 3 tabs (overview / exercises / body)
- [x] MeasurementsScreen — add + history + weight chart
- [x] Router — all Phase 2 routes
- [x] BottomNav — admin 6 items + member 3 items
- [x] AppShell — auto-detects role from URL
- [x] i18n — AR + EN Phase 2 keys

---

## FOLDER STRUCTURE (final)

```
src/
├── domain/
│   ├── member/types.ts
│   ├── membership/types.ts + membershipLogic.ts
│   ├── checkin/types.ts + checkinLogic.ts
│   ├── plan/types.ts
│   ├── payment/types.ts
│   ├── exercise/types.ts
│   ├── workout/types.ts
│   ├── workoutLog/types.ts
│   └── measurement/types.ts
├── store/
│   ├── useMemberStore.ts
│   ├── useMembershipStore.ts
│   ├── useCheckinStore.ts
│   ├── useDashboardStore.ts
│   ├── useExerciseStore.ts
│   ├── useWorkoutPlanStore.ts
│   ├── useWorkoutLogStore.ts
│   └── useMeasurementStore.ts
├── screens/
│   ├── entry/EntryScreen.tsx
│   ├── admin/
│   │   ├── DashboardScreen.tsx
│   │   ├── MembersScreen.tsx
│   │   ├── MemberDrawer.tsx
│   │   ├── RegistrationModal.tsx
│   │   ├── CheckInScreen.tsx
│   │   ├── ReportsScreen.tsx
│   │   ├── SettingsScreen.tsx
│   │   ├── ExerciseLibraryScreen.tsx
│   │   ├── WorkoutPlansScreen.tsx
│   │   ├── WorkoutPlanBuilder.tsx
│   │   └── MemberProgressScreen.tsx
│   └── member/
│       ├── MemberProfileScreen.tsx
│       ├── MyWorkoutScreen.tsx
│       ├── WorkoutDayScreen.tsx
│       ├── ExerciseDetailScreen.tsx
│       ├── MyProgressScreen.tsx
│       └── MeasurementsScreen.tsx
├── components/
│   ├── ui/ — Button, Input, Card, Badge, Drawer, Modal, EmptyState
│   ├── shared/
│   │   ├── StatusBadge, StampBar, KPICard, AlertRow
│   │   ├── ExerciseCard.tsx
│   │   ├── SetLogger.tsx
│   │   ├── StreakWidget.tsx
│   │   ├── ProgressChart.tsx
│   │   └── MonthlyReportCard.tsx
│   └── layout/
│       ├── AppShell.tsx   ← auto role detection
│       ├── Sidebar.tsx
│       ├── BottomNav.tsx  ← 6 admin + 3 member
│       └── TopBar.tsx
├── i18n/ — index.ts + ar.json + en.json
├── hooks/ — useDirection.ts + useMemberSearch.ts
├── utils/ — dateUtils.ts
├── data/
│   ├── members.json, plans.json, checkins.json, payments.json
│   ├── exercises.json
│   ├── workoutPlans.json
│   ├── workoutLogs.json
│   └── measurements.json
└── app/ — App.tsx, Router.tsx, main.tsx
```

---

## ROUTES (complete)

```
/                              → EntryScreen

/admin                         → redirect → /admin/dashboard
/admin/dashboard               → DashboardScreen
/admin/members                 → MembersScreen
/admin/members/:id/progress    → MemberProgressScreen
/admin/checkin                 → CheckInScreen
/admin/exercises               → ExerciseLibraryScreen
/admin/workouts                → WorkoutPlansScreen
/admin/workouts/:planId        → WorkoutPlanBuilder
/admin/reports                 → ReportsScreen
/admin/settings                → SettingsScreen

/member/:phone                 → MemberProfileScreen
/member/:phone/workout         → MyWorkoutScreen
/member/:phone/workout/:dayId  → WorkoutDayScreen
/member/:phone/exercise/:id    → ExerciseDetailScreen
/member/:phone/progress        → MyProgressScreen
/member/:phone/measurements    → MeasurementsScreen
```

---

## BUSINESS RULES

```
Membership:
  Expires when today > endDate OR stampsUsed >= stampsTotal
  stampsRemaining = stampsTotal - stampsUsed (never stored)
  Renewal starts on payment date, no carry-over

Training:
  GENERAL plans → visible to all members
  CUSTOM plans  → visible only to assignedMemberId
  Admin creates/edits plans and exercises
  Member logs sets (weight + reps)
  Streak = consecutive calendar days with at least 1 log

Deferred:
  MuscleBodyDiagram → Post-MVP
  CheckIn by admin only (not member)
  Plans READ-ONLY count = 3 fixed subscription plans
```

---

## FEATURES STATUS

| Feature | Status |
|---------|--------|
| Subscription management | ✅ |
| Check-in stamps | ✅ |
| Revenue dashboard | ✅ |
| AR/EN + RTL | ✅ |
| Exercise library (admin) | ✅ |
| Workout plans general | ✅ |
| Workout plans custom | ✅ |
| Plan builder (days + exercises) | ✅ |
| Member progress (admin view) | ✅ |
| My workout (member) | ✅ |
| Log weights per exercise | ✅ |
| Workout streak | ✅ |
| Progress charts | ✅ |
| Monthly summary report | ✅ |
| Body measurements | ✅ |
| Exercise video link | ✅ |
| Muscle body diagram | ⏸ Post-MVP |
| Leaderboard | ⏸ Post-MVP |
| RPE rating | ⏸ Future |
| Progress photos | ⏸ Future |
| Push notifications | ⏸ Future |
| Multi-branch | ⏸ Phase 3 |

---

## DEFINITION OF DONE ✅

- [x] Admin can build exercise library
- [x] Admin can create general + custom workout plans
- [x] Admin can view member progress
- [x] Member sees their workout plan
- [x] Member logs weights per exercise
- [x] Member sees their streak
- [x] Member sees monthly summary
- [x] Member sees progress charts
- [x] Member tracks body measurements
- [x] All above in AR + EN + RTL
- [ ] Deployed on Vercel ← NEXT STEP

---

## DEPLOY CHECKLIST

```bash
# 1. Final build check
npm run build

# 2. Push to GitHub
git add .
git commit -m "feat: Phase 2 Training System complete"
git push origin main

# 3. Vercel auto-deploys from main branch
# Check: https://gym-q0t7gizmi-franshixs-projects.vercel.app
```

---

## DEMO FLOW (للعرض على العميل)

### Admin Demo (PIN: 0000)
1. Dashboard → أرقام حية
2. Members → اختر عضو → Renew
3. Check-in → سجل دخول
4. Exercises → مكتبة التمارين → أضف تمرين
5. Workouts → أنشئ برنامج مخصص → ابنيه
6. Members → اختر m_01 → Progress → شوف التقدم

### Member Demo (phone: أي رقم من members.json)
1. My Workout → شوف البرنامج
2. اختر يوم → ابدأ التمرين
3. سجّل الأوزان
4. My Progress → Overview + Charts
5. Measurements → أضف قياسات

---

## PHASE 3 IDEAS (post-demo)

```
- Supabase backend (real data persistence)
- Push notifications (workout reminders)
- Leaderboard (attendance ranking)
- Progress photos
- RPE rating per set
- Multi-branch support
- Trainer app (separate role)
- Member mobile app (React Native)
