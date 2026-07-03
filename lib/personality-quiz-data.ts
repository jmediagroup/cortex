/**
 * Money Guy Mutants Financial Personality Quiz — content + scoring model.
 *
 * Each answer awards points to one or more of six archetype dimensions.
 * The highest-scoring dimension is the user's primary archetype, the
 * second-highest is their secondary trait. Q5 (risk framing) is the
 * tiebreaker.
 */

export type ArchetypeId =
  | 'optimizer'
  | 'accumulator'
  | 'fortress'
  | 'tactician'
  | 'visionary'
  | 'steward';

export type ScoreMap = Record<ArchetypeId, number>;

export interface QuizOption {
  id: string;
  label: string;
  points: Partial<ScoreMap>;
}

export interface QuizQuestion {
  id: string;
  index: number;
  prompt: string;
  options: QuizOption[];
}

export interface Archetype {
  id: ArchetypeId;
  name: string;
  shortName: string;
  tagline: string;
  summary: string;
  strengths: string[];
  watchOuts: string[];
  tools: { label: string; href: string }[];
}

export const ARCHETYPE_ORDER: ArchetypeId[] = [
  'accumulator',
  'optimizer',
  'fortress',
  'tactician',
  'visionary',
  'steward',
];

export const ARCHETYPES: Record<ArchetypeId, Archetype> = {
  accumulator: {
    id: 'accumulator',
    name: 'The Accumulator',
    shortName: 'Accumulator',
    tagline: 'Slow is smooth. Smooth is fast.',
    summary:
      "You've internalized the most powerful force in investing: time. You don't need to beat the market — you need to stay in it, consistently, for decades. Your edge isn't intelligence or insider access. It's discipline, patience, and the ability to ignore the noise while everyone else panics.",
    strengths: [
      'Consistent and long-horizon',
      'Low-anxiety relationship with markets',
      'Lets compounding do the heavy lifting',
    ],
    watchOuts: [
      'Complacency — "set and forget" can mean drifting allocations',
      'Missed rebalancing opportunities in extreme markets',
    ],
    tools: [
      { label: 'FIRE Calculator', href: '/apps/coast-fire' },
      { label: 'Compound Growth', href: '/apps/compound-interest' },
      { label: 'Daily Outlook', href: '/thinking' },
    ],
  },
  optimizer: {
    id: 'optimizer',
    name: 'The Optimizer',
    shortName: 'Optimizer',
    tagline: 'Every basis point compounds.',
    summary:
      "You see inefficiency everywhere — and it bothers you. Your portfolio is likely low-cost, tax-efficient, and benchmarked against something rigorous. You're the person who switched to Fidelity ZERO funds and reads factor investing papers for fun. You're not trying to beat the market — you're trying to capture it as cheaply and cleanly as possible.",
    strengths: [
      'Disciplined and cost-conscious',
      'Evidence-driven, systematic',
      'Comfortable with spreadsheets and data',
    ],
    watchOuts: [
      'Optimizing so hard you create complexity',
      '"Good enough" sometimes beats "theoretically optimal"',
    ],
    tools: [
      { label: 'Index Fund Visualizer', href: '/apps/index-fund-visualizer' },
      { label: 'Compound Growth', href: '/apps/compound-interest' },
      { label: 'Retirement Strategy', href: '/apps/retirement-strategy' },
    ],
  },
  fortress: {
    id: 'fortress',
    name: 'The Fortress Builder',
    shortName: 'Fortress Builder',
    tagline: "You can't build wealth you can't keep.",
    summary:
      "Your financial superpower is defense. While others chase returns, you build systems: emergency funds, insurance, debt payoff, diversification. You might not have the highest returns on the leaderboard — but you've never had a financial emergency you couldn't handle. In a real crisis, you thrive.",
    strengths: [
      'Resilient, low-debt, cash-secure',
      'Psychologically stable through volatility',
      'Builds systems, not just portfolios',
    ],
    watchOuts: [
      'Over-conservatism — too much idle cash is its own risk',
      'Inflation quietly erodes uninvested capital',
    ],
    tools: [
      { label: 'Debt Paydown', href: '/apps/debt-paydown' },
      { label: 'Net Worth Engine', href: '/apps/net-worth' },
      { label: 'Budget Calculator', href: '/apps/budget' },
    ],
  },
  tactician: {
    id: 'tactician',
    name: 'The Tactician',
    shortName: 'Tactician',
    tagline: 'The market rewards the prepared.',
    summary:
      "You're not a passive observer — you're a student of the market. You follow macro trends, rotate between sectors, and know what the Fed said last Tuesday. Your edge is pattern recognition and preparation. You do the work most investors won't, and you respect the game enough to take it seriously.",
    strengths: [
      'Informed and adaptive',
      'Good market intuition',
      'Engaged with macro and sector flows',
    ],
    watchOuts: [
      'Overtrading — activity feels productive but taxes and friction add up',
      'Track real performance vs. a simple index, honestly',
    ],
    tools: [
      { label: 'Daily Market Outlook', href: '/thinking' },
      { label: 'Index Fund Visualizer', href: '/apps/index-fund-visualizer' },
      { label: 'Retirement Strategy', href: '/apps/retirement-strategy' },
    ],
  },
  visionary: {
    id: 'visionary',
    name: 'The Visionary',
    shortName: 'Visionary',
    tagline: "Risk is not knowing what you're doing.",
    summary:
      "You think in asymmetric bets. Where others see risk, you see mispriced opportunity. You're drawn to early-stage companies, emerging sectors, or concentrated positions in things you deeply believe in. Your ceiling is higher than almost any other archetype — and so is your floor. The key is position sizing and knowing when your thesis is broken.",
    strengths: [
      'High-conviction, independent thinker',
      'Comfortable with uncertainty',
      'Big upside potential when right',
    ],
    watchOuts: [
      'Concentration risk and confirmation bias',
      'The traits that produce 10X winners produce devastating losses unchecked',
    ],
    tools: [
      { label: 'Net Worth Engine', href: '/apps/net-worth' },
      { label: 'Retirement Strategy', href: '/apps/retirement-strategy' },
      { label: 'Daily Outlook', href: '/thinking' },
    ],
  },
  steward: {
    id: 'steward',
    name: 'The Steward',
    shortName: 'Steward',
    tagline: 'Wealth is a responsibility.',
    summary:
      "For you, money isn't just personal — it's generational and meaningful. You think about the values your financial decisions reflect, the legacy you're building, and who benefits from your wealth beyond yourself. You're drawn to impact investing, estate planning, and making sure the people you love are taken care of.",
    strengths: [
      'Long-horizon and values-aligned',
      'Legacy- and family-focused',
      'Thinks beyond a single lifetime',
    ],
    watchOuts: [
      'Letting values override returns entirely',
      'ESG funds often carry higher fees and lower diversification',
    ],
    tools: [
      { label: 'FIRE Calculator', href: '/apps/coast-fire' },
      { label: 'Net Worth Engine', href: '/apps/net-worth' },
      { label: 'Daily Outlook', href: '/thinking' },
    ],
  },
};

