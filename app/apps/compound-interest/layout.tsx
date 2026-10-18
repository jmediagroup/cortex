import type { Metadata } from 'next';
import { generateCalculatorJsonLd, toolMetadata } from '@/lib/calculator-content';

export const metadata: Metadata = toolMetadata('compound-interest');

const jsonLd = generateCalculatorJsonLd('compound-interest');

export default function CompoundInterestLayout({
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
