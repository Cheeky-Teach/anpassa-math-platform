# Agent Changelog

<!-- Agent-applied changes logged here after verification -->

## 2026-11-21 — Agentic coding workflow setup
- Created: `AGENTS.md` (root) — stack, invariants, git rules, testing strategy, workflow, session protocol
- Created: `docs/agent-log/CURRENT_PLAN.md`
- Created: `docs/agent-log/CHANGELOG_AGENT.md` (this file)
- Created: `docs/agent-log/TEST_RUNS.md`
- Created: `docs/agent-log/BACKLOG_AND_RISKS.md`
- Removed: `project_context.txt` reference (stale 1MB snapshot)
- Git: cleaned 24 merged branches, established `bionic/<feature>` naming convention
- Test run: baseline build exit 0 (see TEST_RUNS.md)

## 2026-11-22 — LandingView Hallmark Redesign (complete)
- `src/components/views/LandingView.jsx` — full visual overhaul per Hallmark principles
- **Hero:** `motion.div` fade-up entrance (left + right columns, staggered delay)
- **Nav:** emerald "A" logo mark, `border-b-2 border-emerald-600/20`, emerald teacher button
- **Band 1 (3 columns):** `whileInView` staggered entrance, colored left borders (sky/emerald/amber), `AnimatePresence` Test Lab variant swap with manual "Shuffle variant" button
- **Band 2 (dark studio):** `transition-colors` on all buttons, `border-2 border-emerald-600/30` on walkthrough viewport, `border-2 border-sky-600/30` on whiteboard viewport
- **Band 3 (live telemetry):** `border-l-4 border-l-rose-500` on card, `transition-[width]` on progress bars, `bg-slate-50` background
- **Footer:** `border-t-2 border-emerald-600/10`, `bg-slate-50`, `transition-colors` on CTA
- **Removed:** all `transition-all`, all `bg-[#f9fbf7]`, all `setInterval` timers
- **Added:** `AnimatePresence` import now used (Test Lab), `Shuffle` icon import
- Build: exit 0. Tests: 28 pass, 3 pre-existing failures (unrelated)
- Commit: `84b121f`
