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
      title="S corp solo 401(k) contribution calculator."
      sub="For S corp owners: employee deferrals, company profit sharing, IRA, and HSA modeled together with 2026 limits, while keeping owner pay reasonable. A Pro tool."
      breadcrumb={<Breadcrumb toolName="S Corp Solo 401(k) Calculator" />}
      narration="Most S-Corp owners default to a Roth IRA. This tool shows what a Solo 401(k) plus a company contribution does to the retirement number."
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
