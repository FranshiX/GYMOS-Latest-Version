# 00_PROJECT_DNA.md — GymOS Project DNA

> **Read this file first before any task.**
> **Do not proceed to any other file until this one is fully understood.**

---

## 1. What Is This Project

GymOS is a Progressive Web App (PWA) for gym management.
It serves two roles: Trainer (Admin) and Member.
It is built to work on mobile devices as the primary target.
It supports Arabic (RTL) and English (LTR) languages.

---

## 2. Tech Stack — Final & Locked

| Concern | Solution |
|---------|----------|
| Framework | React 19 + Vite 8 |
| Language | TypeScript (strict, no `any`) |
| Styling | Tailwind v4 + CSS custom properties |
| State | Zustand v5 |
| Animation | Framer Motion |
| Routing | React Router v7 |
| i18n | i18next + react-i18next |
| PWA | vite-plugin-pwa + Serwist |
| Icons | Lucide React (strokeWidth 1.5) |
| Data (Phase 1) | Static JSON files in `src/data/` |

**This stack is final. Do NOT suggest or introduce:**
- ❌ Next.js
- ❌ TanStack Query
- ❌ shadcn/ui
- ❌ Redux or any other state manager
- ❌ Any new library not listed above without explicit approval

---

## 3. Project Structure — Enforced

src/  
├── app/ # Bootstrap only — App.tsx, Router.tsx, main.tsx  
├── components/  
│ ├── ui/ # Atomic primitives — Button, Card, Input, Modal...  
│ ├── layout/ # AppShell, TopBar, BottomNav, Sidebar  
│ └── shared/ # Cross-feature components  
├── domain/ # Pure TypeScript only — NO React imports ever  
├── services/ # Data abstraction layer — reads JSON, later reads API  
├── store/ # Zustand stores only  
├── hooks/ # Custom React hooks  
├── screens/  
│ ├── admin/ # Trainer-facing screens  
│ ├── member/ # Member-facing screens  
│ └── entry/ # EntryScreen  
├── data/ # Static JSON mock data (Phase 1)  
├── i18n/ # Translation files + i18n config  
└── utils/ # Pure functions — no React, no stores

-----
---

## 4. Hard Rules — Never Break These

### Code Rules
- No `any` in TypeScript — ever
- No business logic inside screen components
- No direct JSON imports inside screens or components
- Domain layer (`src/domain/`) has zero React imports
- Every new data model must have a TypeScript interface in `src/domain/`
- CSS values come from tokens only — no hardcoded hex colors in components

### Architecture Rules
- Screens call hooks or stores — never raw data
- Services are the only layer that touches `src/data/`
- Zustand stores call services — not JSON directly (migrate progressively)
- New features follow the existing folder structure — no new top-level folders

### UI Rules
- All icons use `strokeWidth={1.5}`
- All spacing uses CSS logical properties (`margin-inline-start` not `margin-left`)
- RTL is handled via `[dir="rtl"]` CSS — not via JS conditionals in components
- Framer Motion is used for: page transitions, list items, completion states
- No animation exceeds 400ms duration

### LLM Behavior Rules
- You are assigned ONE task at a time
- Do not modify files outside the scope of your current task
- Do not create new files unless explicitly listed in the task
- Do not add features that are not in the task description
- If something is unclear, state what is unclear — do not assume
- Read the relevant manifest file for the feature before writing any code

---

## 5. Design System — Summary

Full details in `01_DESIGN_SYSTEM.md`.

| Token | Value |
|-------|-------|
| `--color-primary` | #B3FF00 (Volt Green) |
| `--color-secondary` | #00E5FF (Tech Cyan) |
| `--bg-base` | #080808 |
| `--bg-surface` | #121212 |
| `--bg-card` | #1A1A1A |
| `--bg-elevated` | #242424 |
| `--text-primary` | #F0F0F0 |
| `--text-secondary` | #A8A8A8 |
| `--text-tertiary` | #6A6A6A |

Legacy aliases exist — `--color-brand` = `--color-primary`, etc.
Full alias map is in `src/index.css`.

---

## 6. Roles & Routes

| Role | Entry | Base Path |
|------|-------|-----------|
| Trainer / Admin | PIN code | `/admin/*` |
| Member | Phone number | `/member/:phone/*` |

---

## 7. Current Phase

**Phase 1 — Active**

Focus: UI quality, workout system rebuild, mobile responsiveness.
Data: Static JSON only.
No backend. No authentication system. No payment gateway.

See `05_ROADMAP.md` for full phase breakdown.

---

## 8. Manifest File Index

Read the relevant file before working on any feature:

| File                     | Read When                                    |
| ------------------------ | -------------------------------------------- |
| `00_PROJECT_DNA.md`      | Before every task                            |
| `01_DESIGN_SYSTEM.md`    | Before touching any UI component             |
| `02_UX_FLOWS_ADMIN.md`   | Before working on any admin screen           |
| `02_UX_FLOWS_MEMBER.md`  | Before working on any member screen          |
| `03_ARCHITECTURE_MAP.md` | Before creating files or modifying structure |
| `04_ANIMATION_SYSTEM.md` | Before adding any Framer Motion code         |
| `05_ROADMAP.md`          | Before starting any new task                 |
| `06_WORKOUT_SYSTEM.md`   | Before touching workout-related code         |