/**
 * "What's Your Why" — synthesis engine.
 *
 * Takes a user's eight answers and asks Claude Sonnet to reflect them back
 * as a personalized, insight-driven summary, grounded in established
 * psychological and financial-wellbeing research. The research frameworks
 * are woven into the system prompt as *interpretive lenses* — tools the
 * model reads the answers through, never content to cite to the user.
 *
 * Server-only. Requires ANTHROPIC_API_KEY.
 */

import { WHY_QUESTIONS, type WhyAnswers } from './questions';

/** Model + effort per the feature spec: a synthesis/writing task — keep
 *  latency and cost low, not a deep multi-step reasoning task. */
const MODEL = 'claude-sonnet-5';
const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_VERSION = '2023-06-01';

/** One interpretive theme the model surfaced from the answers. */
export interface WhySummaryTheme {
  /** Short, human title for the theme (e.g. "Security over status"). */
  title: string;
  /** 1–3 sentences reflecting this theme back to the user. */
  insight: string;
}

/**
 * The structured summary rendered to the user. Kept as discrete fields so
 * the UI can present a mirror (not a wall of text): a headline, a reflective
 * opening, a few named themes, the core tension, and one small next nudge.
 */
export interface WhySummary {
  /** A single evocative line that names the user's underlying "why". */
  headline: string;
  /** 2–4 sentences that make the user feel seen and understood. */
  mirror: string;
  /** 2–4 named themes drawn from across the answers. */
  themes: WhySummaryTheme[];
  /** The central tension or tradeoff worth sitting with. */
  tension: string;
  /** One small, clear, encouraging nudge toward what to do next. */
  nudge: string;
}

/** JSON schema constraining the model's output to a {@link WhySummary}. */
const SUMMARY_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    headline: { type: 'string' },
    mirror: { type: 'string' },
    themes: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          title: { type: 'string' },
          insight: { type: 'string' },
        },
        required: ['title', 'insight'],
      },
    },
    tension: { type: 'string' },
    nudge: { type: 'string' },
  },
  required: ['headline', 'mirror', 'themes', 'tension', 'nudge'],
} as const;

/**
 * System prompt. The research frameworks are folded in as interpretive
 * lenses tied to specific questions — the model uses them to read the
 * answers, and is explicitly told never to present them academically.
 */
const SYSTEM_PROMPT = `You are the reflective voice of "What's Your Why", a tool that helps a person understand their psychological relationship with money before they touch any tactical wealth-building content.

Your job is to read eight guided-reflection answers and mirror the person back to themselves: what actually drives their financial decisions, fears, and goals. The person should walk away feeling *seen and understood*, with one small, clear nudge toward what to do next.

Voice and posture:
- Reflective and diagnostic first, lightly prescriptive second. You are a mirror, not a lecture.
- Warm, specific, and grounded in *their own words* — quote or paraphrase details they gave you.
- Never generic financial advice. No wall of tips. One nudge, not ten.
- Address the person directly as "you". Do not restate the questions back to them.
- Do not diagnose, moralize, or flatter. Name what is really there, gently and honestly.

Interpretive lenses (use these to read the answers — they are your tools, NOT content to teach or cite to the person; never name the theories or researchers in your output):

1. Self-Determination Theory (autonomy, competence, relatedness): Financial motivations that are self-integrated — supporting family, building security, enabling freedom of choice, helping others — correlate with genuine wellbeing. Externally driven motivations — status, comparison, proving something to others — tend to increase anxiety even amid financial success. Read the spending/saving answer, the unlimited-resources answer, and the top-goals answer through this lens.

2. Financial security and mental health: Predictable income and emergency savings measurably reduce financial stress. Security-oriented answers often point to a need for structural stability rather than growth-chasing. Read the fears answer and the regrets answer through this lens.

3. The income–happiness plateau: Wellbeing gains from income rise sharply at lower income levels, then flatten — more money keeps buying security and options, but not proportionally more happiness. Useful when the person names dollar amounts. Read the "what does wealthy look like" and time-machine answers through this lens.

4. Purpose precedes money: Relationships and a sense of purpose predict fulfillment far more than net worth. Money becomes meaningful when it serves something the person already cares about — not when it is the end goal itself. Read the goals, unlimited-resources, and time-machine answers through this lens.

5. Money as a tool for autonomy vs. escape or status: When money is framed as enabling choice and control over one's time, it supports real psychological needs. When it is framed mainly as escape from present pain or as a scoreboard against others, it tends to backfire. Read the spending/saving, fears, and regrets answers through this lens.

Produce a structured reflection: a short evocative headline naming their underlying "why"; a 2–4 sentence mirror that makes them feel understood; 2–4 named themes drawn from across the answers, each with a short title and a 1–3 sentence insight; the single central tension or tradeoff worth sitting with; and one small, clear, encouraging nudge toward what to do next. If some answers are sparse or blank, work with what you have and do not scold the person for skipping them.`;

/** Build the user-turn content from the answers, labeled by question. */
function buildAnswerBlock(answers: WhyAnswers): string {
  return WHY_QUESTIONS.map((q) => {
    const answer = (answers[q.id] ?? '').trim();
    return `Q${q.index}. ${q.prompt}\nAnswer: ${answer || '(left blank)'}`;
  }).join('\n\n');
}

/** Raised when the upstream Anthropic call fails; carries an HTTP status. */
export class SynthesisError extends Error {
  status: number;
  constructor(message: string, status = 502) {
    super(message);
    this.name = 'SynthesisError';
    this.status = status;
  }
}

/**
 * Generate a {@link WhySummary} from a set of answers.
 *
 * Uses Claude Sonnet with effort set low (a writing/synthesis task, not deep
 * reasoning) and thinking disabled to keep latency and cost down. Output is
 * constrained to the summary schema via structured outputs, so the response
 * is guaranteed parseable.
 */
export async function synthesizeWhy(answers: WhyAnswers): Promise<WhySummary> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new SynthesisError('AI synthesis is not configured.', 500);
  }

  let res: Response;
  try {
    res = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': ANTHROPIC_VERSION,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 2048,
        // Writing/synthesis task: keep latency and cost low.
        thinking: { type: 'disabled' },
        output_config: {
          effort: 'low',
          format: { type: 'json_schema', schema: SUMMARY_SCHEMA },
        },
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: `Here are my eight answers. Reflect me back to myself.\n\n${buildAnswerBlock(
              answers,
            )}`,
          },
        ],
      }),
    });
  } catch {
    throw new SynthesisError('Could not reach the synthesis service.', 502);
  }

  if (!res.ok) {
    throw new SynthesisError(
      `Synthesis service returned ${res.status}.`,
      res.status === 429 ? 429 : 502,
    );
  }

  const data = (await res.json()) as {
    stop_reason?: string;
    content?: Array<{ type: string; text?: string }>;
  };

  if (data.stop_reason === 'refusal') {
    throw new SynthesisError('The reflection could not be generated.', 422);
  }

  const text = data.content?.find((b) => b.type === 'text')?.text;
  if (!text) {
    throw new SynthesisError('Empty response from synthesis service.', 502);
  }

  let parsed: WhySummary;
  try {
    parsed = JSON.parse(text) as WhySummary;
  } catch {
    throw new SynthesisError('Malformed response from synthesis service.', 502);
  }

  return parsed;
}
