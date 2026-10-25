import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pricing',
  description: 'Simple, honest pricing for Money Guy Mutants financial decision tools. Start free, upgrade when the math matters. Free calculators. Pro is $9 a month or $90 a year.',
  keywords: ['money guy mutants pricing', 'financial calculator pricing', 'budget tool pricing', 'financial planning software cost', 'retirement calculator subscription'],
  openGraph: {
    title: 'Pricing | Money Guy Mutants',
    description: 'Simple, honest pricing. Start free, upgrade when the math matters.',
    type: 'website',
    url: 'https://moneyguymutants.com/pricing',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pricing | Money Guy Mutants',
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
