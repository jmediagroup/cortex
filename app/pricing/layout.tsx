import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pricing - Money Guy Mutants Financial Tools',
  description: 'Simple, honest pricing for Money Guy Mutants financial decision tools. Start free, upgrade when the math matters. Plans from $0 to $29/month.',
  keywords: ['cortex pricing', 'financial calculator pricing', 'budget tool pricing', 'financial planning software cost', 'retirement calculator subscription'],
  openGraph: {
    title: 'Pricing - Money Guy Mutants Financial Tools',
    description: 'Simple, honest pricing. Start free, upgrade when the math matters.',
    type: 'website',
    url: 'https://moneyguymutants.com/pricing',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pricing - Money Guy Mutants Financial Tools',
    description: 'Simple, honest pricing. Start free, upgrade when the math matters.',
  },
  alternates: {
    canonical: 'https://moneyguymutants.com/pricing',
  },
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
