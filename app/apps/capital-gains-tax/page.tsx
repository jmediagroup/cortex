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
export default function CapitalGainsTaxPage() {
  return (
    <ToolLayout
      eyebrow="FINANCE · TAX"
      title="Capital-gains tax efficiency."
      sub="If you sell this much stock, what actually happens? Models the 0/15/20% long-term brackets — plus NIIT, QBI, ACA and IRMAA cliffs — for tax year 2026, Virginia resident."
      breadcrumb={<Breadcrumb toolName="Capital Gains Tax" />}
      narration="Most of a gain can be tax-free if it fits under the 0% bracket. You just saw exactly how much room you have — and where the next cliff sits."
      footer={
        <>
          <CalculatorSEOContent content={CALCULATOR_CONTENT["capital-gains-tax"]} />
          <RelatedTools tools={getRelatedTools("capital-gains-tax")} />
        </>
      }
    >
      <ToolIsland
        toolId="capital-gains-tax"
        toolName="Capital Gains Tax Estimator"
        toolPath="/apps/capital-gains-tax"
        upsell={{
          headline: "See the cliffs before you cross them.",
          sub: "A free account lets you save and compare capital-gains scenarios across tax years.",
        }}
      />
    </ToolLayout>
  );
}
