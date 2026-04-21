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

const GamblingRedirect = dynamic(() => import('@/components/apps/GamblingRedirect'), { ssr: false });

function GamblingRedirectPageInner() {
  const router = useRouter();
  const { hasSession, isPro, initialValues } = useToolPageData({
    toolId: 'gambling-redirect',
    toolName: 'Gambling Spend Redirect',
    toolPath: '/apps/gambling-redirect',
  });

  return (
    <ToolLayout
      eyebrow="FINANCE · BEHAVIOR"
      title="Gambling spend redirect."
      sub="See the wealth gap between playing the odds and owning the market — then redirect toward real, boring compounding."
      breadcrumb={<Breadcrumb toolName="Gambling Spend Redirect" />}
      cta={
        !hasSession ? (
          <ToolUpsellCta
            headline="Redirect the spend. Track the growth."
            sub="A free account lets you save the redirect scenario and watch the compounding in real time."
          />
        ) : null
      }
      narration="Most scoreboards track the last bet. You just saw what that money would have been worth in twenty years."
      footer={
        <>
          <CalculatorSEOContent content={CALCULATOR_CONTENT['gambling-redirect']} />
          <RelatedTools tools={getRelatedTools('gambling-redirect')} />
        </>
      }
    >
      <InlineAd context="gambling-redirect" className="mb-6" />
      <GamblingRedirect
        isPro={isPro}
        onUpgrade={() => router.push('/pricing')}
        isLoggedIn={hasSession}
        initialValues={initialValues}
      />
    </ToolLayout>
  );
}

export default function GamblingRedirectPage() {
  return (
    <Suspense fallback={<CalculatorSkeleton />}>
      <GamblingRedirectPageInner />
    </Suspense>
  );
}
