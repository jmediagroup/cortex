'use client';

import dynamic from 'next/dynamic';
import { Breadcrumb } from '@/components/ui';
import { ToolLayout } from '@/components/app/ToolLayout';

const PersonalityQuiz = dynamic(
  () => import('@/components/apps/PersonalityQuiz'),
  { ssr: false },
);

export default function PersonalityQuizPage() {
  return (
    <ToolLayout
      eyebrow="PSYCHOLOGY · QUIZ"
      title="Financial personality quiz."
      sub="Ten questions. Six archetypes. Find out exactly how you’re wired around money — and what that means for the way you build wealth."
      breadcrumb={<Breadcrumb toolName="Financial Personality Quiz" />}
      narration="The investors who win don’t fight their wiring — they build a system around it. Knowing your archetype is step one."
      disclaimer="Educational self-assessment · not personalized advice · results are descriptive, not predictive."
    >
      <PersonalityQuiz />
    </ToolLayout>
  );
}
