# Anpassa Math Platform — Agent Rules

## Stack & Commands
- **Framework:** React 18 + Vite 5 + Tailwind CSS 3 + KaTeX + Zustand
- **Backend:** Supabase (`saved_sheets`, `teacher_buckets`, `rooms`, `responses`)
- **Testing:** Vitest (`npm test`, `npm run test:run`)
- **Build:** `npm run build` (must exit 0 before marking any task complete)
- **Dev server:** `npm run dev`

## Critical Invariants
1. **Scoped edits only:** Read only the files listed in `docs/agent-log/CURRENT_PLAN.md`. Produce minimal diffs — never rewrite unrelated components.
2. **Logs or it didn't happen:** Every task completion requires `npm run build` output with exit code 0 pasted into `docs/agent-log/TEST_RUNS.md`.
3. **Data schema safety:** Presentation settings live inside `packet.settings`. Never save theme/layout flags as root columns on `saved_sheets`.
4. **Hooks at top:** All hooks (`useState`, `useMemo`, `useEffect`) must execute unconditionally at the very top of the component — never below early returns.
5. **Pointer events:** KaTeX and SVG icon paths trap mouse events. Add `pointer-events-none` to non-interactive children inside clickable containers.
6. **Theme tokens:** Route colors through `PRESENTATION_THEMES` tokens (`cardBg`, `textMain`, `textMuted`, `mathText`). No hardcoded `bg-white` / `text-slate-800` on dynamic components.
7. **Localization:** Dual-language (`sv` / `en`), defaulting to Swedish.

## Git Discipline
- **Never work on `main`.** The user creates a `bionic/<feature>` branch before each session.
- **Commit after each verified task:** `git add <changed-files>` then `git commit -m "agent: <brief description>"`. Small, incremental commits.
- **Never push.** The user reviews and pushes/merges manually.
- **Never reset or force-merge.** If the user has other uncommitted changes, leave them alone.
- **Check branch before starting:** Run `git branch --show-current`. If it's `main`, stop and tell the user to create a feature branch.

## Testing Strategy
- **Test as you go, not retroactively.** Every new feature or logic change gets at least one test. Don't backfill the entire existing codebase.
- **Priority order (by risk × volume):**
  1. `src/components/` (156 files) — the bulk of the app. Test components with complex state, layout logic, or print/presentation behavior.
  2. `src/core/generators/` (11 files) — pure math logic. Small but critical: if a generator breaks, content breaks.
  3. `src/hooks/`, `src/lib/` — shared state and business logic (pacing, progression).
- **Test quality bar:** A test must assert a specific input produces a specific output. No `expect(result).toBeDefined()` or `expect(true).toBe(true)`. If a test can pass with broken logic, it's worthless.
- **When modifying existing logic:** Add a test for the specific behavior you changed, not just "it doesn't crash."
- **Run tests alongside build:** `npm run build && npm run test:run` before committing.
- **Test location:** Co-locate with the code being tested. `src/core/generators/FractionArithGen.test.ts` next to `FractionArithGen.ts`.

## Workflow
1. Run `git branch --show-current`. If on `main`, stop.
2. Read `docs/agent-log/CURRENT_PLAN.md` for the active task.
3. Inspect only the target files listed in the plan.
4. Apply minimal, surgical edits.
5. Run `npm run build && npm run test:run`. If either fails, fix before proceeding.
6. If the change touches component logic, generators, or hooks, add or update a test.
7. Commit: `git add <changed-files>` then `git commit -m "agent: <description>"`.
8. Append results to `docs/agent-log/TEST_RUNS.md` (include test output).
9. Update `docs/agent-log/CHANGELOG_AGENT.md` and check off the task.

## Session Handoff Protocol
- **One session = one bounded task.** Rotate sessions at ~50K tokens to keep responses fast.
- **Before ending a session:** Commit all work, update `CURRENT_PLAN.md` with what's done and what's next (exact step, target files, acceptance criteria), update `TEST_RUNS.md` and `CHANGELOG_AGENT.md`.
- **When starting a new session:** Read `AGENTS.md` and `docs/agent-log/CURRENT_PLAN.md`. Execute the next unchecked step from the plan.
- **Never leave uncommitted work.** If the session ends mid-task, commit the partial state with a `WIP:` prefix so the next session can resume.

## Project Context
- The agent has full filesystem access. Read files on demand rather than relying on pre-cached snapshots.

## Known Risks (see `docs/agent-log/BACKLOG_AND_RISKS.md` for details)
- Print pagination quirks in PosterNotesStudio
- AutoFitSlotBox overflow in handout 2-up layout
- KaTeX pointer-event collisions in interactive cards
