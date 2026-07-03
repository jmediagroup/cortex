import type { Metadata } from 'next';
import { generateCalculatorJsonLd } from '@/lib/calculator-content';

export const metadata: Metadata = {
  title: 'Capital Gains Tax Calculator (2026) - 0%, 15%, 20% Brackets',
  description:
    'See how much stock you can sell before each tax cliff. Models the 2026 long-term capital-gains brackets (0/15/20%), NIIT, QBI, the ACA subsidy cliff, Medicare IRMAA, and Virginia tax. Free capital gains tax estimator.',
  keywords: ['capital gains tax calculator', 'long-term capital gains 2026', '0% capital gains bracket', 'capital gains tax brackets', 'NIIT calculator', 'IRMAA calculator', 'ACA subsidy cliff', 'stock sale tax calculator', 'Virginia capital gains tax', 'qualified dividends tax'],
  openGraph: {
    title: 'Capital Gains Tax Calculator (2026) - 0%, 15%, 20% Brackets',
    description: 'See how much stock you can sell before each tax cliff. Models the 2026 0/15/20% brackets, NIIT, QBI, ACA, IRMAA, and Virginia tax.',
    type: 'website',
    url: 'https://moneyguymutants.com/apps/capital-gains-tax',
    images: [{
      url: '/og-image.png',
      width: 1200,
      height: 630,
      alt: 'Money Guy Mutants Capital Gains Tax Calculator',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Capital Gains Tax Calculator (2026)',
    description: 'See how much stock you can sell before each tax cliff — 0/15/20% brackets, NIIT, ACA, and IRMAA.',
    images: ['/og-image.png'],
  },
  alternates: {
    canonical: 'https://moneyguymutants.com/apps/capital-gains-tax',
  },
};

const jsonLd = generateCalculatorJsonLd('capital-gains-tax');

export default function CapitalGainsTaxLayout({
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
