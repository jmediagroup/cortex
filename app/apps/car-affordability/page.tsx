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
export default function CarAffordabilityPage() {
  return (
    <ToolLayout
      eyebrow="FINANCE · VEHICLES"
      title="Car affordability calculator."
      sub="How much car your income supports under the 20/3/8 rule — 20% down, a 3-year loan, and a payment capped at 8% of gross income."
      breadcrumb={<Breadcrumb toolName="Car Affordability Calculator" />}
      narration="Most people start from the sticker price. You just sized the price from a payment your income can actually carry."
      footer={
        <>
          <CalculatorSEOContent content={CALCULATOR_CONTENT["car-affordability"]} />
          <RelatedTools tools={getRelatedTools("car-affordability")} />
        </>
      }
    >
      <ToolIsland
        toolId="car-affordability"
        toolName="Car Affordability Calculator"
        toolPath="/apps/car-affordability"
        upsell={{
          headline: "Save scenarios and compare over time.",
          sub: "Create a free account to save this result, come back later, and compare across vehicles.",
        }}
      />
    </ToolLayout>
  );
}
