# 09_CRITICAL_FIX_PLAN.md — User Screen Roadmap & Bugfix Strategy

Purpose
- Provide a prioritized, phased roadmap to fix the broken user screen, eliminate recurring bugs, and deliver incremental UX improvements.
- Audience: developers, QA, and LLM/agent contributors tasked with diagnosing and fixing UI defects.

Summary (1-line)
- Stabilize the user screen, eliminate top UX blockers within 2 sprints, and deliver progressive enhancements while preventing regressions.

Context
- User screen is currently "broken": layout shifts, input/save failures, inconsistent state after navigation, and intermittent errors reported by users.
- Previous fix phases were completed but issues remain — likely root causes include race conditions, missing state reconciliation, edge-case data, and flaky tests.

Top observed problems (investigative ideas)
1. Layout & responsiveness
   - CSS cascade conflicts and missing container constraints causing overflow and layout shifts on narrow viewports.
   - Inconsistent usage of responsive utilities vs hard-coded widths.
2. State management & synchronization
   - Stale UI after API updates: local state not reconciling with server responses; optimistic updates not rolled back on failure.
   - Race conditions when multiple components update shared store (e.g., global user object or form cache).
3. Forms & input handling
   - Form submit sometimes fails silently (no toast/error). Missing centralized form error handling.
   - Validation differences between client and server causing inconsistent save behavior.
4. Navigation & lifecycle
   - Navigating back/forward leaves stale state or duplicated listeners; unmounted components attempt setState updates.
5. Performance & perceived slowness
   - Heavy initial bundle or unnecessary re-renders triggered by expensive selectors.
6. Flaky tests & CI
   - UI tests that pass locally but fail in CI due to timing assumptions or mocked network behavior.
7. Logging & observability gaps
   - Insufficient client-side telemetry to trace user flows leading to failure (network, console errors, user actions).

Goals & success criteria
- Critical bug fixes: all high-priority user-facing defects resolved (no data loss, UI not broken) — measured by user reproduction tests and QA signoff.
- Regression safety: existing tests pass; new tests added for fixed flows.
- Observability: errors produce clear logs and breadcrumbs in bug reports.

Roadmap (phased)
Phase 0 — Triage (1-2 days)
- Reproduce top 5 user-reported bugs locally and in a staging environment.
- Collect browser console logs, network traces, and screenshots/video repros (use puppeteer/playwright recording if possible).
- Add temporary feature-flag to disable risky experimental UI if present.
- Deliverable: triage report with reproduction steps, failing test ids, and assigned owners.

Phase 1 — Stabilize state & error handling (3-5 days)
- Add centralized API wrapper that normalizes responses and errors; ensure all UI code uses it.
- Implement consistent error surface (toasts/modal) and centralized form error handling.
- Fix optimistic update rollback for failed saves.
- Add defensive checks to avoid setState on unmounted components.
- Create unit tests for form save/rollback behavior.
- Deliverable: PR(s) with fixes and tests; QA checklist.

Phase 2 — Fix layout & responsiveness (2-4 days, parallel with Phase 1)
- Audit top-level layout components and remove conflicting CSS rules; enforce container max-widths and flex/grid properly.
- Replace hard-coded widths with responsive units or utility classes.
- Add visual regression tests for critical screens (pixel diff, Storybook snapshots).
- Deliverable: style fixes, screenshots before/after, regression tests.

Phase 3 — Concurrency & race-condition hardening (3-5 days)
- Add request de-duplication and cancellation (AbortController) for stale requests.
- Use stable locks or sequence numbers when applying async responses to shared state.
- Make critical operations idempotent on server if possible.
- Deliverable: fixes, integration tests simulating concurrent updates.

Phase 4 — Performance & UX polish (2-4 days)
- Optimize heavy selectors and memoize derived data; profile renders and fix re-render hotspots.
- Lazy-load non-critical components and reduce initial bundle where feasible.
- Improve loading states and skeletons to reduce perceived slowness.
- Deliverable: profiling report, PR with optimizations.

Phase 5 — Observability & testing hardening (2-4 days)
- Add client-side breadcrumbs and structured error logs for key user flows; forward to existing telemetry/bug tracker.
- Harden UI tests: convert flaky tests to deterministic ones, add robust waits with network stubbing.
- Add end-to-end smoke tests for save/load flows in CI.
- Deliverable: telemetry dashboard items, stable E2E tests passing in CI.

Phase 6 — Release & postmortem (1-2 days)
- Release to canary group; monitor metrics and error rates for 48-72 hours.
- Roll forward or rollback based on errors; capture postmortem and action items.
- Deliverable: release notes, postmortem doc, follow-up todo list.

Prioritization matrix (urgent vs impactful)
- P0 (blocker): data loss on save, crash on load, inability to authenticate, corrupted persisted state.
- P1 (high): layout broken preventing use, forms failing silently, navigation breaking flows.
- P2 (medium): visual glitches, performance lag, occasional telemetry gaps.

Concrete task list (examples)
- T1: Reproduce and capture Save Failure (owner, steps, logs) — Phase 0 — P0
- T2: Implement API wrapper + error normalization — Phase 1 — P0
- T3: Add abort/cancel for duplicate requests — Phase 3 — P1
- T4: Fix CSS container overflow on user screen — Phase 2 — P1
- T5: Add unit tests for form validation and save rollback — Phase 1 — P0
- T6: Add E2E smoke test for critical user screen flow — Phase 5 — P0
- T7: Add client-side breadcrumbs for save/load actions — Phase 5 — P2

Ideas & feature improvements (opinionated)
- Add an "Undo" affordance for destructive user actions (soft-delete + undo within 10s).
- Surface server validation errors inline rather than only as toasts.
- Add a lightweight offline cache for transient edits so users don't lose work on connectivity drop.
- Provide a debug mode that captures full session trace (local only, opt-in) for QA reproductions.

Testing & verification commands (examples)
- pwsh -File scripts\run-unit-tests.ps1
- npx playwright test user-screen.spec.ts --reporter=html
- git --no-pager log --oneline --graph --decorate --max-count=20

Rollout plan
- Canary: 5% of users or internal team for 48 hours.
- Monitor: error rate, save success rate, UI render errors in console, user-reported issues channel.
- Full rollout after metrics are stable for 72 hours.

Risk & mitigation
- Risk: fixes introduce regressions — Mitigation: small, focused PRs; regression tests and canary rollout.
- Risk: flaky tests slow CI — Mitigation: quarantine flaky tests, add robust network stubs.

Ownership & communication
- Owners: assign a primary engineer and a rotating on-call reviewer for the sprint.
- Communication: daily standups, ephemeral channel for triage, PR description must include reproduction steps and test results.

Appendix: debugging checklist for each reported bug
1. Reproduce locally with same data and browser/version.
2. Capture network trace and console logs.
3. Check server logs for correlated errors (request id, timestamps).
4. Run unit and E2E tests targeting flow; add test if missing.
5. Prepare minimal reproducible change; run CI and smoke tests.

Notes
- Keep changes small and reversible. If a fix is risky, prefer feature-flagging.
- For LLM/agent contributors: create plan.md in session-state with the chosen tasks, update todo table via session SQL, and commit with the Co-authored-by trailer.

---
Generated by Copilot CLI runtime in VS Code: roadmap intended for human and LLM contributors; update as bugs are triaged.