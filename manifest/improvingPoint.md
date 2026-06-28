# Web Interface Guidelines Improvement Points

## src/components/ui/Button.tsx

src/components/ui/Button.tsx:62 - transition: all → list properties explicitly
src/components/ui/Button.tsx:63 - focus-visible:outline-none has replacement (ring) → acceptable

## src/components/ui/Card.tsx

src/components/ui/Card.tsx:65 - transition: all → list properties explicitly
src/components/ui/Card.tsx:58 - clickable card missing visible focus state

## src/components/ui/Input.tsx

src/components/ui/Input.tsx:40 - outline-none has replacement (focus:border + box-shadow) → acceptable
src/components/ui/Input.tsx:37 - missing autocomplete attribute
src/components/ui/Input.tsx:37 - missing spellCheck={false} for non-text inputs

## src/components/ui/Modal.tsx

src/components/ui/Modal.tsx:51 - icon button missing aria-label
src/components/ui/Modal.tsx:28 - missing overscroll-behavior: contain on modal container

## src/components/ui/Drawer.tsx

src/components/ui/Drawer.tsx:50 - icon button missing aria-label
src/components/ui/Drawer.tsx:24 - missing overscroll-behavior: contain on drawer container

## src/screens/admin/ExerciseLibraryScreen.tsx

src/screens/admin/ExerciseLibraryScreen.tsx:81 - <div onClick> should be <button>
src/screens/admin/ExerciseLibraryScreen.tsx:112 - <div onClick> should be <button>
src/screens/admin/ExerciseLibraryScreen.tsx:145 - <div onClick> should be <button>
src/screens/admin/ExerciseLibraryScreen.tsx:273 - <div onClick> should be <button>
src/screens/admin/ExerciseLibraryScreen.tsx:299 - <div onClick> should be <button>
src/screens/admin/ExerciseLibraryScreen.tsx:306 - <div onClick> should be <button>
src/screens/admin/ExerciseLibraryScreen.tsx:145 - icon button missing aria-label
src/screens/admin/ExerciseLibraryScreen.tsx:51 - icon button missing aria-label

## src/components/shared/SetLogger.tsx

src/components/shared/SetLogger.tsx:153 - type="number" missing inputmode="decimal"
src/components/shared/SetLogger.tsx:171 - type="number" missing inputmode="decimal"

## index.html

index.html:2 - missing color-scheme: dark on <html>

## Typography Issues (multiple files)

Multiple files - "..." should be "…" (ellipsis character)
- src/store/useWorkoutPlanStore.ts (23 occurrences)
- src/store/useWorkoutLogStore.ts (11 occurrences)
- src/screens/admin/WorkoutPlansScreen.tsx (7 occurrences)
- src/screens/admin/ReportsScreen.tsx (5 occurrences)
- src/screens/admin/ExerciseLibraryScreen.tsx (4 occurrences)
- src/components/shared/SetLogger.tsx (3 occurrences)
- src/screens/member/MeasurementsScreen.tsx (3 occurrences)
- src/store/useCheckinStore.ts (3 occurrences)
- src/store/useDashboardStore.ts (3 occurrences)
- src/store/useExerciseStore.ts (3 occurrences)
- src/store/useMeasurementStore.ts (3 occurrences)
- src/components/ui/Button.tsx (2 occurrences)
- src/components/ui/Input.tsx (2 occurrences)
- src/i18n/ar.json (2 occurrences)
- src/i18n/en.json (2 occurrences)
- src/screens/admin/RegistrationModal.tsx (2 occurrences)
- src/store/useMemberStore.ts (2 occurrences)
- src/store/useMembershipStore.ts (2 occurrences)
- src/domain/checkin/checkinLogic.ts (1 occurrence)
- src/screens/admin/CheckInScreen.tsx (1 occurrence)
- src/screens/admin/MemberProgressScreen.tsx (1 occurrence)
- src/screens/member/MyProgressScreen.tsx (1 occurrence)
- src/screens/member/WorkoutDayScreen.tsx (1 occurrence)

## Missing Accessibility Features

- No aria-live regions for async updates (toasts, validation)
- No tabular-nums for number columns/comparisons
- No text-wrap: balance or text-pretty on headings
- No Intl.DateTimeFormat for dates (uses date-fns)
- No Intl.NumberFormat for numbers/currency
- No translate="no" on brand names/code tokens

## Missing Performance Optimizations

- No list virtualization for large lists (>50 items)
- No content-visibility: auto on large containers
- No loading="lazy" on below-fold images
- No explicit width/height on <img> elements (prevents CLS)

## Missing Form Features

- No autocomplete attributes on inputs
- No spellCheck={false} on emails/codes/usernames
- No beforeunload or router guard for unsaved changes
- Placeholders may not end with "…"
