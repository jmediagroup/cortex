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
export default function CompoundInterestPage() {
  return (
    <ToolLayout
      eyebrow="FINANCE · CALCULATOR"
      title="Compound interest calculator."
      sub="Visualize long-term wealth accumulation with custom contribution schedules. Adjust principal, monthly contribution, and expected return to see how small changes compound."
      breadcrumb={<Breadcrumb toolName="Compound Interest Calculator" />}
      narration="Most people see the monthly contribution. You just saw the 30-year opportunity cost."
      footer={
        <>
          <CalculatorSEOContent content={CALCULATOR_CONTENT["compound-interest"]} />
          <RelatedTools tools={getRelatedTools("compound-interest")} />
        </>
      }
    >
      <ToolIsland
        toolId="compound-interest"
        toolName="Compound Interest Calculator"
        toolPath="/apps/compound-interest"
        upsell={{
          headline: "Unlock the full Finance suite.",
          sub: "Create a free account to access Retirement Strategy, Budget Optimizer, Net Worth, Debt Paydown, and more.",
        }}
      />
    </ToolLayout>
  );
}
