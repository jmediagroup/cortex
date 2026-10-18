import type { Metadata } from 'next';
import { generateCalculatorJsonLd, toolMetadata } from '@/lib/calculator-content';

export const metadata: Metadata = toolMetadata('index-fund-visualizer');

const jsonLd = generateCalculatorJsonLd('index-fund-visualizer');

export default function IndexFundVisualizerLayout({
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
