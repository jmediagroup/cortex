import type { Metadata } from 'next';
import Link from 'next/link';
import CalculatorSEOContent from '@/components/seo/CalculatorSEOContent';
import RelatedTools from '@/components/seo/RelatedTools';
import {
  CALCULATOR_CONTENT,
  generateCalculatorJsonLd,
  getRelatedTools,
  toolMetadata,
} from '@/lib/calculator-content';

export const metadata: Metadata = toolMetadata('budget');

const jsonLd = generateCalculatorJsonLd('budget');

export default function BudgetLayout({
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

      {/* Rendered here, not in the client page, so the registry stays out of the
        browser bundle and crawlers get the explainer as static HTML. */}
      <div className="max-w-7xl mx-auto px-6">
        <CalculatorSEOContent content={CALCULATOR_CONTENT['budget']} />
        <RelatedTools tools={getRelatedTools('budget')} />
      </div>

      <footer className="max-w-7xl mx-auto px-6 py-10 text-center border-t border-[var(--border-subtle)] mt-8">
        <p className="text-xs text-[var(--text-muted)] font-medium">&copy; {new Date().getFullYear()} J Media Group LLC. Tools for Long-Term Thinking.</p>
        <div className="flex items-center justify-center gap-3 mt-2">
          <Link href="/articles" className="text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors text-xs">Articles</Link>
          <span className="text-[var(--text-muted)]">|</span>
          <Link href="/pricing" className="text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors text-xs">Pricing</Link>
          <span className="text-[var(--text-muted)]">|</span>
          <Link href="/terms" className="text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors text-xs">Terms & Privacy</Link>
        </div>
      </footer>
    </>
  );
}
