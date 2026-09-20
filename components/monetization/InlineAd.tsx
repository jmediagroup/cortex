'use client';

import AdSlot from './AdSlot';

interface InlineAdProps {
  context: string;
  className?: string;
}

/**
 * InlineAd — thin wrapper kept for the 14 tool pages that render
 * `<InlineAd context="<toolId>" />`. Maps onto the `tool-inline-top`
 * placement (leaderboard on md+, mobile banner below md).
 */
export default function InlineAd({ context, className = '' }: InlineAdProps) {
  return <AdSlot placement="tool-inline-top" toolId={context} className={className} />;
}
