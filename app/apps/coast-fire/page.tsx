import { Breadcrumb } from '@/components/ui';
import CalculatorSEOContent from '@/components/seo/CalculatorSEOContent';
import RelatedTools from '@/components/seo/RelatedTools';
import { CALCULATOR_CONTENT, getRelatedTools } from '@/lib/calculator-content';
import { ToolLayout } from '@/components/app/ToolLayout';
import { ToolIsland } from '@/components/app/ToolIsland';

/**
 * Server component: the heading, intro, FAQ and related links render as
 * static HTML for crawlers. Everything that needs the browser (session, saved
 * scenario, the calculator itself) lives in <ToolIsland />.
 */
export default function CoastFirePage() {
  return (
    <ToolLayout
      eyebrow="FINANCE · RETIREMENT"
      title="Coast FIRE calculator."
      sub="The point where your current investments grow to your retirement number on their own — even if you never save another dollar."
      breadcrumb={<Breadcrumb toolName="Coast FIRE Calculator" />}
      narration="Most people chase a bigger paycheck. You just found the moment you could walk away and still retire on time."
      footer={
        <>
          <CalculatorSEOContent content={CALCULATOR_CONTENT["coast-fire"]} />
          <RelatedTools tools={getRelatedTools("coast-fire")} />
        </>
      }
    >
      <ToolIsland
        toolId="coast-fire"
        toolName="Coast FIRE Calculator"
        toolPath="/apps/coast-fire"
        upsell={{
          headline: "See the rest of the decumulation picture.",
          sub: "Pair Coast FIRE with Retirement Strategy, Budget, and Debt Paydown for a complete long-term read.",
        }}
      />
    </ToolLayout>
  );
}