export const QUESTIONS: QuizQuestion[] = [
  {
    id: 'q1',
    index: 1,
    prompt: 'Your portfolio drops 25% in a month. What’s your first instinct?',
    options: [
      {
        id: 'q1-a',
        label: '"Time to rebalance and buy more at these prices."',
        points: { accumulator: 2 },
      },
      {
        id: 'q1-b',
        label: '"Let me check if my asset allocation is still correct."',
        points: { optimizer: 2 },
      },
      {
        id: 'q1-c',
        label: '"Is my emergency fund still intact? That’s what matters."',
        points: { fortress: 2, steward: 1 },
      },
      {
        id: 'q1-d',
        label: '"This is a buying opportunity — time to rotate into beaten-down sectors."',
        points: { tactician: 2 },
      },
    ],
  },
  {
    id: 'q2',
    index: 2,
    prompt: 'You unexpectedly receive $50,000. What do you do with it?',
    options: [
      {
        id: 'q2-a',
        label: 'Max out tax-advantaged accounts, then index funds — done.',
        points: { accumulator: 2, optimizer: 1 },
      },
      {
        id: 'q2-b',
        label: 'Pay off any remaining debt first, then rebuild cash reserves.',
        points: { fortress: 2, steward: 1 },
      },
      {
        id: 'q2-c',
        label: 'Research 2–3 high-conviction ideas and size into them.',
        points: { visionary: 2 },
      },
      {
        id: 'q2-d',
        label: 'Evaluate portfolio gaps and deploy it tactically over 3 months.',
        points: { tactician: 2, optimizer: 1 },
      },
    ],
  },
  {
    id: 'q3',
    index: 3,
    prompt: 'Which statement best describes your investment philosophy?',
    options: [
      {
        id: 'q3-a',
        label: '"Time in the market beats timing the market."',
        points: { accumulator: 2 },
      },
      {
        id: 'q3-b',
        label: '"Every basis point of fees is a drag on compounding."',
        points: { optimizer: 2 },
      },
      {
        id: 'q3-c',
        label: '"I want to know I can weather any storm without selling."',
        points: { fortress: 2, steward: 1 },
      },
      {
        id: 'q3-d',
        label: '"High conviction + concentrated positions = real wealth."',
        points: { visionary: 2 },
      },
    ],
  },
  {
    id: 'q4',
    index: 4,
    prompt: 'How do you stay informed about your investments?',
    options: [
      {
        id: 'q4-a',
        label: "Annual rebalancing review — I don’t need to watch daily.",
        points: { accumulator: 2 },
      },
      {
        id: 'q4-b',
        label: 'I track expense ratios, tax efficiency, and factor exposures.',
        points: { optimizer: 2 },
      },
      {
        id: 'q4-c',
        label: 'I follow macro trends and rotate based on sector strength.',
        points: { tactician: 2 },
      },
      {
        id: 'q4-d',
        label: 'I research founders, narratives, and early-stage opportunities.',
        points: { visionary: 2 },
      },
    ],
  },
  {
    id: 'q5',
    index: 5,
    prompt: 'What does "risk" mean to you?',
    options: [
      {
        id: 'q5-a',
        label: 'Permanent loss of capital — everything else is just volatility.',
        points: { accumulator: 2, steward: 1 },
      },
      {
        id: 'q5-b',
        label: 'Underperformance relative to a risk-adjusted benchmark.',
        points: { optimizer: 2 },
      },
      {
        id: 'q5-c',
        label: 'Not having enough cash when you need it most.',
        points: { fortress: 2 },
      },
      {
        id: 'q5-d',
        label: 'Missing a generational opportunity by being too cautious.',
        points: { visionary: 2 },
      },
    ],
  },
  {
    id: 'q6',
    index: 6,
    prompt: 'How often do you check your portfolio?',
    options: [
      {
        id: 'q6-a',
        label: 'Monthly or quarterly — checking more often just creates noise.',
        points: { accumulator: 2 },
      },
      {
        id: 'q6-b',
        label: 'Weekly, to monitor performance vs. benchmarks.',
        points: { optimizer: 1, tactician: 1 },
      },
      {
        id: 'q6-c',
        label: 'Daily — I like knowing exactly where things stand.',
        points: { tactician: 2 },
      },
      {
        id: 'q6-d',
        label: 'Only when something major happens in the market.',
        points: { fortress: 2 },
      },
    ],
  },
  {
    id: 'q7',
    index: 7,
    prompt: 'If you could only optimize one thing about your finances, what would it be?',
    options: [
      {
        id: 'q7-a',
        label: 'Savings rate — more in means more compounding.',
        points: { accumulator: 2 },
      },
      {
        id: 'q7-b',
        label: 'After-tax, after-fee returns.',
        points: { optimizer: 2 },
      },
      {
        id: 'q7-c',
        label: 'Debt elimination and a 12-month emergency fund.',
        points: { fortress: 2, steward: 1 },
      },
      {
        id: 'q7-d',
        label: 'Identifying the next major opportunity before the crowd.',
        points: { visionary: 2 },
      },
    ],
  },
  {
    id: 'q8',
    index: 8,
    prompt: 'Which investor do you most identify with?',
    options: [
      {
        id: 'q8-a',
        label: 'Warren Buffett — patient, long-term, compounding quietly.',
        points: { accumulator: 2 },
      },
      {
        id: 'q8-b',
        label: 'Jack Bogle — low costs, passive, systematic.',
        points: { optimizer: 2 },
      },
      {
        id: 'q8-c',
        label: 'Ray Dalio — all-weather, diversified, risk-managed.',
        points: { fortress: 2 },
      },
      {
        id: 'q8-d',
        label: 'Cathie Wood or Peter Lynch — concentrated, high-conviction, growth.',
        points: { visionary: 2 },
      },
    ],
  },
  {
    id: 'q9',
    index: 9,
    prompt: 'What does money ultimately mean to you?',
    options: [
      {
        id: 'q9-a',
        label: 'Freedom — enough to never have to work for someone else.',
        points: { accumulator: 2 },
      },
      {
        id: 'q9-b',
        label: 'A system to be optimized — money is a tool, not an end.',
        points: { optimizer: 2 },
      },
      {
        id: 'q9-c',
        label: 'Security — knowing my family is protected no matter what.',
        points: { fortress: 2, steward: 1 },
      },
      {
        id: 'q9-d',
        label: 'Legacy — building something that outlasts me.',
        points: { steward: 2, visionary: 1 },
      },
    ],
  },
  {
    id: 'q10',
    index: 10,
    prompt:
      "Be honest: if you learned about a friend’s investment that 5X’d in a year, what would you feel?",
    options: [
      {
        id: 'q10-a',
        label: "Genuinely happy for them — I’m focused on my own plan.",
        points: { accumulator: 2 },
      },
      {
        id: 'q10-b',
        label: 'Curious about the risk-adjusted return.',
        points: { optimizer: 2 },
      },
      {
        id: 'q10-c',
        label: 'Slightly anxious — that kind of move usually has hidden risk.',
        points: { fortress: 2 },
      },
      {
        id: 'q10-d',
        label: "Annoyed I missed it — and immediately researching similar setups.",
        points: { tactician: 2, visionary: 1 },
      },
    ],
  },
];

