import type { Metadata } from 'next';
import { generateCalculatorJsonLd } from '@/lib/calculator-content';

export const metadata: Metadata = {
  title: 'S-Corp Retirement Contribution Calculator - 401k Optimizer',
  description: 'Maximize retirement savings through S-Corp contributions. Calculate employee deferrals, profit sharing, and company matching for S-Corporation owners.',
  keywords: ['S-Corp 401k calculator', 's-corporation retirement', 'S-Corp retirement calculator', 'solo 401k calculator', 'profit sharing calculator', 'S-Corp contribution calculator', 'small business retirement', 'S-Corp retirement planning'],
  openGraph: {
    title: 'S-Corp Retirement Contribution Calculator - 401k Optimizer',
    description: 'Maximize retirement savings through S-Corp contributions and profit sharing.',
    type: 'website',
    url: 'https://moneyguymutants.com/apps/s-corp-investment',
    images: [{
      url: '/og-s-corp-investment.png',
      width: 1200,
      height: 630,
      alt: 'Money Guy Mutants S-Corp Investment Calculator',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'S-Corp Retirement Contribution Calculator',
    description: 'Maximize retirement savings through S-Corp contributions.',
    images: ['/og-s-corp-investment.png'],
  },
  alternates: {
    canonical: 'https://moneyguymutants.com/apps/s-corp-investment',
  },
};

const jsonLd = generateCalculatorJsonLd('s-corp-investment');

export default function SCorpInvestmentLayout({
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
