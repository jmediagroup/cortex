import type { Metadata } from 'next';
import { generateCalculatorJsonLd } from '@/lib/calculator-content';

export const metadata: Metadata = {
  title: 'Debt Payoff Calculator - Avalanche vs Snowball Method',
  description: 'Compare debt paydown strategies: avalanche, snowball, and hybrid methods. Calculate payoff timelines with psychological weighting and opportunity cost.',
  keywords: ['debt payoff calculator', 'debt snowball calculator', 'debt avalanche calculator', 'debt paydown calculator', 'debt elimination calculator', 'debt reduction calculator', 'pay off debt calculator', 'debt strategy calculator', 'debt free calculator'],
  openGraph: {
    title: 'Debt Payoff Calculator - Avalanche vs Snowball Method',
    description: 'Compare debt paydown strategies with psychological weighting and opportunity cost analysis.',
    type: 'website',
    url: 'https://moneyguymutants.com/apps/debt-paydown',
    images: [{
      url: '/og-debt.png',
      width: 1200,
      height: 630,
      alt: 'Money Guy Mutants Debt Payoff Calculator',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Debt Payoff Calculator',
    description: 'Compare debt paydown strategies: avalanche vs snowball methods.',
    images: ['/og-debt.png'],
  },
  alternates: {
    canonical: 'https://moneyguymutants.com/apps/debt-paydown',
  },
};

const jsonLd = generateCalculatorJsonLd('debt-paydown');

export default function DebtPaydownLayout({
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
