import Link from 'next/link';
import type { CalculatorContent, ContentTable } from '@/lib/calculator-content';

interface CalculatorSEOContentProps {
  content: CalculatorContent;
}

const h2 = 'text-lg font-semibold text-[var(--text-primary)] mb-3';
const para = 'text-sm text-[var(--text-secondary)] leading-relaxed mb-3';

export function SectionTable({ table }: { table: ContentTable }) {
  return (
    <figure className="mb-3">
      {/* Shown above the scroll area so it never scrolls out of view; the
          <caption> keeps the table labelled for screen readers. */}
      <p aria-hidden="true" className="mb-2 text-xs text-[var(--text-tertiary)]">
        {table.caption}
      </p>
      <div className="overflow-x-auto rounded-[var(--radius-lg)] border border-[var(--border-primary)]">
        <table className="w-full text-sm text-left">
          <caption className="sr-only">{table.caption}</caption>
          <thead className="bg-[var(--bg-section)]">
            <tr>
              {table.columns.map((col) => (
                <th key={col} scope="col" className="px-3 py-2 font-semibold text-[var(--text-primary)] align-bottom">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row, r) => (
              <tr key={r} className="border-t border-[var(--border-primary)]">
                {row.map((cell, c) =>
                  c === 0 ? (
                    <th key={c} scope="row" className="px-3 py-2 font-medium text-[var(--text-primary)]">
                      {cell}
                    </th>
                  ) : (
                    // Keep figures like "$1,146,073" on one line; let longer text wrap.
                    <td
                      key={c}
                      className={`px-3 py-2 text-[var(--text-secondary)] ${cell.includes(' ') ? '' : 'whitespace-nowrap'}`}
                    >
                      {cell}
                    </td>
                  ),
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {table.note && (
        <figcaption className="mt-2 text-xs text-[var(--text-muted)] leading-relaxed">{table.note}</figcaption>
      )}
    </figure>
  );
}

/**
 * Server-rendered explainer under every tool: intro, long-form sections,
 * FAQ and links to the guides. Crawlers that don't run JavaScript see all of
 * it, so it must stay free of browser-only code.
 */
export default function CalculatorSEOContent({ content }: CalculatorSEOContentProps) {
  return (
    <section className="mt-12 pt-8 border-t border-[var(--border-primary)]">
      <div className="max-w-3xl">
        <h2 className={h2}>About the {content.name}</h2>
        <p className={`${para} mb-8`}>{content.intro}</p>

        {content.sections.map((section) => (
          <div key={section.heading} className="mb-8">
            <h2 className={h2}>{section.heading}</h2>
            {section.paragraphs.map((p, i) => (
              <p key={i} className={para}>
                {p}
              </p>
            ))}
            {section.bullets && (
              <ul className={`${para} list-disc pl-5 space-y-1`}>
                {section.bullets.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            )}
            {section.table && <SectionTable table={section.table} />}
          </div>
        ))}
      </div>

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

      {content.guides.length > 0 && (
        <div className="mt-8 max-w-3xl">
          <h2 className={h2}>Read the guide.</h2>
          <ul className="space-y-2">
            {content.guides.map((g) => (
              <li key={g.slug}>
                <Link
                  href={`/guides/${g.slug}`}
                  className="text-sm font-medium text-[var(--color-accent)] hover:underline"
                >
                  {g.label} →
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
