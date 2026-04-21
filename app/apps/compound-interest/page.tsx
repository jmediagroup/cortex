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

const CompoundInterest = dynamic(() => import('@/components/apps/CompoundInterest'), { ssr: false });

function CompoundInterestPageInner() {
  const router = useRouter();
  const { hasSession, isPro, initialValues } = useToolPageData({
    toolId: 'compound-interest',
    toolName: 'Compound Interest Calculator',
    toolPath: '/apps/compound-interest',
  });

  return (
    <ToolLayout
      eyebrow="FINANCE · CALCULATOR"
      title="Compound interest calculator."
      sub="Visualize long-term wealth accumulation with custom contribution schedules. Adjust principal, monthly contribution, and expected return to see how small changes compound."
      breadcrumb={<Breadcrumb toolName="Compound Interest Calculator" />}
      cta={
        !hasSession ? (
          <ToolUpsellCta
            headline="Unlock the full Finance suite."
            sub="Create a free account to access Retirement Strategy, Budget Optimizer, Net Worth, Debt Paydown, and more."
          />
        ) : null
      }
      narration="Most people see the monthly contribution. You just saw the 30-year opportunity cost."
      footer={
        <>
          <CalculatorSEOContent content={CALCULATOR_CONTENT['compound-interest']} />
          <RelatedTools tools={getRelatedTools('compound-interest')} />
        </>
      }
    >
      <InlineAd context="compound-interest" className="mb-6" />
      <CompoundInterest
        isPro={isPro}
        onUpgrade={() => router.push('/pricing')}
        isLoggedIn={hasSession}
        initialValues={initialValues}
      />
    </ToolLayout>
  );
}

export default function CompoundInterestPage() {
  return (
    <Suspense fallback={<CalculatorSkeleton />}>
      <CompoundInterestPageInner />
    </Suspense>
  );
}
