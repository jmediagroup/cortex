'use client';

import { ToolIsland, type ToolComponentKey } from '@/components/app/ToolIsland';
import { landingRef, type LandingToolKey } from '@/lib/landing-pages';

type Props = {
  tool: LandingToolKey;
  toolName: string;
  slug: string;
};

/**
 * The same calculator components that power /apps/<tool>, via the shared
 * client island. One implementation means a math fix lands on the landing
 * page and the app at the same time. Guests who hit an "upgrade" prompt are
 * sent to signup (attributed to this page); members go to pricing.
 */
export function LandingCalculator({ tool, toolName, slug }: Props) {
  const ref = encodeURIComponent(landingRef(slug));
  return (
    <div className="app-shell" style={{ color: 'var(--text-primary)' }}>
      <ToolIsland
        toolId={tool as ToolComponentKey}
        toolName={toolName}
        toolPath={`/calculators/${slug}`}
        upgradeHref={`/pricing?ref=${ref}`}
        guestUpgradeHref={`/signup?ref=${ref}`}
        signupHref={`/signup?ref=${ref}`}
      />
    </div>
  );
}
