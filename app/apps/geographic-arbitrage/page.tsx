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
export default function GeographicArbitragePage() {
  return (
    <ToolLayout
      eyebrow="FINANCE · COST OF LIVING"
      title="Geographic arbitrage calculator."
      sub="Income, 2026 federal tax, top-marginal state tax estimates, and cost of living modeled across all 50 states."
      breadcrumb={<Breadcrumb toolName="Geographic Arbitrage Calculator" />}
      narration="Most people chase a higher salary. You just saw what that salary is actually worth once rent and taxes are paid."
      footer={
        <>
          <CalculatorSEOContent content={CALCULATOR_CONTENT["geographic-arbitrage"]} />
          <RelatedTools tools={getRelatedTools("geographic-arbitrage")} />
        </>
      }
    >
      <ToolIsland
        toolId="geographic-arbitrage"
        toolName="Geographic Arbitrage Calculator"
        toolPath="/apps/geographic-arbitrage"
        upsell={{
          headline: "Price the move before you make it.",
          sub: "Create a free account to save state comparisons and revisit as your life changes.",
        }}
      />
    </ToolLayout>
  );
}
