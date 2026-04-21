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

const SCorpOptimizer = dynamic(() => import('@/components/apps/SCorpOptimizer'), { ssr: false });

function SCorpOptimizerPageInner() {
  const router = useRouter();
  const { hasSession, isPro, initialValues } = useToolPageData({
    toolId: 's-corp-optimizer',
    toolName: 'S-Corp Optimizer',
    toolPath: '/apps/s-corp-optimizer',
  });

  return (
    <ToolLayout
      eyebrow="FINANCE · SMALL BUSINESS"
      title="S-Corp optimizer."
      sub="Self-employment tax savings, owner salary, and distribution split — modeled with an IRS-reasonable-comp lens."
      breadcrumb={<Breadcrumb toolName="S-Corp Optimizer" />}
      cta={
        !hasSession ? (
          <ToolUpsellCta
            headline="Keep more of what the business earns."
            sub="A free account saves S-Corp scenarios so you can compare salary/distribution splits across years."
          />
        ) : null
      }
      narration="Most S-Corp owners pay the default. You just saw the split that keeps you compliant and cuts the tax bill."
      footer={
        <>
          <CalculatorSEOContent content={CALCULATOR_CONTENT['s-corp-optimizer']} />
          <RelatedTools tools={getRelatedTools('s-corp-optimizer')} />
        </>
      }
    >
      <InlineAd context="s-corp-optimizer" className="mb-6" />
      <SCorpOptimizer
        isPro={isPro}
        onUpgrade={() => router.push('/pricing')}
        isLoggedIn={hasSession}
        initialValues={initialValues}
      />
    </ToolLayout>
  );
}

export default function SCorpOptimizerPage() {
  return (
    <Suspense fallback={<CalculatorSkeleton />}>
      <SCorpOptimizerPageInner />
    </Suspense>
  );
}
