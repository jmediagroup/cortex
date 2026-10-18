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
export default function GamblingRedirectPage() {
  return (
    <ToolLayout
      eyebrow="FINANCE · BEHAVIOR"
      title="Gambling vs investing calculator."
      sub="Enter what you spend on betting each month and see what the same money could grow to if it were invested instead."
      breadcrumb={<Breadcrumb toolName="Gambling vs Investing Calculator" />}
      narration="Most scoreboards track the last bet. You just saw what that money would have been worth in twenty years."
      footer={
        <>
          <CalculatorSEOContent content={CALCULATOR_CONTENT["gambling-redirect"]} />
          <RelatedTools tools={getRelatedTools("gambling-redirect")} />
        </>
      }
    >
      <ToolIsland
        toolId="gambling-redirect"
        toolName="Gambling Spend Redirect"
        toolPath="/apps/gambling-redirect"
        upsell={{
          headline: "Redirect the spend. Track the growth.",
          sub: "A free account lets you save the redirect scenario and watch the compounding in real time.",
        }}
      />
    </ToolLayout>
  );
}
