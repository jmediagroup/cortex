import type { Metadata } from 'next';
import { MarketingShell } from '@/components/marketing/MarketingShell';
import { MarketingHero } from '@/components/marketing/Hero';
import { MarketingToolGrid } from '@/components/marketing/ToolGrid';
import { MarketingPhilosophy } from '@/components/marketing/Philosophy';
import { MarketingPricingPreview } from '@/components/marketing/PricingPreview';
import { MarketingPrinciplesCTA } from '@/components/marketing/PrinciplesCTA';
import LatestArticles from '@/components/home/LatestArticles';

export const metadata: Metadata = {
  title: 'Money Guy Mutants — Tools for Long-Term Thinking',
  description:
    'Free financial calculators and decision engines for financial mutants and fans of the Money Guy Show. Interactive models that turn complexity into clarity — so you can see outcomes before you live them.',
  keywords: [
    'money guy',
    'moneyguy',
    'money guy show',
    'financial mutants',
    'financial mutant',
    'money guy show tools',
    'financial order of operations',
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
