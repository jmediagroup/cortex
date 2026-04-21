'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { InlineAd } from '@/components/monetization';
import { Breadcrumb, CalculatorSkeleton } from '@/components/ui';
import CalculatorSEOContent from '@/components/seo/CalculatorSEOContent';
import RelatedTools from '@/components/seo/RelatedTools';
import { CALCULATOR_CONTENT, getRelatedTools } from '@/lib/calculator-content';
import { ToolLayout, ToolUpsellCta } from '@/components/app/ToolLayout';
import { useToolPageData } from '@/lib/useToolPageData';

const GeographicArbitrageCalculator = dynamic(() => import('@/components/apps/GeographicArbitrageCalculator'), { ssr: false });

function GeographicArbitragePageInner() {
  const router = useRouter();
  const { hasSession, isPro, initialValues } = useToolPageData({
    toolId: 'geographic-arbitrage',
    toolName: 'Geographic Arbitrage Calculator',
    toolPath: '/apps/geographic-arbitrage',
  });

  return (
    <ToolLayout
      eyebrow="FINANCE · COST OF LIVING"
      title="Geographic arbitrage calculator."
      sub="Income, state and local taxes, and cost of living modeled across all 50 states."
      breadcrumb={<Breadcrumb toolName="Geographic Arbitrage Calculator" />}
      cta={
        !hasSession ? (
          <ToolUpsellCta
            headline="Price the move before you make it."
            sub="Create a free account to save state comparisons and revisit as your life changes."
          />
        ) : null
      }
      narration="Most people chase a higher salary. You just saw what that salary is actually worth once rent and taxes are paid."
      footer={
        <>
          <CalculatorSEOContent content={CALCULATOR_CONTENT['geographic-arbitrage']} />
          <RelatedTools tools={getRelatedTools('geographic-arbitrage')} />
        </>
      }
    >
      <InlineAd context="geographic-arbitrage" className="mb-6" />
      <GeographicArbitrageCalculator
        isPro={isPro}
        onUpgrade={() => router.push('/pricing')}
        isLoggedIn={hasSession}
        initialValues={initialValues}
      />
    </ToolLayout>
  );
}

export default function GeographicArbitragePage() {
  return (
    <Suspense fallback={<CalculatorSkeleton />}>
      <GeographicArbitragePageInner />
    </Suspense>
  );
}
