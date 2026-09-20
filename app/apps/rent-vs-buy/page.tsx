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
export default function RentVsBuyPage() {
  return (
    <ToolLayout
      eyebrow="FINANCE · HOUSING"
      title="Rent vs buy reality engine."
      sub="Opportunity cost, maintenance drag, home appreciation, selling costs, and rent growth — the things everyone forgets — all modeled here."
      breadcrumb={<Breadcrumb toolName="Rent vs Buy Reality Engine" />}
      narration="Most people ask whether to rent or buy. You just saw how the answer changes depending on where you live, for how long, and what the market does next."
      footer={
        <>
          <CalculatorSEOContent content={CALCULATOR_CONTENT["rent-vs-buy"]} />
          <RelatedTools tools={getRelatedTools("rent-vs-buy")} />
        </>
      }
    >
      <ToolIsland
        toolId="rent-vs-buy"
        toolName="Rent vs Buy Reality Engine"
        toolPath="/apps/rent-vs-buy"
        upsell={{
          headline: "Compare your city, not the average.",
          sub: "A free account saves scenarios across cities so you can see the full picture over years.",
        }}
      />
    </ToolLayout>
  );
}
