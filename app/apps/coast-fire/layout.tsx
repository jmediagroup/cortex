import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Coast FIRE Calculator - Calculate Your Financial Freedom Point',
  description: 'Calculate your Coast FIRE number and discover when you can stop saving for retirement. Free calculator with advanced features including Barista FIRE analysis, flexibility scoring, and lifestyle scenario planning.',
  keywords: [
    'coast fire calculator',
    'coast fire',
    'fire calculator',
    'financial independence calculator',
    'retirement calculator',
    'barista fire',
    'lean fire calculator',
    'fat fire calculator',
    'early retirement calculator',
    'compound growth calculator',
    'fire number calculator',
    'work optional calculator',
    'financial freedom calculator'
  ],
  openGraph: {
    title: 'Coast FIRE Calculator - Calculate Your Financial Freedom Point',
    description: 'Calculate your Coast FIRE number and discover when you can stop saving for retirement. Free calculator with Barista FIRE analysis and lifestyle scenarios.',
    type: 'website',
    url: 'https://cortex.vip/apps/coast-fire',
    images: [{
      url: '/og-coast-fire.png',
      width: 1200,
      height: 630,
      alt: 'Cortex Coast FIRE Calculator',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Coast FIRE Calculator',
    description: 'Calculate your Coast FIRE number and discover when you can stop saving for retirement.',
    images: ['/og-coast-fire.png'],
  },
  alternates: {
    canonical: 'https://cortex.vip/apps/coast-fire',
  },
};

export default function CoastFIRELayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
