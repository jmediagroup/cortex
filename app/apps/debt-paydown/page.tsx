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

const DebtPaydownOptimizer = dynamic(() => import('@/components/apps/DebtPaydownOptimizer'), { ssr: false });

function DebtPaydownPageInner() {
  const router = useRouter();
  const { hasSession, isPro, initialValues } = useToolPageData({
    toolId: 'debt-paydown',
    toolName: 'Debt Paydown Optimizer',
    toolPath: '/apps/debt-paydown',
  });

  return (
    <ToolLayout
      eyebrow="FINANCE · DEBT"
      title="Debt paydown optimizer."
      sub="Compare avalanche versus snowball with psychological weighting and opportunity cost built in."
      breadcrumb={<Breadcrumb toolName="Debt Paydown Optimizer" />}
      cta={
        !hasSession ? (
          <ToolUpsellCta
            headline="See every payoff scenario side by side."
            sub="Free accounts save strategies so you can come back and compare across months."
          />
        ) : null
      }
      narration="Most advice picks one strategy. You just saw which one gets you out fastest — and what it costs to choose the one that feels better."
      footer={
        <>
          <CalculatorSEOContent content={CALCULATOR_CONTENT['debt-paydown']} />
          <RelatedTools tools={getRelatedTools('debt-paydown')} />
        </>
      }
    >
      <InlineAd context="debt-paydown" className="mb-6" />
      <DebtPaydownOptimizer
        isPro={isPro}
        onUpgrade={() => router.push('/pricing')}
        isLoggedIn={hasSession}
        initialValues={initialValues}
      />
    </ToolLayout>
  );
}

export default function DebtPaydownPage() {
  return (
    <Suspense fallback={<CalculatorSkeleton />}>
      <DebtPaydownPageInner />
    </Suspense>
  );
}
