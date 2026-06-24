# GymOS - Gym Management System

A modern, mobile-first gym management application built with React, TypeScript, and Vite. Features workout planning, member management, check-in tracking, and progress monitoring with full Arabic/English support.

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- npm (comes with Node.js)

### Installation

1. **Clone the repository:**
```bash
git clone <repository-url>
cd gymOS-main
```

2. **Install dependencies:**
```bash
npm install
```

3. **Run the development server:**
```bash
npm run dev
``` 

4. **Open in browser:**
The app will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

---

## 📁 Project Structure

```
gymOS-main/
├── src/
│   ├── app/              # App components and routing
│   ├── components/       # Reusable UI components
│   │   ├── shared/       # Shared components (Button, Card, etc.)
│   │   └── ui/           # UI-specific components
│   ├── data/             # JSON data files (members, plans, etc.)
│   ├── domain/           # Type definitions
│   ├── hooks/            # Custom React hooks
│   ├── i18n/             # Translation files (en.json, ar.json)
│   ├── screens/          # Screen components
│   │   ├── admin/        # Admin screens (Dashboard, Members, etc.)
│   │   ├── entry/        # Entry screen (PIN/Phone login)
│   │   └── member/       # Member screens (Workout, Progress, etc.)
│   ├── store/            # Zustand state management
│   ├── utils/            # Utility functions
│   ├── App.tsx           # Main app component
│   ├── main.tsx          # Entry point
│   └── index.css         # Global styles with design tokens
├── manifest/             # Roadmap and documentation files
├── public/               # Static assets
├── package.json          # Dependencies and scripts
├── vite.config.ts        # Vite configuration
└── tsconfig.json         # TypeScript configuration
```

---

## 🛠️ Tech Stack

- **Framework:** React 19 with TypeScript
- **Build Tool:** Vite
- **Styling:** TailwindCSS v4 with custom design tokens
- **State Management:** Zustand v5
- **Routing:** React Router
- **Animations:** Framer Motion
- **Internationalization:** i18next (Arabic/English)
- **Icons:** Lucide React
- **PWA:** Vite PWA Plugin

---

## 🎨 Design System

The app uses a custom design system with CSS variables defined in `index.css`:

- **Colors:** Primary, secondary, success, danger, warning colors
- **Backgrounds:** Base, card, elevated backgrounds
- **Text:** Primary, secondary, tertiary text colors
- **Borders:** Default, subtle borders
- **Spacing:** Consistent spacing tokens
- **Typography:** Hanken Grotesk (English), IBM Plex Arabic (Arabic)

---

## 🌍 Internationalization

The app supports Arabic (RTL) and English (LTR):

- Translation files: `src/i18n/en.json` and `src/i18n/ar.json`
- Language switching via `i18next`
- Automatic RTL layout direction
- All UI strings must use `t('key')` function

---

## 📱 Screens

### Entry Screen
- Staff PIN login
- Member phone login
- Role-based navigation

### Admin Screens
- **Dashboard:** KPI cards, expiring members alerts
- **Members:** Member list with search/filter, member details drawer
- **Check-In:** Grant/deny member check-in with animation feedback
- **Workout Plans:** Plan management with search, preview, duplicate, sorting
- **Workout Builder:** Create/edit workout plans with days and exercises
- **Reports:** Monthly reports with charts

### Member Screens
- **My Workout:** Today's workout, program progress, workout days timeline
- **Workout Day:** Exercise list with set logging, session timer
- **Session Complete:** Session summary, perceived exertion, notes
- **My Progress:** Strength charts, streak widget
- **Measurements:** Weight chart, body measurements log
- **Member Profile:** Membership status, quick stats, navigation

---

## 🔧 How to Modify the App

### Adding a New Screen

1. Create screen file in `src/screens/` (e.g., `src/screens/admin/NewScreen.tsx`)
2. Add route in `src/app/Router.tsx`
3. Add navigation entry in appropriate component
4. Add translation keys in `src/i18n/en.json` and `src/i18n/ar.json`

