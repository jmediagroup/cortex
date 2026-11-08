---
title: "How compound interest actually works, and why starting early beats saving more"
date: 2026-11-08
summary: "Compound interest is the one piece of math that decides most financial outcomes, and almost everyone's intuition about it is wrong. Here's the formula, why the curve bends so late, what the historical record actually returned, and how fees and inflation quietly take their cut."
topic: "Compound interest"
category: "Investing"
tags: [investing, compound-interest, time-value-of-money, savings-rate, apy]
relatedTools: [compound-interest, index-fund-visualizer, coast-fire, debt-paydown]
metaDescription: "A complete guide to compound interest: the formula, the Rule of 72, APR vs APY, why time beats contribution size, and how fees and inflation erode real compound returns."
---

Compound interest gets called magic, which is the wrong frame. It's arithmetic — it only feels magical because human intuition is measurably bad at it. Research published in the *Journal of Marketing Research* as "Misunderstanding Savings Growth" found that most people assume savings grow in a straight line, and so badly underestimate what a career of saving accumulates. Teaching them the formula didn't fix it; showing them the curve over a full 40-year horizon did.

This guide covers the mechanics: how compounding is calculated, why the payoff arrives so late, what the long-run historical record actually delivered, and the two forces — fees and inflation — that quietly claim a share of it.

## The formula, and why the curve bends late

Compound growth means you earn returns on your past returns, not just on your original money. The formula is:

**FV = PV × (1 + r)ⁿ**

Future value equals present value times one plus the rate, raised to the number of periods. Compare that to simple interest, where you only ever earn on the principal. Take $10,000 at 7% a year:

| Years | Compound | Simple interest |
|---|---|---|
| 10 | $19,672 | $17,000 |
| 20 | $38,697 | $24,000 |
| 30 | $76,123 | $31,000 |
| 40 | $149,745 | $38,000 |

At ten years the gap is about $2,700 — noticeable, not dramatic. At forty years compounding has produced nearly four times what simple interest did. That shape is the whole story. The exponent does almost nothing early and almost everything late, which is precisely why people who reason linearly give up on it before it pays.

The mental shortcut is the **Rule of 72**: divide 72 by the annual return for the years to double. At 8%, 72 ÷ 8 = 9 years against a true 9.01. It's accurate across the range that matters for ordinary portfolios and drifts at the extremes — at 2% it overstates by a year, at 25% it understates by about a quarter-year. Good for sanity checks, not planning.

## Time beats amount

Because the exponent is doing the work, *when* you invest dominates *how much*. Consider two people, both earning 7%:

- **Person A** invests $500 a month for ten years — $60,000 total — then stops contributing entirely and leaves it alone for thirty more years. They end with about **$658,800**.
- **Person B** waits ten years, then invests $500 a month for thirty straight years — $180,000 total. They end with about **$610,000**.

Person A contributed a third as much money and finished ahead. Nothing separates them but a decade of compounding on the front end.

The same math makes a long contribution schedule look lopsided. At $500 a month and 7%, ten years in you've deposited $60,000 and growth has added about $26,500 — most of the balance is still your own money. Run it forty years and you've contributed $240,000 against roughly $1.07 million of growth.

The [Compound Interest Calculator](/apps/compound-interest) plots contributions against growth, so you can find where that crossover falls for your own rate and horizon. And if the real question is whether what you've already saved will reach your target without further contributions — Person A's situation — the [Coast FIRE Calculator](/apps/coast-fire) answers it directly.

## Rate, frequency, and why APR and APY differ

Two accounts quoting the same rate can pay different amounts, because compounding frequency matters. $10,000 at 5% for one year:

| Compounding | Year-end value | Effective yield |
|---|---|---|
| Annually | $10,500.00 | 5.0000% |
| Quarterly | $10,509.45 | 5.0945% |
| Monthly | $10,511.62 | 5.1162% |
| Daily | $10,512.67 | 5.1267% |
| Continuously | $10,512.71 | 5.1271% |

Frequency helps, but with sharply diminishing returns: the jump from annual to monthly is worth about 12 basis points, and everything past daily is rounding error.

This is also the distinction buried in the two acronyms, and it's a legal one:

- **APY** is the deposit-side figure, required by the Truth in Savings Act (Regulation DD, 12 CFR 1030). It is an *effective* rate — it already includes the effect of compounding, with the calculation specified in the regulation's Appendix A.
- **APR** is the lending-side figure, required by the Truth in Lending Act (Regulation Z, 12 CFR 1026). It is a *nominal* rate and does not reflect compounding.

