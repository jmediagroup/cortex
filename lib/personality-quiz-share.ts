import { ARCHETYPES, type ArchetypeId } from './personality-quiz-data';

/**
 * Public origin for the quiz. Hardcoded because shareable URLs are
 * crawled by social cards and absolute by definition.
 */
export const QUIZ_ORIGIN = 'https://cortex.vip';
export const QUIZ_PATH = '/apps/personality-quiz';
export const QUIZ_URL = `${QUIZ_ORIGIN}${QUIZ_PATH}`;

/**
 * Build the canonical, public, shareable result URL. Path carries the
 * primary archetype (so the `/r/[archetype]` opengraph-image can render
 * dynamically), while `?s=` carries the secondary trait for the page
 * itself.
 */
export function buildResultUrl(
  primary: ArchetypeId,
  secondary: ArchetypeId,
): string {
  return `${QUIZ_ORIGIN}${QUIZ_PATH}/r/${primary}?s=${secondary}`;
}

export interface ShareCopy {
  /** Network-specific post body (already includes the URL). */
  text: string;
  /** Plain caption without URL — used for IG download flow. */
  caption: string;
}

/**
 * Per-network copy variants. Each ends with the result URL and an
 * invitation to take the quiz, per the brief.
 */
export function buildShareCopy(
  primary: ArchetypeId,
  secondary: ArchetypeId,
): {
  url: string;
  generic: string;
  x: string;
  facebook: string;
  linkedin: string;
  instagram: ShareCopy;
} {
  const archetype = ARCHETYPES[primary];
  const url = buildResultUrl(primary, secondary);

  return {
    url,
    generic: `I got ${archetype.name} on the Cortex Financial Personality Quiz. "${archetype.tagline}" → ${url}`,
    x: `I'm ${archetype.name} on the Cortex Financial Personality Quiz.

"${archetype.tagline}"

Find your investor archetype → ${url}`,
    facebook: `Just took the Cortex Financial Personality Quiz and got ${archetype.name}.

"${archetype.tagline}"

Genuinely curious what you'd get. Take it (2 minutes, no email): ${url}`,
    linkedin: `Cortex's Financial Personality Quiz pegged me as ${archetype.name} — "${archetype.tagline}"

It's a sharp two-minute self-assessment of how you actually think about risk, conviction, and capital. Worth taking if you take your investing seriously:

${url}`,
    instagram: {
      caption: `My Cortex investor archetype: ${archetype.name}.
"${archetype.tagline}"

What's yours? Take the quiz at cortex.vip/apps/personality-quiz`,
      text: `My Cortex investor archetype: ${archetype.name}. "${archetype.tagline}" — find yours at ${QUIZ_URL}`,
    },
  };
}

/**
 * Build a share-image URL for the IG download flow. Returns a 1080×1350
 * portrait PNG for Instagram feed/stories.
 */
export function buildShareImageUrl(
  primary: ArchetypeId,
  secondary: ArchetypeId,
  format: 'portrait' | 'landscape' = 'portrait',
): string {
  const params = new URLSearchParams({
    a: primary,
    s: secondary,
    f: format,
  });
  return `${QUIZ_ORIGIN}/api/personality-quiz/share-image?${params.toString()}`;
}

/**
 * Build network share-intent URLs. The page itself owns user-facing
 * routing — these helpers just centralize the encoding rules.
 */
export function buildIntentUrls(
  primary: ArchetypeId,
  secondary: ArchetypeId,
) {
  const copy = buildShareCopy(primary, secondary);
  const u = encodeURIComponent(copy.url);
  return {
    x: `https://twitter.com/intent/tweet?text=${encodeURIComponent(copy.x)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${u}&quote=${encodeURIComponent(copy.facebook)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${u}`,
  };
}
