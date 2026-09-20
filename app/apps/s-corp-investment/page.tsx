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
export default function SCorpInvestmentPage() {
  return (
    <ToolLayout
      eyebrow="FINANCE · SMALL BUSINESS"
      title="S-Corp investment optimizer."
      sub="Maximize retirement contributions while keeping your owner compensation reasonable — employee deferrals, company match, IRA, and HSA all modeled with 2026 limits."
      breadcrumb={<Breadcrumb toolName="S-Corp Investment Optimizer" />}
      narration="Most S-Corp owners default to a Roth IRA. You just saw what a Solo 401(k) plus a company contribution does to the retirement number."
      footer={
        <>
          <CalculatorSEOContent content={CALCULATOR_CONTENT["s-corp-investment"]} />
          <RelatedTools tools={getRelatedTools("s-corp-investment")} />
        </>
      }
    >
      <ToolIsland
        toolId="s-corp-investment"
        toolName="S-Corp Investment Optimizer"
        toolPath="/apps/s-corp-investment"
        upsell={{
          headline: "Retirement plans are a business decision.",
          sub: "A free account saves contribution scenarios so you can revisit them as profit rises.",
        }}
      />
    </ToolLayout>
  );
}