export function emptyScoreMap(): ScoreMap {
  return {
    optimizer: 0,
    accumulator: 0,
    fortress: 0,
    tactician: 0,
    visionary: 0,
    steward: 0,
  };
}

/**
 * Tally answers into a per-archetype score map. `answers` is a map of
 * questionId -> selected optionId.
 */
export function scoreAnswers(answers: Record<string, string>): ScoreMap {
  const scores = emptyScoreMap();
  for (const question of QUESTIONS) {
    const optionId = answers[question.id];
    if (!optionId) continue;
    const option = question.options.find((o) => o.id === optionId);
    if (!option) continue;
    for (const [key, value] of Object.entries(option.points) as [
      ArchetypeId,
      number,
    ][]) {
      scores[key] += value;
    }
  }
  return scores;
}

/**
 * Determine the primary and secondary archetype.
 *
 * Tiebreak rule: when two archetypes share the top score, the dimension
 * directly awarded by the user's Q5 (risk framing) answer wins.
 */
export function resolveResult(
  answers: Record<string, string>,
): { scores: ScoreMap; primary: ArchetypeId; secondary: ArchetypeId } {
  const scores = scoreAnswers(answers);

  const q5OptionId = answers['q5'];
  const q5Question = QUESTIONS.find((q) => q.id === 'q5');
  const q5Option = q5Question?.options.find((o) => o.id === q5OptionId);
  const q5Bias = (Object.keys(q5Option?.points ?? {}) as ArchetypeId[])[0];

  const ranked = (Object.keys(scores) as ArchetypeId[])
    .map((id) => ({ id, value: scores[id] }))
    .sort((a, b) => {
      if (b.value !== a.value) return b.value - a.value;
      if (a.id === q5Bias) return -1;
      if (b.id === q5Bias) return 1;
      return ARCHETYPE_ORDER.indexOf(a.id) - ARCHETYPE_ORDER.indexOf(b.id);
    });

  return {
    scores,
    primary: ranked[0].id,
    secondary: ranked[1].id,
  };
}

/**
 * Highest score a given archetype can earn across all questions — the
 * sum, per question, of the largest award any single option gives it.
 * Result meters normalize each dimension against its own ceiling: the
 * ceilings differ per archetype, so dividing by a single global max
 * would make a maxed-out run on a lower-ceiling archetype read as a
 * half-full bar.
 */
export function maxPossibleScoreFor(id: ArchetypeId): number {
  let total = 0;
  for (const q of QUESTIONS) {
    let bestForQuestion = 0;
    for (const opt of q.options) {
      const pts = opt.points[id] ?? 0;
      if (pts > bestForQuestion) bestForQuestion = pts;
    }
    total += bestForQuestion;
  }
  return total;
}
