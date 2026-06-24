import { Routes, Route, Navigate } from 'react-router-dom'
import { AppShell } from '../components/layout/AppShell'

import { EntryScreen }           from '../screens/entry/EntryScreen'
import { DashboardScreen }       from '../screens/admin/DashboardScreen'
import { MembersScreen }         from '../screens/admin/MembersScreen'
import { CheckInScreen }         from '../screens/admin/CheckInScreen'
import { ReportsScreen }         from '../screens/admin/ReportsScreen'
import { SettingsScreen }        from '../screens/admin/SettingsScreen'
import { ExerciseLibraryScreen } from '../screens/admin/ExerciseLibraryScreen'
import { WorkoutPlansScreen }    from '../screens/admin/WorkoutPlansScreen'
import { WorkoutPlanBuilder }    from '../screens/admin/WorkoutPlanBuilder'
import { MemberProgressScreen }  from '../screens/admin/MemberProgressScreen'
import { MemberProfileScreen }   from '../screens/member/MemberProfileScreen'
import { MyWorkoutScreen }       from '../screens/member/MyWorkoutScreen'
import WorkoutDayScreen          from '../screens/member/WorkoutDayScreen'      // default import
import ExerciseDetailScreen      from '../screens/member/ExerciseDetailScreen'  // default import
import SessionCompleteScreen     from '../screens/member/SessionCompleteScreen' // default import
import { MyProgressScreen }      from '../screens/member/MyProgressScreen'
import { MeasurementsScreen }    from '../screens/member/MeasurementsScreen'

export function Router() {
  return (
    <Routes>
      <Route path="/" element={<EntryScreen />} />

      <Route path="/admin" element={<AppShell />}>
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard"            element={<DashboardScreen />} />
        <Route path="members"              element={<MembersScreen />} />
        <Route path="members/:id/progress" element={<MemberProgressScreen />} />
        <Route path="checkin"              element={<CheckInScreen />} />
        <Route path="exercises"            element={<ExerciseLibraryScreen />} />
        <Route path="workouts"             element={<WorkoutPlansScreen />} />
        <Route path="workouts/:planId"     element={<WorkoutPlanBuilder />} />
        <Route path="reports"              element={<ReportsScreen />} />
        <Route path="settings"             element={<SettingsScreen />} />
      </Route>

      <Route path="/member/:phone" element={<AppShell />}>
        <Route index                      element={<MemberProfileScreen />} />
        <Route path="workout"             element={<MyWorkoutScreen />} />
        <Route path="workout/:dayId"      element={<WorkoutDayScreen />} />
        <Route path="workout/:dayId/complete" element={<SessionCompleteScreen />} />
        <Route path="exercise/:id"        element={<ExerciseDetailScreen />} />
        <Route path="progress"            element={<MyProgressScreen />} />
        <Route path="measurements"        element={<MeasurementsScreen />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}