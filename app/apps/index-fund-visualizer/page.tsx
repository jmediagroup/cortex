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

const IndexFundVisualizer = dynamic(() => import('@/components/apps/IndexFundVisualizer'), { ssr: false });

function IndexFundPageInner() {
  const router = useRouter();
  const { hasSession, isPro, initialValues } = useToolPageData({
    toolId: 'index-fund-visualizer',
    toolName: 'Index Fund Growth Visualizer',
    toolPath: '/apps/index-fund-visualizer',
  });

  return (
    <ToolLayout
      eyebrow="FINANCE · INVESTING"
      title="Index fund growth visualizer."
      sub="Simulate historical returns and volatility for VOO, VTI, VT, and QQQM with custom contributions and windows."
      breadcrumb={<Breadcrumb toolName="Index Fund Growth Visualizer" />}
      cta={
        !hasSession ? (
          <ToolUpsellCta
            headline="Run the simulation across decades."
            sub="A free account saves scenarios so you can compare funds, windows, and contribution cadences over time."
          />
        ) : null
      }
      narration="Most people pick a fund by name. You just saw how VOO, VTI, VT, and QQQM actually performed across the last cycle."
      footer={
        <>
          <CalculatorSEOContent content={CALCULATOR_CONTENT['index-fund-visualizer']} />
          <RelatedTools tools={getRelatedTools('index-fund-visualizer')} />
        </>
      }
    >
      <InlineAd context="index-fund-visualizer" className="mb-6" />
      <IndexFundVisualizer
        isPro={isPro}
        onUpgrade={() => router.push('/pricing')}
        isLoggedIn={hasSession}
        initialValues={initialValues}
      />
    </ToolLayout>
  );
}

export default function IndexFundPage() {
  return (
    <Suspense fallback={<CalculatorSkeleton />}>
      <IndexFundPageInner />
    </Suspense>
  );
}
