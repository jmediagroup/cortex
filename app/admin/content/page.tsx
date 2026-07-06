'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  Plus,
  Loader2,
  FileText,
  BookOpen,
  Newspaper,
  CalendarRange,
  ExternalLink,
  ChevronDown,
} from 'lucide-react';
import { createBrowserClient } from '@/lib/supabase/client';
import {
  CONTENT_TYPES,
  getContentTypeMeta,
  type ContentTypeKey,
} from '@/lib/cms/content-types';

interface ContentRow {
  id: string;
  type: string;
  slug: string;
  title: string;
  status: 'draft' | 'published' | 'scheduled' | 'archived';
  published_at: string | null;
  updated_at: string;
}

const STATUS_STYLES: Record<ContentRow['status'], { bg: string; color: string }> = {
  published: { bg: '#dcfce7', color: 'var(--color-positive)' },
  draft: { bg: 'var(--surface-tertiary)', color: 'var(--text-tertiary)' },
  scheduled: { bg: '#dbeafe', color: 'var(--color-info)' },
  archived: { bg: '#fef3c7', color: 'var(--color-warning)' },
};

const TYPE_ICONS: Record<ContentTypeKey, typeof FileText> = {
  article: FileText,
  guide: BookOpen,
  daily: Newspaper,
  weekly: CalendarRange,
};

export default function AdminContentList() {
  const [rows, setRows] = useState<ContentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [newMenuOpen, setNewMenuOpen] = useState(false);
  const newMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const supabase = createBrowserClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;
      try {
        const params = new URLSearchParams();
        if (statusFilter) params.set('status', statusFilter);
        if (typeFilter) params.set('type', typeFilter);
        const qs = params.toString() ? `?${params.toString()}` : '';
        const res = await fetch(`/api/admin/cms/content${qs}`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (!res.ok) throw new Error((await res.json()).error || 'Failed to load content');
        setRows((await res.json()).content);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load content');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [statusFilter, typeFilter]);

  // Close the "New" menu on outside click.
  useEffect(() => {
    if (!newMenuOpen) return;
    const onClick = (e: MouseEvent) => {
      if (newMenuRef.current && !newMenuRef.current.contains(e.target as Node)) {
        setNewMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [newMenuOpen]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">Content</h1>
          <p className="mt-1 text-sm text-[var(--text-tertiary)] font-medium">
            Articles, guides, and market outlooks managed in the built-in CMS
          </p>
        </div>

        {/* New content type picker */}
        <div className="relative" ref={newMenuRef}>
          <button
            onClick={() => setNewMenuOpen((v) => !v)}
            className="inline-flex items-center gap-2 rounded-[var(--radius-md)] bg-navy px-4 py-2 text-sm font-bold text-white hover:opacity-90"
          >
            <Plus size={16} /> New
            <ChevronDown size={14} className={newMenuOpen ? 'rotate-180 transition-transform' : 'transition-transform'} />
          </button>
          {newMenuOpen && (
            <div className="absolute right-0 z-20 mt-2 w-56 overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-primary)] bg-[var(--surface-primary)] py-1 shadow-lg">
              {CONTENT_TYPES.map((t) => {
                const Icon = TYPE_ICONS[t.key];
                return (
                  <Link
                    key={t.key}
                    href={`/admin/content/new?type=${t.key}`}
                    onClick={() => setNewMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)] hover:text-[var(--text-primary)]"
                  >
                    <span
                      className="flex h-7 w-7 items-center justify-center rounded-[var(--radius-md)]"
                      style={{ backgroundColor: t.badge.bg, color: t.badge.color }}
                    >
                      <Icon size={15} />
                    </span>
                    {t.label}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Type filter */}
      <div className="flex flex-wrap items-center gap-2">
        {[{ key: '', short: 'All types' }, ...CONTENT_TYPES].map((t) => (
          <button
            key={t.key || 'all-types'}
            onClick={() => setTypeFilter(t.key)}
            className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider transition-colors ${
              typeFilter === t.key
                ? 'bg-navy text-white'
                : 'bg-[var(--surface-tertiary)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'
            }`}
          >
            {t.short}
          </button>
        ))}
      </div>

      {/* Status filter */}
      <div className="flex flex-wrap items-center gap-2">
        {['', 'published', 'draft', 'scheduled', 'archived'].map((s) => (
          <button
            key={s || 'all'}
            onClick={() => setStatusFilter(s)}
            className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider transition-colors ${
              statusFilter === s
                ? 'bg-sky text-navy'
                : 'bg-[var(--surface-tertiary)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'
            }`}
          >
            {s || 'All statuses'}
          </button>
        ))}
      </div>

      {error && (
        <div className="rounded-[var(--radius-md)] border border-[var(--crimson-border)] bg-[var(--crimson-50)] px-4 py-3 text-sm font-medium text-[var(--crimson-500)]">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-[var(--color-accent)]" size={28} />
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-[var(--radius-xl)] border border-[var(--border-primary)] bg-[var(--surface-primary)] p-12 text-center">
          <FileText className="mx-auto mb-3 text-[var(--text-tertiary)]" size={28} />
          <p className="text-sm font-medium text-[var(--text-secondary)]">
            No {typeFilter ? getContentTypeMeta(typeFilter).label.toLowerCase() : 'content'} yet.
          </p>
          <Link
            href={`/admin/content/new${typeFilter ? `?type=${typeFilter}` : ''}`}
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-[var(--color-accent)]"
          >
            <Plus size={14} /> Create your first{' '}
            {typeFilter ? getContentTypeMeta(typeFilter).label.toLowerCase() : 'piece of content'}
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border-primary)] bg-[var(--surface-primary)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border-primary)] text-left text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)]">
                <th className="px-5 py-3">Title</th>
                <th className="px-5 py-3">Type</th>
                <th className="px-5 py-3">Status</th>
                <th className="hidden px-5 py-3 md:table-cell">Updated</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const badge = STATUS_STYLES[row.status];
                const typeMeta = getContentTypeMeta(row.type);
                return (
                  <tr
                    key={row.id}
                    className="border-b border-[var(--border-primary)] last:border-0 hover:bg-[var(--surface-secondary)]"
                  >
                    <td className="px-5 py-3">
                      <Link
                        href={`/admin/content/${row.id}`}
                        className="font-semibold text-[var(--text-primary)] hover:text-[var(--color-accent)]"
                      >
                        {row.title || '(untitled)'}
                      </Link>
                      <div className="text-xs text-[var(--text-tertiary)]">
                        {typeMeta.pathPrefix}/{row.slug}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className="inline-block rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider"
                        style={{ backgroundColor: typeMeta.badge.bg, color: typeMeta.badge.color }}
                      >
                        {typeMeta.short}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className="inline-block rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider"
                        style={{ backgroundColor: badge.bg, color: badge.color }}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="hidden px-5 py-3 text-[var(--text-tertiary)] md:table-cell">
                      {new Date(row.updated_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-5 py-3 text-right">
                      {row.status === 'published' && typeMeta.publicReadsFromDb && (
                        <a
                          href={`${typeMeta.pathPrefix}/${row.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--text-tertiary)] hover:text-[var(--color-accent)]"
                        >
                          view <ExternalLink size={11} />
                        </a>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
