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
export default function SCorpOptimizerPage() {
  return (
    <ToolLayout
      eyebrow="FINANCE · SMALL BUSINESS"
      title="S corp tax savings calculator."
      sub="Compare self-employment tax as an LLC with payroll tax as an S corp, see the distribution left over, and get a flag if the salary looks too low to be reasonable."
      breadcrumb={<Breadcrumb toolName="S Corp Tax Savings Calculator" />}
      narration="Most S-Corp owners pay the default. You just saw the split that keeps you compliant and cuts the tax bill."
      footer={
        <>
          <CalculatorSEOContent content={CALCULATOR_CONTENT["s-corp-optimizer"]} />
          <RelatedTools tools={getRelatedTools("s-corp-optimizer")} />
        </>
      }
    >
      <ToolIsland
        toolId="s-corp-optimizer"
        toolName="S-Corp Optimizer"
        toolPath="/apps/s-corp-optimizer"
        upsell={{
          headline: "Keep more of what the business earns.",
          sub: "A free account saves S-Corp scenarios so you can compare salary/distribution splits across years.",
        }}
      />
    </ToolLayout>
  );
}
