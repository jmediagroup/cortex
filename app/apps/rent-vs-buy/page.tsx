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

const RentVsBuyEngine = dynamic(() => import('@/components/apps/RentVsBuyEngine'), { ssr: false });

function RentVsBuyPageInner() {
  const router = useRouter();
  const { hasSession, isPro, initialValues } = useToolPageData({
    toolId: 'rent-vs-buy',
    toolName: 'Rent vs Buy Reality Engine',
    toolPath: '/apps/rent-vs-buy',
  });

  return (
    <ToolLayout
      eyebrow="FINANCE · HOUSING"
      title="Rent vs buy reality engine."
      sub="Opportunity cost, maintenance drag, and tax treatment — the things everyone forgets — all modeled here."
      breadcrumb={<Breadcrumb toolName="Rent vs Buy Reality Engine" />}
      cta={
        !hasSession ? (
          <ToolUpsellCta
            headline="Compare your city, not the average."
            sub="A free account saves scenarios across cities so you can see the full picture over years."
          />
        ) : null
      }
      narration="Most people ask whether to rent or buy. You just saw how the answer changes depending on where you live, for how long, and what the market does next."
      footer={
        <>
          <CalculatorSEOContent content={CALCULATOR_CONTENT['rent-vs-buy']} />
          <RelatedTools tools={getRelatedTools('rent-vs-buy')} />
        </>
      }
    >
      <InlineAd context="rent-vs-buy" className="mb-6" />
      <RentVsBuyEngine
        isPro={isPro}
        onUpgrade={() => router.push('/pricing')}
        isLoggedIn={hasSession}
        initialValues={initialValues}
      />
    </ToolLayout>
  );
}

export default function RentVsBuyPage() {
  return (
    <Suspense fallback={<CalculatorSkeleton />}>
      <RentVsBuyPageInner />
    </Suspense>
  );
}
