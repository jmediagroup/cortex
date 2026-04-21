import Link from 'next/link';
import { Home, ChevronRight } from 'lucide-react';

interface BreadcrumbProps {
  toolName: string;
}

export default function Breadcrumb({ toolName }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm mb-6">
      <Link
        href="/"
        className="flex items-center gap-1.5 text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
      >
        <Home size={14} />
        <span>Apps</span>
      </Link>
      <ChevronRight size={14} className="text-[var(--text-muted)]" />
      <span className="text-[var(--text-secondary)] font-medium">{toolName}</span>
    </nav>
  );
}
