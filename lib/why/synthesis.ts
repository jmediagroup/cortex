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
import { isRetryableStatus, retryDelayMs, type TokenUsage } from '@/lib/ai/policy';

/** Model + effort per the feature spec: a synthesis/writing task — keep
 *  latency and cost low, not a deep multi-step reasoning task. */
export const WHY_MODEL = 'claude-sonnet-5';
const MODEL = WHY_MODEL;
/** Output cap; also what the budget guard reserves per call. */
export const WHY_MAX_TOKENS = 2048;
const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_VERSION = '2023-06-01';
/** Abort one upstream attempt if it hasn't answered in this long. */
const REQUEST_TIMEOUT_MS = 25_000;
/** Total time we'll spend before giving up (first attempt + one retry). */
const TOTAL_BUDGET_MS = 40_000;

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

/**
 * Raised when the reflection can't be produced. `message` is always safe to
 * show a person (no provider names, status codes or internals); `status` is
 * the HTTP status to answer with; `upstreamStatus` is what Anthropic returned
 * (0 for network errors / timeouts) and feeds the circuit breaker.
 */
export class SynthesisError extends Error {
  status: number;
  upstreamStatus: number;
  /** Tokens billed for a response that came back but couldn't be used. */
  usage?: TokenUsage;
  constructor(message: string, status = 502, upstreamStatus = 0) {
    super(message);
    this.name = 'SynthesisError';
    this.status = status;
    this.upstreamStatus = upstreamStatus;
  }
}

const TRY_AGAIN = 'We couldn’t generate your reflection just now. Your answers are saved — please try again in a few minutes.';

export interface SynthesisResult {
  summary: WhySummary;
  usage?: TokenUsage;
}

/**
 * Generate a {@link WhySummary} from a set of answers.
 *
 * Uses Claude Sonnet with effort set low (a writing/synthesis task, not deep
 * reasoning) and thinking disabled to keep latency and cost down. Output is
 * constrained to the summary schema via structured outputs, so the response
 * is guaranteed parseable.
 */
export async function synthesizeWhy(answers: WhyAnswers): Promise<SynthesisResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error('[why/synthesis] ANTHROPIC_API_KEY is not set');
    throw new SynthesisError(TRY_AGAIN, 503, 0);
  }

  const body = JSON.stringify({
    model: MODEL,
    max_tokens: WHY_MAX_TOKENS,
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
        content: `Here are my eight answers. Reflect me back to myself.\n\n${buildAnswerBlock(answers)}`,
      },
    ],
  });

  const startedAt = Date.now();

  // One attempt. Returns the response, or throws a SynthesisError tagged with
  // the upstream status (0 = network error / timeout).
  const attempt = async (): Promise<Response> => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      return await fetch(ANTHROPIC_API_URL, {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': ANTHROPIC_VERSION,
          'content-type': 'application/json',
        },
        body,
      });
    } catch (err) {
      const timedOut = err instanceof Error && err.name === 'AbortError';
      console.error('[why/synthesis] upstream request failed:', timedOut ? 'timeout' : 'network error');
      throw new SynthesisError(TRY_AGAIN, timedOut ? 504 : 502, timedOut ? 408 : 503);
    } finally {
      clearTimeout(timer);
    }
  };

  // The provider is occasionally overloaded (429/529) or briefly unreachable.
  // Retry ONCE, quickly, and only when there is time left — a slow failure
  // isn't retried, and the circuit breaker in lib/ai/guard.ts handles a real
  // outage by not calling at all.
  let res: Response;
  let retried = false;
  try {
    res = await attempt();
  } catch (err) {
    // Network errors fail fast; a timeout has already used 25s, so don't retry it.
    const elapsed = Date.now() - startedAt;
    if (!(err instanceof SynthesisError) || elapsed > 8000) throw err;
    retried = true;
    await new Promise((r) => setTimeout(r, 1500));
    res = await attempt();
  }

  if (!retried && !res.ok && isRetryableStatus(res.status)) {
    const delay = retryDelayMs(res.headers.get('retry-after'), Date.now() - startedAt, TOTAL_BUDGET_MS - REQUEST_TIMEOUT_MS);
    if (delay !== null) {
      console.warn('[why/synthesis] upstream returned', res.status, '- retrying once');
      await new Promise((r) => setTimeout(r, delay));
      res = await attempt();
    }
  }

  if (!res.ok) {
    // Log the status for us; show the person plain copy.
    console.error('[why/synthesis] upstream returned', res.status);
    throw new SynthesisError(TRY_AGAIN, res.status === 429 || res.status === 529 ? 503 : 502, res.status);
  }

  const data = (await res.json()) as {
    stop_reason?: string;
    content?: Array<{ type: string; text?: string }>;
    usage?: {
      input_tokens?: number;
      output_tokens?: number;
      cache_read_input_tokens?: number;
      cache_creation_input_tokens?: number;
    };
  };

  // Log token usage so per-run cost is observable. Input tokens dominate the
  // cost of this call, so watch `input_tokens` here against expectations
  // (~1k system + up to ~3k answers). A number far above that points to an
  // upstream problem (duplicated payload, retries) rather than a pricing one.
  if (data.usage) {
    console.info('[why/synthesis] token usage', {
      model: MODEL,
      input_tokens: data.usage.input_tokens,
      output_tokens: data.usage.output_tokens,
      cache_read_input_tokens: data.usage.cache_read_input_tokens,
    });
  }

  // From here on the provider answered (and billed), so failures are about
  // this response, not an outage: status 200 for the circuit breaker, and the
  // usage rides along so the budget still counts it.
  const billed = (message: string, status: number) => {
    const e = new SynthesisError(message, status, 200);
    e.usage = data.usage;
    return e;
  };
  if (data.stop_reason === 'refusal') {
    throw billed('We couldn’t generate a reflection from these answers. Try rewording one or two of them.', 422);
  }
  if (data.stop_reason === 'max_tokens') {
    // The JSON is cut off mid-document. Logged so it can be fixed (raise max_tokens).
    console.error('[why/synthesis] output hit max_tokens', { max_tokens: WHY_MAX_TOKENS });
    throw billed('Your reflection was cut off before it finished. Please try again with slightly shorter answers.', 502);
  }

  const text = data.content?.find((b) => b.type === 'text')?.text;
  if (!text) {
    console.error('[why/synthesis] empty response');
    throw billed(TRY_AGAIN, 502);
  }

  let parsed: WhySummary;
  try {
    parsed = JSON.parse(text) as WhySummary;
  } catch {
    console.error('[why/synthesis] malformed JSON in response');
    throw billed(TRY_AGAIN, 502);
  }

  return { summary: parsed, usage: data.usage };
}
