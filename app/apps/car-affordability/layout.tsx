import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Car Affordability Calculator - 20/3/8 Rule Auto Loan Tool',
  description: 'Calculate how much car you can afford using the 20/3/8 rule. Factor in depreciation, opportunity cost, and true cost of vehicle ownership.',
  keywords: ['car affordability calculator', 'auto loan calculator', '20/3/8 rule calculator', 'car buying calculator', 'vehicle affordability', 'car payment calculator', 'auto financing calculator', 'car depreciation calculator', 'true cost of car ownership'],
  openGraph: {
    title: 'Car Affordability Calculator - 20/3/8 Rule Auto Loan Tool',
    description: 'Calculate how much car you can afford using the 20/3/8 rule with depreciation analysis.',
    type: 'website',
    url: 'https://cortex.io/apps/car-affordability',
    images: [{
      url: '/og-car.png',
      width: 1200,
      height: 630,
      alt: 'Cortex Car Affordability Calculator',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Car Affordability Calculator - 20/3/8 Rule',
    description: 'Calculate how much car you can afford using the 20/3/8 rule.',
    images: ['/og-car.png'],
  },
  alternates: {
    canonical: 'https://cortex.io/apps/car-affordability',
  },
};

export default function CarAffordabilityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
