---
name: daily-investment-report
description: Generate a daily investment report combining a market snapshot (indices, rates, VIX), top news headlines with analysis, specific buy/hold/sell ideas, and portfolio-level guidance for a mix of long-term and active opportunistic investing. Use this skill whenever the user asks for a "daily report," "market brief," "investment ideas for today," "what's moving," "morning brief," "EOD recap," or any variation of a daily investing/markets summary — even if they don't say "investment report" explicitly. Also trigger when the user asks to scan markets, find ideas, check the tape, or wants a structured digest of financial news and signals. Output is saved as a downloadable Markdown (.md) file.
user-invocable: true
---

# Daily Investment Report

This skill produces a structured daily investment report for a mix of long-term core and active opportunistic investing. The report is research and idea generation — **not personalized financial advice**. It should always include a disclaimer to that effect.

## When to use

Trigger on any of these patterns:

- "Daily report," "morning brief," "market brief," "EOD recap," "daily digest"
- "What's moving today," "what should I be watching," "scan the markets"
- "Investment ideas for today," "any opportunities right now"
- "Check the tape," "where are markets," "what's the news"

If the user's request is ambiguous (e.g. just "give me an update"), confirm they want the full report before running the full workflow — it's substantive and takes several searches.

## Workflow

### Step 1: Pull current market data

Use `web_search` to gather a fresh snapshot. Today's date is dynamic — use the actual current date in queries. Run these searches (roughly in this order):

1. **Indices & macro**: "S&P 500 Dow Nasdaq today" (current levels, % move, day's range)
2. **Rates & yields**: "10 year treasury yield today" and "fed funds rate current"
3. **Volatility**: "VIX index today"
4. **Currencies/commodities**: "DXY oil gold today" (only if relevant or user asks)
5. **Top headlines**: "stock market news today" and "biggest stock movers today"
6. **Sector signals**: "sector performance today S&P" (which sectors led/lagged)

Aim for 5–8 searches. Pull from reputable sources: Reuters, Bloomberg, WSJ, FT, CNBC, MarketWatch, Barron's, company filings/IR pages, Federal Reserve, Treasury. Avoid forums, low-quality aggregators, and pump-style content.

### Step 2: Pull idea-generation signals

For specific buy/hold/sell ideas, search for:

- Notable analyst upgrades/downgrades today
- Earnings reports released today (beats/misses, guidance changes)
- Unusual volume or notable insider activity (if covered in reputable reporting)
- Sector or thematic stories with multi-day momentum

Be skeptical of single-source "hot tips." If a name only appears in low-quality outlets, drop it.

### Step 3: Synthesize into the report

Build the report using the structure in `assets/report-template.md`. Apply these principles:

- **Lead with what matters.** If there's one dominant story (Fed decision, major earnings, geopolitical event), put it first.
- **Distinguish signal from noise.** A 0.3% move on no news is noise. Flag actual catalysts.
- **Frame ideas as hypotheses, not calls.** Use "watch list candidate," "potential setup," "worth researching" — never "buy this now."
- **Always include the bear case.** For every buy idea, note what could go wrong. For every sell idea, note what could change the thesis.
- **Quantify where possible.** Price levels, support/resistance, P/E vs sector median, dividend yield — concrete numbers beat vague language.
- **Long-term vs opportunistic split.** Keep these clearly separated. Long-term = quality, valuation, durability. Opportunistic = catalyst-driven, time-bound, sized smaller.
- **Portfolio-level guidance is about risk and allocation, not specific tickers.** Things like: "Concentration in tech remains elevated — consider trimming if overweight." Not: "Sell 5% of NVDA."

### Step 4: Save the file

Save the report to `/mnt/user-data/outputs/` using a date-stamped filename: `investment-report-YYYY-MM-DD.md`. Then call `present_files` so the user can download it.

After presenting the file, give a one-paragraph summary in the chat highlighting the single most important takeaway from today's report. Don't restate the whole thing — the user has the file.

## Report structure

See `assets/report-template.md` for the full template. The required sections are:

1. **Header** — date, "Daily Investment Report," disclaimer
2. **Top of mind** — 2–3 sentence executive summary
3. **Market snapshot** — indices, rates, VIX, sector leaders/laggards (compact table)
4. **Headlines & analysis** — 3–5 stories that actually matter, each with a "so what" line
5. **Ideas — long-term core** — 1–3 names with thesis, valuation note, risks
6. **Ideas — opportunistic** — 1–3 setups with catalyst, time horizon, what would invalidate
7. **Portfolio-level guidance** — allocation/risk observations, not ticker calls
8. **Watch list for tomorrow** — earnings, data releases, Fed speakers, key events
9. **Disclaimer** — full version at the bottom

## Quality bar

Before saving, self-check:

- Are all numbers and quotes attributed to a real source from today?
- Is every "idea" framed as research, not a recommendation?
- Did I include a bear case for each idea?
- Does the report distinguish the long-term bucket from the opportunistic bucket?
- Is the disclaimer present and clear?

If any answer is no, fix it before saving.

## Important constraints

- **Never invent prices, headlines, or analyst calls.** If a search didn't surface something, don't fill in. Better to have a shorter report than a fabricated one.
- **Never give personalized advice.** No "given your portfolio" claims. The skill doesn't know the user's holdings, tax situation, time horizon, or risk tolerance.
- **Respect copyright on news content.** Paraphrase headlines and analysis in your own words; quotes under 15 words, one quote per source max. See the citation rules in the system prompt.
- **Flag uncertainty.** If sources conflict or data is stale, say so explicitly.

## Files

- `assets/report-template.md` — the markdown skeleton to fill in
- `references/sources.md` — list of trusted sources and what each is good for
