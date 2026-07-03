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

const SCorpInvestmentOptimizer = dynamic(() => import('@/components/apps/SCorpInvestmentOptimizer'), { ssr: false });

function SCorpInvestmentPageInner() {
  const router = useRouter();
  const { hasSession, isPro, initialValues } = useToolPageData({
    toolId: 's-corp-investment',
    toolName: 'S-Corp Investment Optimizer',
    toolPath: '/apps/s-corp-investment',
  });

  return (
    <ToolLayout
      eyebrow="FINANCE · SMALL BUSINESS"
      title="S-Corp investment optimizer."
      sub="Maximize retirement contributions while keeping your owner compensation reasonable — employee deferrals, company match, IRA, and HSA all modeled with 2026 limits."
      breadcrumb={<Breadcrumb toolName="S-Corp Investment Optimizer" />}
      cta={
        !hasSession ? (
          <ToolUpsellCta
            headline="Retirement plans are a business decision."
            sub="A free account saves contribution scenarios so you can revisit them as profit rises."
          />
        ) : null
      }
      narration="Most S-Corp owners default to a Roth IRA. You just saw what a Solo 401(k) plus a company contribution does to the retirement number."
      footer={
        <>
          <CalculatorSEOContent content={CALCULATOR_CONTENT['s-corp-investment']} />
          <RelatedTools tools={getRelatedTools('s-corp-investment')} />
        </>
      }
    >
      <InlineAd context="s-corp-investment" className="mb-6" />
      <SCorpInvestmentOptimizer
        isPro={isPro}
        onUpgrade={() => router.push('/pricing')}
        isLoggedIn={hasSession}
        initialValues={initialValues}
      />
    </ToolLayout>
  );
}

export default function SCorpInvestmentPage() {
  return (
    <Suspense fallback={<CalculatorSkeleton />}>
      <SCorpInvestmentPageInner />
    </Suspense>
  );
}
