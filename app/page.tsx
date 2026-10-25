import type { Metadata } from 'next';
import { MarketingShell } from '@/components/marketing/MarketingShell';
import { MarketingHero } from '@/components/marketing/Hero';
import { MarketingToolGrid } from '@/components/marketing/ToolGrid';
import { MarketingPhilosophy } from '@/components/marketing/Philosophy';
import { MarketingPricingPreview } from '@/components/marketing/PricingPreview';
import { MarketingPrinciplesCTA } from '@/components/marketing/PrinciplesCTA';
import LatestArticles from '@/components/home/LatestArticles';

export const metadata: Metadata = {
  title: { absolute: 'Money Guy Mutants: Free Financial Calculators That Show Their Assumptions' },
  description:
    'Free financial calculators that show their assumptions. Interactive models that turn complexity into clarity, so you can see outcomes before you live them.',
  keywords: [
    'financial calculator',
    'compound interest calculator',
    'net worth tracker',
    'retirement calculator',
    'budget planner',
  ],
  alternates: { canonical: 'https://moneyguymutants.com' },
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
