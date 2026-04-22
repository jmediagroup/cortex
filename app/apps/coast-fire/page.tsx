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

const CoastFIRE = dynamic(() => import('@/components/apps/CoastFIRE'), { ssr: false });

function CoastFIREPageInner() {
  const router = useRouter();
  const { hasSession, isPro, initialValues } = useToolPageData({
    toolId: 'coast-fire',
    toolName: 'Coast FIRE Calculator',
    toolPath: '/apps/coast-fire',
  });

  return (
    <ToolLayout
      eyebrow="FINANCE · RETIREMENT"
      title="Coast FIRE calculator."
      sub="The point where your current investments grow to your retirement number on their own — even if you never save another dollar."
      breadcrumb={<Breadcrumb toolName="Coast FIRE Calculator" />}
      cta={
        !hasSession ? (
          <ToolUpsellCta
            headline="See the rest of the decumulation picture."
            sub="Pair Coast FIRE with Retirement Strategy, Budget, and Debt Paydown for a complete long-term read."
          />
        ) : null
      }
      narration="Most people chase a bigger paycheck. You just found the moment you could walk away and still retire on time."
      footer={
        <>
          <CalculatorSEOContent content={CALCULATOR_CONTENT['coast-fire']} />
          <RelatedTools tools={getRelatedTools('coast-fire')} />
        </>
      }
    >
      <InlineAd context="coast-fire" className="mb-6" />
      <CoastFIRE
        isPro={isPro}
        onUpgrade={() => router.push('/pricing')}
        isLoggedIn={hasSession}
        initialValues={initialValues}
      />
    </ToolLayout>
  );
}

export default function CoastFIREPage() {
  return (
    <Suspense fallback={<CalculatorSkeleton />}>
      <CoastFIREPageInner />
    </Suspense>
  );
}