The practical consequence: the same underlying rate looks smaller as an APR than as an APY. A 4% nominal rate compounded monthly is a 4.07% APY. Compare a savings APY against a loan APR and you aren't comparing like with like — the loan costs more than its headline number.

## What compounding gives back: fees and inflation

Compounding works on whatever rate you actually keep, and two things reduce it before you do.

**Fees compound too, in reverse.** On $100,000 over thirty years, 7% grows to about $761,200. At 6% — the same portfolio minus a one-percent annual fee — it reaches about $574,300. That one percentage point costs roughly **$187,000**, more than the original investment. Expense ratios are the most controllable input in the equation, which is the practical case for low-cost index funds; the [Index Fund Visualizer](/apps/index-fund-visualizer) shows that drag over long holding periods.

**Inflation takes the rest.** This is where the historical record is worth citing precisely. Aswath Damodaran's widely used NYU Stern dataset covering 1928 through 2025 puts the S&P 500's compound annual total return, dividends reinvested, at about **10.02% nominal** — but roughly **6.78% after inflation**, implying long-run inflation near 3%. Over the same period, 10-year Treasuries compounded at about 4.53% nominal, and 3-month T-bills at about 3.37%, which after inflation leaves bills barely above breakeven.

The difference is not academic: $10,000 compounding at 10.02% for thirty years becomes about $175,400 nominally, but only about $71,600 in today's purchasing power. Plan in real returns or you will overestimate what your money buys. Two cautions on that 10%: it's a *geometric* average, and the arithmetic average of yearly returns (about 11.85%) is higher and the wrong figure for projections. And no single decade resembles the long-run average.

## When compounding runs against you

The same exponent applies to what you owe, and consumer debt carries rates no portfolio reliably earns. In the Federal Reserve's G.19 consumer credit data, average rates on card accounts assessed interest have run north of 20%.

At 22%, a $5,000 balance left untouched grows to about $6,100 in a year and roughly $13,500 in five, doubling in a bit over three. And because card interest is applied monthly, a 22% APR is an effective rate closer to 24.4% — the compounding distinction above, working against you.

That asymmetry settles a question people agonize over: a certain ~22% saved by clearing a card beats a hoped-for ~10% from the market, which is why high-rate debt is normally retired before taxable investing starts. The [Debt Payoff Calculator](/apps/debt-paydown) shows what a balance actually costs per month.

At the other extreme, the FDIC's national average savings rate has sat near 0.4% — well under long-run inflation. An average savings account compounds slower than prices rise: fine for an emergency fund that must stay liquid, unsuitable for a thirty-year goal.

## Frequently asked questions

### How much do I need to invest to reach $1 million?

Far more on time than on amount. At 7%, $500 a month reaches roughly $1.31 million in forty years but only about $610,000 in thirty — the final decade adds more than the first two combined. Shorten the horizon and the required contribution rises steeply, which is why the answer for a 25-year-old and a 45-year-old differs by multiples, not percentages.

### Is compound interest better monthly or annually?

Monthly, but the margin is a tiebreaker, not a decision. At 5%, monthly compounding beats annual by about 12 basis points a year. Rate and time matter enormously more, so never take a lower-rate account because it compounds more often.

### Does the 10% average stock market return mean I'll earn 10%?

No. It's a long-run compound average from 1928 onward, before inflation, fees, and taxes, and no individual decade matches it. After roughly 3% inflation the same dataset's real return is closer to 6.8% — that's the figure to plan in.

### Why does my investment balance seem to barely grow at first?

Because early on, almost all of it is your own contributions. At $500 a month and 7%, growth is about $26,500 of an $86,500 balance at ten years — but about $1.07 million of a $1.31 million balance at forty. The flat-feeling early years aren't the strategy failing; they're the shape of the curve.

### Should I pay off debt or invest?

Generally, debt costing north of 20% is the better "return" — retiring it saves at that rate with certainty, where market returns are neither certain nor that high. The common exception is an employer retirement match, an immediate return that usually outranks even expensive debt. Where the line falls depends on your rates.

## Disclaimer

This guide is for general educational purposes only and does not constitute personalized financial, tax, or legal advice. Every reader's situation is different — consult a licensed financial advisor, accountant, or attorney before making decisions based on this content. Figures and rules cited here reflect the most recent information available at time of publication and may change; verify current limits and regulations before acting.
