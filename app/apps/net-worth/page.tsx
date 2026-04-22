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

const NetWorthEngine = dynamic(() => import('@/components/apps/NetWorthEngine'), { ssr: false });

function NetWorthPageInner() {
  const router = useRouter();
  const { hasSession, isPro, initialValues } = useToolPageData({
    toolId: 'net-worth',
    toolName: 'Net Worth Engine',
    toolPath: '/apps/net-worth',
  });

  return (
    <ToolLayout
      eyebrow="FINANCE · NET WORTH"
      title="Net worth engine."
      sub="Track assets and liabilities, analyze liquidity, and visualize your financial trajectory over time."
      breadcrumb={<Breadcrumb toolName="Net Worth Engine" />}
      cta={
        !hasSession ? (
          <ToolUpsellCta
            headline="Map the whole balance sheet."
            sub="A free account unlocks the full Finance suite — Coast FIRE, Retirement, Debt Paydown, and Budget."
          />
        ) : null
      }
      narration="Most people know their checking balance. You just saw the whole balance sheet in one frame."
      footer={
        <>
          <CalculatorSEOContent content={CALCULATOR_CONTENT['net-worth']} />
          <RelatedTools tools={getRelatedTools('net-worth')} />
        </>
      }
    >
      <InlineAd context="net-worth" className="mb-6" />
      <NetWorthEngine
        isPro={isPro}
        onUpgrade={() => router.push('/pricing')}
        isLoggedIn={hasSession}
        initialValues={initialValues}
      />
    </ToolLayout>
  );
}

export default function NetWorthPage() {
  return (
    <Suspense fallback={<CalculatorSkeleton />}>
      <NetWorthPageInner />
    </Suspense>
  );
}
