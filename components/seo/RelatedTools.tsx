import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { RelatedTool } from '@/lib/calculator-content';

interface RelatedToolsProps {
  tools: RelatedTool[];
}

export default function RelatedTools({ tools }: RelatedToolsProps) {
  if (tools.length === 0) return null;

  return (
    <section className="mt-12 pt-8 border-t border-[var(--border-primary)]">
      <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
        Related Financial Tools
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tools.map((tool) => (
          <Link
            key={tool.slug}
            href={`/apps/${tool.slug}`}
            className="group rounded-[var(--radius-xl)] border border-[var(--border-primary)] bg-[var(--surface-primary)] p-4 hover-lift"
            style={{ boxShadow: 'var(--shadow-card)' }}
          >
            <h3 className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--color-accent)] transition-colors mb-1">
              {tool.name}
            </h3>
            <p className="text-xs text-[var(--text-secondary)] line-clamp-2 mb-3">
              {tool.description}
            </p>
            <span className="inline-flex items-center gap-1 text-xs font-medium text-[var(--color-accent)]">
              Try it free
              <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
