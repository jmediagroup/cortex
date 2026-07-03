import type { Metadata } from 'next';
import { generateCalculatorJsonLd } from '@/lib/calculator-content';

export const metadata: Metadata = {
  title: 'Gambling Spend Redirect Calculator - See Your Money\'s True Potential',
  description: 'Calculate what your gambling budget could become if invested in the S&P 500. Visualize the opportunity cost of gambling versus long-term wealth building. Free tool for financial awareness.',
  keywords: ['gambling calculator', 'gambling opportunity cost', 'betting to investing calculator', 'gambling recovery', 'financial wellness', 'sports betting calculator', 'gambling vs investing', 'wealth building calculator', 'compound interest gambling', 'stop gambling calculator'],
  openGraph: {
    title: 'Gambling Spend Redirect Calculator - See Your Money\'s True Potential',
    description: 'Calculate what your gambling budget could become if invested. Visualize the wealth gap between betting and building.',
    type: 'website',
    url: 'https://moneyguymutants.com/apps/gambling-redirect',
    images: [{
      url: '/og-gambling-redirect.png',
      width: 1200,
      height: 630,
      alt: 'Money Guy Mutants Gambling Spend Redirect Calculator',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Gambling Spend Redirect Calculator',
    description: 'See what your gambling budget could become if invested in the market.',
    images: ['/og-gambling-redirect.png'],
  },
  alternates: {
    canonical: 'https://moneyguymutants.com/apps/gambling-redirect',
  },
};

const jsonLd = generateCalculatorJsonLd('gambling-redirect');

export default function GamblingRedirectLayout({
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
