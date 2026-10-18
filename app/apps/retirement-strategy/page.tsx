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
export default function RetirementStrategyPage() {
  return (
    <ToolLayout
      eyebrow="FINANCE · RETIREMENT"
      title="Roth conversion and withdrawal calculator."
      sub="Model withdrawals from taxable, traditional, and Roth accounts year by year, with RMDs, Roth conversions, and a market-crash stress test."
      breadcrumb={<Breadcrumb toolName="Roth Conversion Calculator" />}
      narration="Most people retire by feel. You just modeled the actual sequence — and the tax bill that comes with it."
      footer={
        <>
          <CalculatorSEOContent content={CALCULATOR_CONTENT["retirement-strategy"]} />
          <RelatedTools tools={getRelatedTools("retirement-strategy")} />
        </>
      }
    >
      <ToolIsland
        toolId="retirement-strategy"
        toolName="Retirement Strategy Engine"
        toolPath="/apps/retirement-strategy"
        upsell={{
          headline: "Retire with the math in front of you.",
          sub: "A free account unlocks the full suite — pair this with Coast FIRE, Net Worth, and Budget to plan the transition.",
        }}
      />
    </ToolLayout>
  );
}
