import type { Metadata } from 'next';
import { generateCalculatorJsonLd } from '@/lib/calculator-content';

export const metadata: Metadata = {
  title: 'Rent vs Buy Calculator - Home Ownership Cost Comparison',
  description: 'Compare renting vs buying a home with real-world factors: opportunity cost, maintenance, taxes, and mobility. Make informed housing decisions.',
  keywords: ['rent vs buy calculator', 'rent or buy calculator', 'home buying calculator', 'renting vs buying', 'home ownership calculator', 'real estate calculator', 'mortgage vs rent', 'housing cost calculator', 'home affordability calculator'],
  openGraph: {
    title: 'Rent vs Buy Calculator - Home Ownership Cost Comparison',
    description: 'Compare renting vs buying a home with opportunity cost, maintenance, and tax factors.',
    type: 'website',
    url: 'https://moneyguymutants.com/apps/rent-vs-buy',
    images: [{
      url: '/og-rent-vs-buy.png',
      width: 1200,
      height: 630,
      alt: 'Money Guy Mutants Rent vs Buy Calculator',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Rent vs Buy Calculator',
    description: 'Compare renting vs buying a home with real-world factors.',
    images: ['/og-rent-vs-buy.png'],
  },
  alternates: {
    canonical: 'https://moneyguymutants.com/apps/rent-vs-buy',
  },
};

const jsonLd = generateCalculatorJsonLd('rent-vs-buy');

export default function RentVsBuyLayout({
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
