# Decisions log

Drew's answers to the open decisions in `HANDOFF.md` §4, newest first. Later phases follow these instead of the handoff's defaults.

| Date | Decision | Answer | What it changes |
|---|---|---|---|
| 2026-10-18 | **Index fund return assumptions** (10.5% S&P 500, 10.2% total U.S., 8.5% total world, 13.5% growth, plus the expense ratios shown) | **Keep them.** | No change to the tool or its copy. The explainer keeps calling them the tool's assumptions, not promises. AUDIT row 36 resolved. |
| 2026-10-18 | **Gambling helpline number** | **Show 1-800-MY-RESET in the tool too.** | PR #135: the tool's help panel and the explainer both list 1-800-MY-RESET (1-800-697-3738) first, and say 1-800-522-4700 still works. |
| 2026-10-18 | **Phase 5 SEO + Q4 guides** (PR #134) | **Merged.** | Ships D-A (landing pages canonicalize to `/apps/<tool>`, out of the sitemap), D-B (no " \| Money Guy Mutants" suffix on tool titles), D-C (claim fixes) and D-D as `TARGET-QUERIES.md` recommends. The 2027 limits guide is live, with 401(k)/IRA rows marked pending until the IRS announces. |
| 2026-09-29 | **Apply the Phase 1 migrations** (offers engine + placeholder seed) | **Run them.** They were applied straight to production. | `20260929140000_offers_engine` and `20260929140100_seed_offer_placeholders` are live. The old advertisers are `draft`, or `paused` for three of them. The two pilot placeholders are drafts that cannot render. Security advisors afterwards matched the baseline exactly. |
| 2026-09-29 | **Banner ads** (the refer-a-friend rotator above every tool) | **Off.** | New kill switch `NEXT_PUBLIC_BANNER_ADS_ENABLED`, off unless set to `true` (`lib/ads/flags.ts`). It covers both the DB campaigns and the hard-coded fallback. Takes effect when this PR deploys to production. |
| 2026-09-29 | **D1 — monetize under the Money Guy Mutants name before talking to The Money Guy Show?** | **Yes.** | The D1 gate is cleared. Each monetized surface still ships behind its own flag, off by default, and Drew flips them one at a time (`HANDOFF.md` §13). Phase 4 still needs the rest of Gate G-C: counsel review and a named partner. |
| 2026-09-29 | **Pilot tools for Phases 1–3** | **Approved:** `coast-fire`, `rent-vs-buy`, `index-fund-visualizer` (`PILOT-TOOLS.md`). | Phase 1 needs two offer categories: brokerage/robo-advisor (Coast FIRE, Index Fund) and mortgage/lender (Rent vs Buy). |
| 2026-09-29 | **How to apply the Phase 0 migration** | **Run it.** It was applied straight to production, not to a billed Supabase branch. | `20260929120000_monetization_scorecard` is live. It is additive only. Security advisors afterwards matched the pre-migration baseline exactly. |
