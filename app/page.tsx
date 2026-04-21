import type { Metadata } from 'next';
import { MarketingShell } from '@/components/marketing/MarketingShell';
import { MarketingHero } from '@/components/marketing/Hero';
import { MarketingToolGrid } from '@/components/marketing/ToolGrid';
import { MarketingPhilosophy } from '@/components/marketing/Philosophy';
import { MarketingPricingPreview } from '@/components/marketing/PricingPreview';
import { MarketingPrinciplesCTA } from '@/components/marketing/PrinciplesCTA';
import LatestArticles from '@/components/home/LatestArticles';

export const metadata: Metadata = {
  title: 'Cortex — Tools for Long-Term Thinking',
  description:
    'Interactive financial models that turn complexity into clarity — so you can see outcomes before you live them.',
};

export default function LandingPage() {
  return (
    <MarketingShell>
      <MarketingHero />
      <MarketingToolGrid />
      <MarketingPhilosophy />
      <MarketingPricingPreview />
      <LatestArticles />
      <MarketingPrinciplesCTA />
    </MarketingShell>
  );
}
