import type { Metadata } from 'next';
import { generateCalculatorJsonLd, toolMetadata } from '@/lib/calculator-content';

export const metadata: Metadata = toolMetadata('s-corp-optimizer');

const jsonLd = generateCalculatorJsonLd('s-corp-optimizer');

export default function SCorpOptimizerLayout({
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
