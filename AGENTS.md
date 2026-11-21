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

## Workflow
1. Run `git branch --show-current`. If on `main`, stop.
2. Read `docs/agent-log/CURRENT_PLAN.md` for the active task.
3. Inspect only the target files listed in the plan.
4. Apply minimal, surgical edits.
5. Run `npm run build`. If it fails, fix the error — do not proceed.
6. Commit: `git add <changed-files>` then `git commit -m "agent: <description>"`.
7. Append results to `docs/agent-log/TEST_RUNS.md`.
8. Update `docs/agent-log/CHANGELOG_AGENT.md` and check off the task.

## Project Context
- `project_context.txt` contains a full project snapshot (from 2026-02-17). Use it for architecture overview, but always verify against actual current files before editing — it may be stale.

## Known Risks (see `docs/agent-log/BACKLOG_AND_RISKS.md` for details)
- Print pagination quirks in PosterNotesStudio
- AutoFitSlotBox overflow in handout 2-up layout
- KaTeX pointer-event collisions in interactive cards
