# Guides topic registry

Append-only log of every published cornerstone guide topic. The `/guide`
routine reads this file first to avoid picking a topic that's already been
covered, then appends a new row after publishing.

Do not delete rows. If a guide is retired, mark it retired rather than
removing the line, so the topic isn't accidentally reused.

| Date | Slug | Topic |
|---|---|---|
| 2026-07-02 | debt-avalanche-vs-snowball | Debt payoff strategy (avalanche vs snowball) |
| 2026-07-05 | coast-fire-explained | Coast FIRE |
| 2026-07-12 | capital-gains-tax-on-stocks | Capital gains tax on stocks |
