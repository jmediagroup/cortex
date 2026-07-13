'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { Breadcrumb, CalculatorSkeleton } from '@/components/ui';
import { ToolLayout, ToolUpsellCta } from '@/components/app/ToolLayout';
import { useToolPageData } from '@/lib/useToolPageData';

const WhatsYourWhy = dynamic(() => import('@/components/apps/WhatsYourWhy'), {
  ssr: false,
});

function WhatsYourWhyPageInner() {
  const { hasSession } = useToolPageData({
    toolId: 'whats-your-why',
    toolName: "What's Your Why",
    toolPath: '/apps/whats-your-why',
  });

  return (
    <ToolLayout
      eyebrow="PSYCHOLOGY · REFLECTION"
      title="What's your why?"
      sub="Strategies fail without a clear reason underneath them. Answer eight guided questions and we'll reflect your real relationship with money back to you — before any budget, plan, or portfolio."
      breadcrumb={<Breadcrumb toolName="What's Your Why" />}
      cta={
        !hasSession ? (
          <ToolUpsellCta
            headline="Reveal your why with a free account."
            sub="Create a free account to generate your personal reflection — then pair it with the tools that turn a why into a plan."
          />
        ) : null
      }
      narration="Most people jump straight to tactics. The ones who stick with it first get honest about why they're doing any of it at all."
      disclaimer="Reflective self-assessment · not personalized financial or psychological advice · your answers are private to your account."
    >
      <WhatsYourWhy isLoggedIn={hasSession} />
    </ToolLayout>
  );
}

export default function WhatsYourWhyPage() {
  return (
    <Suspense fallback={<CalculatorSkeleton />}>
      <WhatsYourWhyPageInner />
    </Suspense>
  );
}
