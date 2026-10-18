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
export default function IndexFundVisualizerPage() {
  return (
    <ToolLayout
      eyebrow="FINANCE · INVESTING"
      title="Index fund calculator."
      sub="A growth visualizer for S&P 500, total market, world, and growth index funds that shows a smooth average next to a bumpy simulated path."
      breadcrumb={<Breadcrumb toolName="Index Fund Calculator" />}
      narration="Most people pick a fund by name. You just saw how much the assumed return — and a bumpy path — move where VOO, VTI, VT, and QQQM could end up."
      footer={
        <>
          <CalculatorSEOContent content={CALCULATOR_CONTENT["index-fund-visualizer"]} />
          <RelatedTools tools={getRelatedTools("index-fund-visualizer")} />
        </>
      }
    >
      <ToolIsland
        toolId="index-fund-visualizer"
        toolName="Index Fund Growth Visualizer"
        toolPath="/apps/index-fund-visualizer"
        upsell={{
          headline: "Run the simulation across decades.",
          sub: "A free account saves scenarios so you can revisit funds, contribution cadences, and timelines over time.",
        }}
      />
    </ToolLayout>
  );
}
