'use client';

import type { ArchetypeId } from '@/lib/personality-quiz-data';
import { ShareBar } from '@/components/apps/personality-quiz/ShareBar';

/**
 * Thin client wrapper so the (server) shared-result page can mount the
 * ShareBar without itself becoming a client component.
 */
export function SharedResultShareBar({
  primary,
  secondary,
}: {
  primary: ArchetypeId;
  secondary?: ArchetypeId;
}) {
  return <ShareBar primary={primary} secondary={secondary} />;
}
