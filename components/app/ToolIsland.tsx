'use client';

import { Suspense, type ComponentType } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { CalculatorSkeleton } from '@/components/ui';
import { InlineAd } from '@/components/monetization';
import { ToolUpsellCta } from '@/components/app/ToolLayout';
import { useToolPageData } from '@/lib/useToolPageData';

export type ToolProps = {
  isPro?: boolean;
  isLoggedIn?: boolean;
  onUpgrade?: () => void;
  initialValues?: Record<string, unknown>;
};

const loading = () => <CalculatorSkeleton />;

/**
 * Loads a calculator on demand, browser-only, and presents it through the
 * shared prop shape. Several tools declare slightly stricter prop types
 * (e.g. a required `isPro`); the island always passes every prop, so the
 * cast is safe.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function tool(loader: () => Promise<{ default: ComponentType<any> }>): ComponentType<ToolProps> {
  return dynamic(loader, { ssr: false, loading }) as ComponentType<ToolProps>;
}

/**
 * Every calculator, keyed by tool id so tool pages and the search landing
 * pages share one map.
 */
export const TOOL_COMPONENTS = {
  'compound-interest': tool(() => import('@/components/apps/CompoundInterest')),
  'coast-fire': tool(() => import('@/components/apps/CoastFIRE')),
  'debt-paydown': tool(() => import('@/components/apps/DebtPaydownOptimizer')),
  'rent-vs-buy': tool(() => import('@/components/apps/RentVsBuyEngine')),
  'car-affordability': tool(() => import('@/components/apps/CarAffordability')),
  's-corp-optimizer': tool(() => import('@/components/apps/SCorpOptimizer')),
  's-corp-investment': tool(() => import('@/components/apps/SCorpInvestmentOptimizer')),
  'capital-gains-tax': tool(() => import('@/components/apps/CapitalGainsTaxTool')),
  'retirement-strategy': tool(() => import('@/components/apps/RetirementStrategyEngine')),
  'index-fund-visualizer': tool(() => import('@/components/apps/IndexFundVisualizer')),
  'gambling-redirect': tool(() => import('@/components/apps/GamblingRedirect')),
  'geographic-arbitrage': tool(() => import('@/components/apps/GeographicArbitrageCalculator')),
  'net-worth': tool(() => import('@/components/apps/NetWorthEngine')),
};

export type ToolComponentKey = keyof typeof TOOL_COMPONENTS;

type Props = {
  toolId: ToolComponentKey;
  toolName: string;
  toolPath: string;
  /** Upsell banner shown above the tool to signed-out visitors. */
  upsell?: { headline: string; sub: string };
  /** Where "Upgrade" inside the tool sends a signed-in visitor. Defaults to /pricing. */
  upgradeHref?: string;
  /** Where "Upgrade" sends a signed-out visitor. Defaults to `upgradeHref`. */
  guestUpgradeHref?: string;
  /** Where the upsell banner's primary button sends the visitor. Defaults to /signup. */
  signupHref?: string;
  /** Hide the inline ad slot (landing pages pass their own placement). */
  hideAd?: boolean;
};

function ToolIslandInner({
  toolId,
  toolName,
  toolPath,
  upsell,
  upgradeHref,
  guestUpgradeHref,
  signupHref,
  hideAd,
}: Props) {
  const router = useRouter();
  const { hasSession, isPro, initialValues } = useToolPageData({ toolId, toolName, toolPath });
  const Tool = TOOL_COMPONENTS[toolId];

  return (
    <>
      {upsell && !hasSession ? (
        <div style={{ marginBottom: 24 }}>
          <ToolUpsellCta headline={upsell.headline} sub={upsell.sub} primaryHref={signupHref} />
        </div>
      ) : null}
      {!hideAd && <InlineAd context={toolId} className="mb-6" />}
      <Tool
        isPro={isPro}
        isLoggedIn={hasSession}
        initialValues={initialValues}
        onUpgrade={() =>
          router.push((hasSession ? upgradeHref : guestUpgradeHref ?? upgradeHref) ?? '/pricing')
        }
      />
    </>
  );
}

/**
 * The interactive part of a calculator page, isolated in its own Suspense
 * boundary. `useToolPageData` reads `useSearchParams()`, which on a static
 * route would otherwise force the ENTIRE page to client-render — leaving
 * crawlers (and AI search bots that don't execute JS) with no h1, intro or
 * FAQ text. Keeping the hook inside this island lets the page shell, SEO
 * copy and related links stay server-rendered.
 */
export function ToolIsland(props: Props) {
  return (
    <Suspense fallback={<CalculatorSkeleton />}>
      <ToolIslandInner {...props} />
    </Suspense>
  );
}
