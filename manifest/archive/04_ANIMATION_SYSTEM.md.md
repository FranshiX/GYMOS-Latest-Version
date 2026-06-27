# 04_ANIMATION_SYSTEM.md — GymOS Animation System

> **Read `00_PROJECT_DNA.md` first.**
> **Read this file before writing any Framer Motion code.**

---

## 1. Philosophy

Every animation must earn its place.
Animation communicates meaning — it is not decoration.
When in doubt, do not animate.

Three questions before adding any animation:
1. Does it help the user understand what happened?
2. Does it feel instant enough to not slow the user down?
3. Does it work on a mid-range Android phone?

---

## 2. Token Reference

```css
--duration-fast:   150ms;   /* Micro interactions */
--duration-normal: 250ms;   /* Standard transitions */
--duration-slow:   400ms;   /* Page transitions, reveals */
--duration-slower: 600ms;   /* Completion celebrations only */

--ease-out:    cubic-bezier(0.0, 0.0, 0.2, 1);
--ease-in-out: cubic-bezier(0.4, 0.0, 0.2, 1);
--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
```

---

## 3. Framer Motion Presets

Copy these exactly. Do not invent new variants.

### 3.1 Page Transition (Screen Enter)

```tsx
// variants/pageVariants.ts
export const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -8 },
}

export const pageTransition = {
  duration: 0.25,
  ease: [0.0, 0.0, 0.2, 1],
}

// Usage — wrap every screen root div:
<motion.div
  variants={pageVariants}
  initial="initial"
  animate="animate"
  exit="exit"
  transition={pageTransition}
>
```

### 3.2 List Item Stagger (Cards, Exercise Lists)

```tsx
export const listContainerVariants = {
  animate: {
    transition: { staggerChildren: 0.06 }
  }
}

export const listItemVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.2 } },
}

// Usage:
<motion.div variants={listContainerVariants} initial="initial" animate="animate">
  {items.map(item => (
    <motion.div key={item.id} variants={listItemVariants}>
      <ItemCard />
    </motion.div>
  ))}
</motion.div>
```

### 3.3 Set Completion Checkmark

```tsx
export const checkVariants = {
  unchecked: { scale: 1, backgroundColor: 'var(--bg-elevated)' },
  checked: {
    scale: [1, 1.2, 1],
    backgroundColor: 'var(--color-success)',
    transition: { duration: 0.25, ease: [0.34, 1.56, 0.64, 1] }
  }
}
```

### 3.4 Exercise Card Collapse (After All Sets Done)

```tsx
export const collapseVariants = {
  open: { height: 'auto', opacity: 1 },
  collapsed: {
    height: 64,
    opacity: 0.6,
    transition: { duration: 0.3, ease: [0.4, 0.0, 0.2, 1] }
  }
}
```

### 3.5 Session Complete Celebration

```tsx
// Used ONLY on SessionCompleteScreen
export const celebrationVariants = {
  initial: { scale: 0.8, opacity: 0 },
  animate: {
    scale: 1,
    opacity: 1,
    transition: { duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }
  }
}

export const statsRevealVariants = {
  initial: { opacity: 0, y: 20 },
  animate: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.3 }
  })
}
```

### 3.6 Bottom Sheet / Drawer Slide Up

```tsx
export const drawerVariants = {
  hidden:  { y: '100%' },
  visible: {
    y: 0,
    transition: { duration: 0.35, ease: [0.0, 0.0, 0.2, 1] }
  },
  exit: {
    y: '100%',
    transition: { duration: 0.25, ease: [0.4, 0.0, 1, 1] }
  }
}
```

### 3.7 Micro Interaction — Button Press

```tsx
// Already handled by Tailwind: active:scale-95
// Use Framer Motion only when you need spring bounce:
<motion.button
  whileTap={{ scale: 0.94 }}
  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
>
```

---

## 4. Usage Map — Where Each Preset Is Used

| Preset | Used In |
|--------|---------|
| `pageVariants` | Every screen root element |
| `listContainerVariants` | WorkoutDayScreen, MembersScreen, ExerciseLibrary |
| `listItemVariants` | Exercise cards, member cards, day timeline items |
| `checkVariants` | SetLogger set completion |
| `collapseVariants` | Exercise card after completion in session |
| `celebrationVariants` | SessionCompleteScreen only |
| `statsRevealVariants` | SessionCompleteScreen stats |
| `drawerVariants` | MemberDrawer, any bottom sheet |

---

## 5. RTL Animation Rule

Slide animations must respect direction:

```tsx
import { useDirection } from '@/hooks/useDirection'

const { isRTL } = useDirection()

// Slide in from correct side:
const slideVariants = {
  initial: { x: isRTL ? -24 : 24, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit:    { x: isRTL ? 24 : -24, opacity: 0 },
}
```

---

## 6. Hard Rules

- ❌ No animation over 600ms — ever
- ❌ No parallax effects
- ❌ No continuous looping animations in lists
- ❌ No layout animations on inputs or form fields
- ✅ Always wrap animated lists in `AnimatePresence` when items can be removed
- ✅ Always respect `prefers-reduced-motion`
- ✅ Test on mid-range Android before finalizing any animation

```tsx
// AnimatePresence — required when items enter/leave DOM:
import { AnimatePresence } from 'framer-motion'

<AnimatePresence mode="wait">
  {items.map(item => (
    <motion.div key={item.id} variants={listItemVariants} exit={{ opacity: 0 }}>
      ...
    </motion.div>
  ))}
</AnimatePresence>
```