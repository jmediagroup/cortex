import type { CalculatorContent } from '@/lib/calculator-content';

interface CalculatorSEOContentProps {
  content: CalculatorContent;
}

export default function CalculatorSEOContent({ content }: CalculatorSEOContentProps) {
  return (
    <section className="mt-12 pt-8 border-t border-[var(--border-primary)]">
      <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-3">
        About the {content.name}
      </h2>
      <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-8 max-w-3xl">
        {content.intro}
      </p>

      {content.faqs.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
            Frequently Asked Questions
          </h2>
          <div className="space-y-3 max-w-3xl">
            {content.faqs.map((faq, index) => (
              <details
                key={index}
                className="group rounded-[var(--radius-lg)] border border-[var(--border-primary)] bg-[var(--surface-primary)]"
              >
                <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-[var(--text-primary)] hover:text-[var(--color-accent)] transition-colors list-none flex items-center justify-between">
                  {faq.question}
                  <span className="ml-2 text-[var(--text-tertiary)] group-open:rotate-180 transition-transform text-xs">&#9660;</span>
                </summary>
                <div className="px-4 pb-4 text-sm text-[var(--text-secondary)] leading-relaxed">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
