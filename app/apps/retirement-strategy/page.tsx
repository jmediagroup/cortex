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

const RetirementStrategyEngine = dynamic(() => import('@/components/apps/RetirementStrategyEngine'), { ssr: false });

function RetirementStrategyPageInner() {
  const router = useRouter();
  const { hasSession, isPro, initialValues } = useToolPageData({
    toolId: 'retirement-strategy',
    toolName: 'Retirement Strategy Engine',
    toolPath: '/apps/retirement-strategy',
  });

  return (
    <ToolLayout
      eyebrow="FINANCE · RETIREMENT"
      title="Retirement strategy engine."
      sub="Decumulation planning with Roth conversions, tax optimization, and sequence-of-returns risk modeled."
      breadcrumb={<Breadcrumb toolName="Retirement Strategy Engine" />}
      cta={
        !hasSession ? (
          <ToolUpsellCta
            headline="Retire with the math in front of you."
            sub="A free account unlocks the full suite — pair this with Coast FIRE, Net Worth, and Budget to plan the transition."
          />
        ) : null
      }
      narration="Most people retire by feel. You just modeled the actual sequence — and the tax bill that comes with it."
      footer={
        <>
          <CalculatorSEOContent content={CALCULATOR_CONTENT['retirement-strategy']} />
          <RelatedTools tools={getRelatedTools('retirement-strategy')} />
        </>
      }
    >
      <InlineAd context="retirement-strategy" className="mb-6" />
      <RetirementStrategyEngine
        isPro={isPro}
        onUpgrade={() => router.push('/pricing')}
        isLoggedIn={hasSession}
        initialValues={initialValues}
      />
    </ToolLayout>
  );
}

export default function RetirementStrategyPage() {
  return (
    <Suspense fallback={<CalculatorSkeleton />}>
      <RetirementStrategyPageInner />
    </Suspense>
  );
}
