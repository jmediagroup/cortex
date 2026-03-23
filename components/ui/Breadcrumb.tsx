import Link from 'next/link';
import { Home, ChevronRight } from 'lucide-react';

interface BreadcrumbProps {
  toolName: string;
}

export default function Breadcrumb({ toolName }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm mb-6">
      <Link
        href="/dashboard"
        className="flex items-center gap-1.5 text-slate-400 hover:text-slate-600 transition-colors"
      >
        <Home size={14} />
        <span>Apps</span>
      </Link>
      <ChevronRight size={14} className="text-slate-300" />
      <span className="text-slate-600 font-medium">{toolName}</span>
    </nav>
  );
}
