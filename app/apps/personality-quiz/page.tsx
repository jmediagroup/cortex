import { Breadcrumb } from '@/components/ui';
import { ToolLayout } from '@/components/app/ToolLayout';
import CalculatorSEOContent from '@/components/seo/CalculatorSEOContent';
import RelatedTools from '@/components/seo/RelatedTools';
import PersonalityQuizIsland from '@/components/apps/PersonalityQuizIsland';
import { CALCULATOR_CONTENT, getRelatedTools } from '@/lib/calculator-content';

/**
 * Server component: the heading, explainer and FAQ render as static HTML for
 * crawlers. The quiz itself is browser-only (<PersonalityQuizIsland />).
 */
export default function PersonalityQuizPage() {
  return (
    <ToolLayout
      eyebrow="PSYCHOLOGY · QUIZ"
      title="Money personality quiz."
      sub="Ten questions map how you think about money and investing to one of six investor types, with a secondary trait and a breakdown of your scores."
      breadcrumb={<Breadcrumb toolName="Money Personality Quiz" />}
      narration="The investors who win don’t fight their wiring — they build a system around it. Knowing your archetype is step one."
      disclaimer="Educational self-assessment · not personalized advice · results are descriptive, not predictive."
      footer={
        <>
          <CalculatorSEOContent content={CALCULATOR_CONTENT['personality-quiz']} />
          <RelatedTools tools={getRelatedTools('personality-quiz')} />
        </>
      }
    >
      <PersonalityQuizIsland />
    </ToolLayout>
  );
}
