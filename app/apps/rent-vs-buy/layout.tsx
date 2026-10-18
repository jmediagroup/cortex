import type { Metadata } from 'next';
import { generateCalculatorJsonLd, toolMetadata } from '@/lib/calculator-content';

export const metadata: Metadata = toolMetadata('rent-vs-buy');

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
