import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Compound Interest Calculator - Free Investment Growth Tool',
  description: 'Calculate compound interest and visualize long-term wealth growth. See how your investments grow over time with custom contributions. Free tool for retirement planning and investment analysis.',
  keywords: ['compound interest calculator', 'investment calculator', 'wealth growth calculator', 'retirement savings calculator', 'compound growth', 'investment growth calculator', 'savings calculator', 'compound returns', 'long-term investment calculator', 'wealth accumulation calculator'],
  openGraph: {
    title: 'Compound Interest Calculator - Free Investment Growth Tool',
    description: 'Calculate compound interest and visualize long-term wealth growth with custom contributions.',
    type: 'website',
    url: 'https://cortex.vip/apps/compound-interest',
    images: [{
      url: '/og-compound-interest.png',
      width: 1200,
      height: 630,
      alt: 'Cortex Compound Interest Calculator',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Compound Interest Calculator',
    description: 'Calculate compound interest and visualize long-term wealth growth.',
    images: ['/og-compound-interest.png'],
  },
  alternates: {
    canonical: 'https://cortex.vip/apps/compound-interest',
  },
};

export default function CompoundInterestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
