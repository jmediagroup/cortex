import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'S-Corp Tax Calculator - Self-Employment Tax Savings Tool',
  description: 'Calculate S-Corp tax savings and find your ideal salary/distribution split. Maximize self-employment tax savings with our free S-Corporation tax optimizer.',
  keywords: ['S-Corp calculator', 's-corporation tax calculator', 'self-employment tax savings', 'S-Corp salary calculator', 'distribution vs salary', 'S-Corp tax optimizer', 'small business tax calculator', 'LLC vs S-Corp calculator', 'self-employment tax calculator', 'business tax savings'],
  openGraph: {
    title: 'S-Corp Tax Calculator - Self-Employment Tax Savings Tool',
    description: 'Calculate S-Corp tax savings and find your ideal salary/distribution split.',
    type: 'website',
    url: 'https://cortex.io/apps/s-corp-optimizer',
    images: [{
      url: '/og-s-corp.png',
      width: 1200,
      height: 630,
      alt: 'Cortex S-Corp Tax Calculator',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'S-Corp Tax Calculator',
    description: 'Calculate S-Corp tax savings and find your ideal salary/distribution split.',
    images: ['/og-s-corp.png'],
  },
  alternates: {
    canonical: 'https://cortex.io/apps/s-corp-optimizer',
  },
};

export default function SCorpOptimizerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
