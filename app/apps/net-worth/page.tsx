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
export default function NetWorthPage() {
  return (
    <ToolLayout
      eyebrow="FINANCE · NET WORTH"
      title="Net worth engine."
      sub="Track assets and liabilities, analyze liquidity, and visualize your financial trajectory over time."
      breadcrumb={<Breadcrumb toolName="Net Worth Engine" />}
      narration="Most people know their checking balance. You just saw the whole balance sheet in one frame."
      footer={
        <>
          <CalculatorSEOContent content={CALCULATOR_CONTENT["net-worth"]} />
          <RelatedTools tools={getRelatedTools("net-worth")} />
        </>
      }
    >
      <ToolIsland
        toolId="net-worth"
        toolName="Net Worth Engine"
        toolPath="/apps/net-worth"
        upsell={{
          headline: "Map the whole balance sheet.",
          sub: "A free account unlocks the full Finance suite — Coast FIRE, Retirement, Debt Paydown, and Budget.",
        }}
      />
    </ToolLayout>
  );
}