### Adding a New Component

1. Create component in `src/components/shared/` or `src/components/ui/`
2. Use design tokens from `index.css`
3. Add TypeScript types in `src/domain/`
4. Export and use in screens

### Modifying State

The app uses Zustand for state management. Stores are in `src/store/`:

- `useMemberStore` - Member data
- `useMembershipStore` - Membership data
- `useCheckinStore` - Check-in data
- `useWorkoutPlanStore` - Workout plan data

### Adding Translations

1. Add key to `src/i18n/en.json`
2. Add corresponding Arabic translation to `src/i18n/ar.json`
3. Use in component: `t('your.key')`

---

## 📋 Roadmap

See `manifest/05_ROADMAP.md.md` for the main development roadmap.

**Phase 1 — UI & Workout System:** ✅ Complete
- Foundation, Shared Components, Workout System, Member Screens, Admin Screens, PWA & Performance

**Phase 2 — Backend & Auth:** ❌ Not Started
- Backend API, Authentication, Push notifications, Progress photos

**Workout Plans Enhancement:** ✅ Complete
- See `manifest/07_WORKOUT_PLANS_ROADMAP.md` for details

---

## 🤖 For AI/LLM Assistants

### Important Rules

1. **Read the roadmap first:** Always check `manifest/05_ROADMAP.md.md` before starting any task
2. **Work on one task at a time:** Do not combine tasks without approval
3. **Follow the roadmap strictly:** Do not add tasks not listed in the roadmap
4. **Use design tokens:** Always use CSS variables from `index.css`, no hardcoded colors
5. **Translate everything:** All strings must use `t()` function with translations in both languages
6. **RTL support:** Use logical properties (`start`/`end`) instead of `left`/`right`
7. **Build after changes:** Always run `npm run build` to verify changes
8. **Mobile-first:** Design for mobile screens first, desktop second

### Key Files to Understand

- `manifest/05_ROADMAP.md.md` - Main development roadmap
- `manifest/07_WORKOUT_PLANS_ROADMAP.md` - Workout plans specific roadmap
- `src/index.css` - Design system tokens
- `src/i18n/en.json` - English translations
- `src/i18n/ar.json` - Arabic translations
- `src/utils/variants.ts` - Animation presets

### Common Patterns

**Screen Structure:**
```tsx
import { motion } from 'framer-motion'
import { pageVariants, pageTransition } from '@/utils/variants'

export function ScreenName() {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      transition={pageTransition}
      className="min-h-screen"
      style={{ background: 'var(--color-bg-base)' }}
    >
      {/* Screen content */}
    </motion.div>
  )
}
```

**Using Translations:**
```tsx
import { useTranslation } from 'react-i18next'

export function Component() {
  const { t } = useTranslation()
  return <p>{t('your.translation.key')}</p>
}
```

**Using Design Tokens:**
```tsx
// Colors
style={{ color: 'var(--color-text-primary)', background: 'var(--color-bg-card)' }}

// Spacing
className="p-4 gap-3"

// Borders
style={{ border: '1px solid var(--border-default)' }}
```

---

## 🐛 Troubleshooting

### Build Errors

If you get TypeScript errors:
1. Check that all imports are correct
2. Verify types in `src/domain/`
3. Run `npm run build` to see full error details

### Translation Errors

If a translation key is missing:
1. Check `src/i18n/en.json` and `src/i18n/ar.json`
2. Add the missing key to both files
3. Restart the dev server

### Styling Issues

If styles don't apply:
1. Check that design tokens are used correctly
2. Verify TailwindCSS classes
3. Check `index.css` for token definitions

---

## 📝 License

This project is private and proprietary.

---

## 👥 Support

For questions or issues, refer to the roadmap files in the `manifest/` directory or contact the development team.

