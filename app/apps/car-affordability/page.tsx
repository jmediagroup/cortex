'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { InlineAd } from '@/components/monetization';
import { Breadcrumb, CalculatorSkeleton } from '@/components/ui';
import CalculatorSEOContent from '@/components/seo/CalculatorSEOContent';
import RelatedTools from '@/components/seo/RelatedTools';
import { CALCULATOR_CONTENT, getRelatedTools } from '@/lib/calculator-content';
import { ToolLayout, ToolUpsellCta } from '@/components/app/ToolLayout';
import { useToolPageData } from '@/lib/useToolPageData';

const CarAffordability = dynamic(() => import('@/components/apps/CarAffordability'), { ssr: false });

function CarAffordabilityPageInner() {
  const { hasSession, initialValues } = useToolPageData({
    toolId: 'car-affordability',
    toolName: 'Car Affordability Calculator',
    toolPath: '/apps/car-affordability',
  });

  return (
    <ToolLayout
      eyebrow="FINANCE · VEHICLES"
      title="Car affordability calculator."
      sub="How much car your income supports under the 20/3/8 rule — 20% down, a 3-year loan, and a payment capped at 8% of gross income."
      breadcrumb={<Breadcrumb toolName="Car Affordability Calculator" />}
      cta={
        !hasSession ? (
          <ToolUpsellCta
            headline="Save scenarios and compare over time."
            sub="Create a free account to save this result, come back later, and compare across vehicles."
          />
        ) : null
      }
      narration="Most people start from the sticker price. You just sized the price from a payment your income can actually carry."
      footer={
        <>
          <CalculatorSEOContent content={CALCULATOR_CONTENT['car-affordability']} />
          <RelatedTools tools={getRelatedTools('car-affordability')} />
        </>
      }
    >
      <InlineAd context="car-affordability" className="mb-6" />
      <CarAffordability isLoggedIn={hasSession} initialValues={initialValues} />
    </ToolLayout>
  );
}

export default function CarAffordabilityPage() {
  return (
    <Suspense fallback={<CalculatorSkeleton />}>
      <CarAffordabilityPageInner />
    </Suspense>
  );
}
