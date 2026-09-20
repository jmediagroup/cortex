import type { Metadata } from 'next';
import { generateCalculatorJsonLd } from '@/lib/calculator-content';

export const metadata: Metadata = {
  title: 'Geographic Arbitrage Calculator - Cost of Living Comparison',
  description: 'Compare income, taxes, and cost of living across all 50 U.S. states. Calculate wealth-building potential through geographic arbitrage.',
  keywords: ['geographic arbitrage calculator', 'cost of living calculator', 'state tax calculator', 'relocation calculator', 'cost of living comparison', 'state income tax calculator', 'moving calculator', 'best states for taxes', 'wealth building by location'],
  openGraph: {
    title: 'Geographic Arbitrage Calculator - Cost of Living Comparison',
    description: 'Compare income, taxes, and cost of living across all 50 U.S. states.',
    type: 'website',
    url: 'https://moneyguymutants.com/apps/geographic-arbitrage',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Geographic Arbitrage Calculator',
    description: 'Compare cost of living and taxes across all 50 U.S. states.',
  },
  alternates: {
    canonical: 'https://moneyguymutants.com/apps/geographic-arbitrage',
  },
};

const jsonLd = generateCalculatorJsonLd('geographic-arbitrage');

export default function GeographicArbitrageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      {children}
    </>
  );
}
