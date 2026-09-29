# Decisions log

Drew's answers to the open decisions in `HANDOFF.md` §4, newest first. Later phases follow these instead of the handoff's defaults.

| Date | Decision | Answer | What it changes |
|---|---|---|---|
| 2026-09-29 | **Banner ads** (the refer-a-friend rotator above every tool) | **Off.** | New kill switch `NEXT_PUBLIC_BANNER_ADS_ENABLED`, off unless set to `true` (`lib/ads/flags.ts`). It covers both the DB campaigns and the hard-coded fallback. Takes effect when this PR deploys to production. |
| 2026-09-29 | **D1 — monetize under the Money Guy Mutants name before talking to The Money Guy Show?** | **Yes.** | The D1 gate is cleared. Each monetized surface still ships behind its own flag, off by default, and Drew flips them one at a time (`HANDOFF.md` §13). Phase 4 still needs the rest of Gate G-C: counsel review and a named partner. |
| 2026-09-29 | **Pilot tools for Phases 1–3** | **Approved:** `coast-fire`, `rent-vs-buy`, `index-fund-visualizer` (`PILOT-TOOLS.md`). | Phase 1 needs two offer categories: brokerage/robo-advisor (Coast FIRE, Index Fund) and mortgage/lender (Rent vs Buy). |
| 2026-09-29 | **How to apply the Phase 0 migration** | **Run it.** It was applied straight to production, not to a billed Supabase branch. | `20260929120000_monetization_scorecard` is live. It is additive only. Security advisors afterwards matched the pre-migration baseline exactly. |
