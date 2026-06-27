# Project DNA — Advanced (00_PROJECT_DNA.md)

Purpose
- Concise statement: GymOS agents-advanced-project-dna-documentation — tooling and documentation for advanced agent workflows and project-level orchestration.
- Primary audience: other LLMs, autonomous agents, and new contributors.

High-level goals
- Explicit: automate agent orchestration, provide reproducible documentation, support LLM-driven code and infra ops, ensure safety and observability.
- Non-goals: act as runtime for unverified third-party code execution.

Key concepts and terminology
- Agent: autonomous program that executes tasks (explore, task, code-review, research).
- Session: ephemeral workspace containing commands, files, and history.
- Project DNA: canonical metadata and behaviors other LLMs must follow to interact with repo.

Architecture overview
- Components: CLI controller, agent types, repo docs, orchestration scripts, test harness.
- Data stores: session-state (local), repo (source of truth).
- Interfaces: files under root, git, PowerShell for execution, and optional external services.

Important paths
- Root: G:\GYM\gymOS-main.worktrees\agents-advanced-project-dna-documentation
- Agent docs & instructions: README, .instructions.md / .prompt.md patterns
- Session store: C:\Users\<user>\\.copilot\session-state\ (runtime)

Primary workflows
- Local dev: clone -> open -> run linters/tests -> create branch -> commit -> PR
- Agent-driven changes: create plan.md in session-state, propose edits as commits, push PRs with Co-authored-by trailer.
- Testing & validation: run existing test script(s); validate lints.

How other LLMs should interact (protocol)
1. Inspect repository structure (glob, grep, view). Use parallel reads for efficiency.
2. Produce a short plan.md enumerating intent, steps, risks, and verification commands.
3. When changing files: use small, surgical edits; run tests; update plan.md and commit with required trailer.
4. Always follow preToolPreamble and report_intent semantics when invoking tools.

Prompt schema and canonical messages
- Input specification (for agents calling this repo):
  - intent: short gerund phrase (e.g., "Refactoring auth module")
  - scope: list of files or glob patterns
  - constraints: max LOC change, no secret commits, tests must pass
  - verification: commands to run (e.g., "npm test" or "pwsh -File test.ps1")

- Expected output format:
  - summary: 1-3 lines describing change
  - diffs: patch or edit description (file, old-context, new-context)
  - verification: commands run and their results
  - commit: branch name, commit message (include Co-authored-by trailer)

Examples (canonical prompts)
- "Refactoring: rename `userId` to `userID` in src/, run tests, create PR if all pass."
- "Document: generate 00_PROJECT_DNA.md summarizing architecture and LLM protocols."

Safety, secrets, and compliance
- Never commit secrets. If secrets are detected, abort and open an issue with masked example.
- Avoid executing untrusted scripts unless sandboxed; prefer static analysis and tests.
- Maintain license and copyright checks before adding third-party code.

Observability & logging
- Agents should produce concise logs: intent, files touched, commands run, test results, duration.
- Attach plan.md and session-state artifacts to PR description when possible.

Testing & verification
- Minimal checks: linters, unit tests, and integration tests if present.
- Failing tests must block PR creation. If tests are flaky, document flakes and create an issue.

Developer conventions
- Commits: atomic and descriptive; include Co-authored-by trailer automatically.
- Branch naming: <intent-slug>/<short-desc> (e.g., refactor/userid-to-userID)
- Code style: follow existing project conventions; run formatter before commit.

LLM-specific guidance
- Keep actions idempotent and reversible. Prefer edits over deletes.
- When uncertain about design decisions, create a brief RFC (file: docs/rfcs/) and open as issue.
- Provide a short changelog entry for any behavior or API change.

Onboarding checklist for new LLMs or agents
1. Read this DNA file.
2. Run repository health checks (linters/tests).
3. Create plan.md in session-state summarizing proposed changes.
4. Execute minimal edits and run tests.
5. Commit, push branch, and open PR with description and verification logs.

Troubleshooting and common pitfalls
- Large changes: break into small PRs with focused scope.
- Flaky tests: capture logs, rerun, and annotate PR.
- Missing dependencies: check package manifests and doc; do not commit lockfile changes unless required.

Maintainers and contacts
- Use repository issues and PRs to request human review. Mention maintainers in PR description if urgent.

Appendices
- Appendix A: useful commands
  - git --no-pager status
  - pwsh -File scripts\run-tests.ps1  (if present)
  - npm ci && npm test

- Appendix B: Evaluation metrics for automated agents
  - Change success rate: % of PRs passing CI
  - Revert rate: % of PRs reverted within 7 days
  - Time-to-merge: median hours from PR creation to merge

Notes
- This file is authoritative for automated agents and should be updated when workflow or tooling changes.
- Keep it minimal but sufficient: agents must produce a short plan before any change.

---
Generated by Copilot CLI runtime in VS Code: use as machine-readable guidance for LLM-driven automation.