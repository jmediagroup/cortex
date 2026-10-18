import type { Metadata } from 'next';
import { generateCalculatorJsonLd, toolMetadata } from '@/lib/calculator-content';

export const metadata: Metadata = toolMetadata('personality-quiz');

const jsonLd = generateCalculatorJsonLd('personality-quiz');

export default function PersonalityQuizLayout({
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
