import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pricing - Cortex Financial Tools',
  description: 'Simple, honest pricing for Cortex financial decision tools. Start free, upgrade when the math matters. Plans from $0 to $29/month.',
  keywords: ['cortex pricing', 'financial calculator pricing', 'budget tool pricing', 'financial planning software cost', 'retirement calculator subscription'],
  openGraph: {
    title: 'Pricing - Cortex Financial Tools',
    description: 'Simple, honest pricing. Start free, upgrade when the math matters.',
    type: 'website',
    url: 'https://cortex.vip/pricing',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pricing - Cortex Financial Tools',
    description: 'Simple, honest pricing. Start free, upgrade when the math matters.',
  },
  alternates: {
    canonical: 'https://cortex.vip/pricing',
  },
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
