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

const CapitalGainsTaxTool = dynamic(() => import('@/components/apps/CapitalGainsTaxTool'), { ssr: false });

function CapitalGainsTaxPageInner() {
  const router = useRouter();
  const { hasSession, isPro, initialValues } = useToolPageData({
    toolId: 'capital-gains-tax',
    toolName: 'Capital Gains Tax Estimator',
    toolPath: '/apps/capital-gains-tax',
  });

  return (
    <ToolLayout
      eyebrow="FINANCE · TAX"
      title="Capital-gains tax efficiency."
      sub="If you sell this much stock, what actually happens? Models the 0/15/20% long-term brackets — plus NIIT, QBI, ACA and IRMAA cliffs — for tax year 2026, Virginia resident."
      breadcrumb={<Breadcrumb toolName="Capital Gains Tax" />}
      cta={
        !hasSession ? (
          <ToolUpsellCta
            headline="See the cliffs before you cross them."
            sub="A free account lets you save and compare capital-gains scenarios across tax years."
          />
        ) : null
      }
      narration="Most of a gain can be tax-free if it fits under the 0% bracket. You just saw exactly how much room you have — and where the next cliff sits."
      footer={
        <>
          <CalculatorSEOContent content={CALCULATOR_CONTENT['capital-gains-tax']} />
          <RelatedTools tools={getRelatedTools('capital-gains-tax')} />
        </>
      }
    >
      <InlineAd context="capital-gains-tax" className="mb-6" />
      <CapitalGainsTaxTool
        isPro={isPro}
        onUpgrade={() => router.push('/pricing')}
        isLoggedIn={hasSession}
        initialValues={initialValues}
      />
    </ToolLayout>
  );
}

export default function CapitalGainsTaxPage() {
  return (
    <Suspense fallback={<CalculatorSkeleton />}>
      <CapitalGainsTaxPageInner />
    </Suspense>
  );
}
