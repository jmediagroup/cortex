/**
 * "What's Your Why" — questionnaire content + research frameworks.
 *
 * The eight questions and the interpretive research lenses live here as
 * structured data (not hardcoded in components) so the reflection is
 * data-driven and easy to edit without touching UI or the synthesis call.
 *
 * Tone of the tool: reflective and diagnostic first, lightly prescriptive
 * second. This is a mirror, not a lecture.
 */

export interface WhyQuestion {
  /** Stable id used as the answer key in stored payloads. */
  id: string;
  /** 1-indexed position in the guided flow. */
  index: number;
  /** The prompt the user answers. */
  prompt: string;
  /** Supporting subtext that frames how to answer. */
  subtext: string;
}

/**
 * The eight guided-reflection questions. `id` values are stable — they are
 * the keys under which answers are stored in Supabase, so renaming one is a
 * data migration, not a copy edit.
 */
export const WHY_QUESTIONS: WhyQuestion[] = [
  {
    id: 'goals',
    index: 1,
    prompt: 'What are you hoping to achieve in your personal finance journey?',
    subtext:
      "List specific goals, learning objectives, or insecurities you'd like to overcome.",
  },
  {
    id: 'spend_vs_save',
    index: 2,
    prompt: 'Do you get more enjoyment from spending or from saving and investing?',
    subtext:
      'Is there a specific reason from your past that is influencing this behavior?',
  },
  {
    id: 'fears',
    index: 3,
    prompt: 'What are your three greatest financial fears and concerns?',
    subtext:
      'Are any of these fears mitigated with knowledge and good financial planning?',
  },
  {
    id: 'unlimited',
    index: 4,
    prompt:
      'If you had unlimited financial resources, what would you do more of or buy more of?',
    subtext:
      'What about this action or item brings you happiness or satisfaction?',
  },
  {
    id: 'wealthy',
    index: 5,
    prompt: 'What does "wealthy" look like to you?',
    subtext:
      "You'll be surprised how much this changes over your lifetime. Please provide specifics, including dollar amounts, deadlines/timelines, career objectives, and lifestyle indicators.",
  },
  {
    id: 'regrets',
    index: 6,
    prompt: 'What are your biggest financial mistakes or regrets?',
    subtext:
      'Describe your greatest financial setbacks or mistakes. Why do you regret them? What do you wish you would have done differently? How did it change how you think about money?',
  },
  {
    id: 'top_goals',
    index: 7,
    prompt: 'What are your top financial goals?',
    subtext:
      'Make these goals SMART — Specific, Measurable, Achievable, Relevant, and Time-bound.',
  },
  {
    id: 'time_machine',
    index: 8,
    prompt: 'The Time Machine Exercise',
    subtext:
      'Write down what success looks like at different points in the future — 12 months, 5 years, 10 years.',
  },
];

/** Total number of questions — handy for progress UI. */
export const WHY_QUESTION_COUNT = WHY_QUESTIONS.length;

/** The set of valid answer keys, for request validation. */
export const WHY_QUESTION_IDS = WHY_QUESTIONS.map((q) => q.id);

/**
 * A complete set of answers, keyed by question id. Values are free-text.
 * Some questions may be left blank — the synthesis handles sparse input.
 */
export type WhyAnswers = Record<string, string>;
