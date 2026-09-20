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
export default function DebtPaydownPage() {
  return (
    <ToolLayout
      eyebrow="FINANCE · DEBT"
      title="Debt paydown optimizer."
      sub="Compare avalanche versus snowball with psychological weighting and opportunity cost built in."
      breadcrumb={<Breadcrumb toolName="Debt Paydown Optimizer" />}
      narration="Most advice picks one strategy. You just saw which one gets you out fastest — and what it costs to choose the one that feels better."
      footer={
        <>
          <CalculatorSEOContent content={CALCULATOR_CONTENT["debt-paydown"]} />
          <RelatedTools tools={getRelatedTools("debt-paydown")} />
        </>
      }
    >
      <ToolIsland
        toolId="debt-paydown"
        toolName="Debt Paydown Optimizer"
        toolPath="/apps/debt-paydown"
        upsell={{
          headline: "See every payoff scenario side by side.",
          sub: "Free accounts save strategies so you can come back and compare across months.",
        }}
      />
    </ToolLayout>
  );
}
