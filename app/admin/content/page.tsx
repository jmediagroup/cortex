'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, CalendarRange, ExternalLink, FileText, Newspaper, Plus } from 'lucide-react';
import { useAdminApi, readError } from '@/components/admin/useAdminApi';
import {
  CONTENT_TYPES,
  CREATABLE_CONTENT_TYPES,
  getContentTypeMeta,
  type ContentTypeKey,
} from '@/lib/cms/content-types';
import {
  AdminPage,
  Button,
  Callout,
  DataTable,
  EmptyState,
  FilterChips,
  IconTile,
  ListGroup,
  ListRow,
  Pill,
  Sheet,
  SkeletonList,
  type PageAction,
  type Tone,
} from '@/components/admin/ui';

interface ContentRow {
  id: string;
  type: string;
  slug: string;
  title: string;
  status: 'draft' | 'published' | 'scheduled' | 'archived';
  published_at: string | null;
  updated_at: string;
}

const STATUS_TONE: Record<ContentRow['status'], Tone> = {
  published: 'green',
  draft: 'gray',
  scheduled: 'blue',
  archived: 'amber',
};

const TYPE_ICONS: Record<ContentTypeKey, typeof FileText> = {
  article: FileText,
  guide: BookOpen,
  daily: Newspaper,
  weekly: CalendarRange,
};

const TYPE_TONE: Record<ContentTypeKey, Tone> = {
  article: 'blue',
  guide: 'green',
  daily: 'violet',
  weekly: 'amber',
};

const fmtDate = (iso: string) => new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

export default function AdminContentList() {
  const api = useAdminApi();
  const router = useRouter();
  const [rows, setRows] = useState<ContentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [newOpen, setNewOpen] = useState(false);

  const load = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);
      if (typeFilter) params.set('type', typeFilter);
      const qs = params.toString() ? `?${params.toString()}` : '';
      const res = await api(`/api/admin/cms/content${qs}`);
      if (!res.ok) throw new Error(await readError(res, 'Failed to load content'));
      setRows((await res.json()).content);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load content');
    } finally {
      setLoading(false);
    }
  }, [api, statusFilter, typeFilter]);

  useEffect(() => {
    setLoading(true);
    void load();
  }, [load]);

  // Types in this list that the public site doesn't read from the CMS yet.
  const offSiteTypes = CONTENT_TYPES.filter(
    (t) => !t.publicReadsFromDb && rows.some((r) => getContentTypeMeta(r.type).key === t.key),
  );
  const filterMeta = typeFilter ? getContentTypeMeta(typeFilter) : null;

  // One creatable type → go straight to the editor; several → pick in a sheet.
  const newAction: PageAction =
    CREATABLE_CONTENT_TYPES.length === 1
      ? { label: `New ${CREATABLE_CONTENT_TYPES[0].label.toLowerCase()}`, icon: Plus, variant: 'primary', href: `/admin/content/new?type=${CREATABLE_CONTENT_TYPES[0].key}` }
      : { label: 'New', icon: Plus, variant: 'primary', onClick: () => setNewOpen(true) };

  const viewLink = (row: ContentRow) => {
    const meta = getContentTypeMeta(row.type);
    return row.status === 'published' && meta.publicReadsFromDb ? `${meta.pathPrefix}/${row.slug}` : null;
  };

  return (
    <AdminPage title="Content" subtitle="Articles, guides and market outlooks" actions={[newAction]} onRefresh={load}>
      <div className="space-y-5">
        <FilterChips
          groups={[
            {
              label: 'Type',
              value: typeFilter,
              onChange: setTypeFilter,
              options: [{ value: '', label: 'All types' }, ...CONTENT_TYPES.map((t) => ({ value: t.key, label: t.short }))],
            },
            {
              label: 'Status',
              value: statusFilter,
              onChange: setStatusFilter,
              options: [
                { value: '', label: 'Any status' },
                { value: 'published', label: 'Published' },
                { value: 'draft', label: 'Draft' },
                { value: 'scheduled', label: 'Scheduled' },
                { value: 'archived', label: 'Archived' },
              ],
            },
          ]}
        />

        {error && <Callout tone="error">{error}</Callout>}

        {!loading && offSiteTypes.length > 0 && (
          <Callout tone="warning" title={`${offSiteTypes.map((t) => `${t.label}s`).join(', ')} don’t publish to the site yet.`}>
            Their public pages are still built from the site&rsquo;s Markdown files, so those rows never appear on the site, even
            when marked published. Publishing them from here is turned off until the site reads them from the CMS.
          </Callout>
        )}

        {loading ? (
          <SkeletonList rows={6} />
        ) : rows.length === 0 ? (
          <EmptyState
            icon={FileText}
            title={`No ${typeFilter ? getContentTypeMeta(typeFilter).label.toLowerCase() : 'content'} yet`}
            action={
              (!filterMeta || filterMeta.publicReadsFromDb) && (
                <Button variant="primary" icon={Plus} href={`/admin/content/new${typeFilter ? `?type=${typeFilter}` : ''}`}>
                  Create your first {typeFilter ? getContentTypeMeta(typeFilter).label.toLowerCase() : 'piece'}
                </Button>
              )
            }
          />
        ) : (
          <DataTable
            rows={rows}
            rowKey={(r) => r.id}
            onRowClick={(r) => router.push(`/admin/content/${r.id}`)}
            mobileRow={(row) => {
              const meta = getContentTypeMeta(row.type);
              return (
                <ListRow
                  href={`/admin/content/${row.id}`}
                  leading={<IconTile icon={TYPE_ICONS[meta.key]} tone={TYPE_TONE[meta.key]} />}
                  title={row.title || '(untitled)'}
                  wrapTitle
                  subtitle={`${meta.label} · ${fmtDate(row.updated_at)}`}
                  trailing={<Pill tone={STATUS_TONE[row.status]}>{row.status}</Pill>}
                />
              );
            }}
            columns={[
              {
                key: 'title',
                header: 'Title',
                cell: (row) => {
                  const meta = getContentTypeMeta(row.type);
                  return (
                    <span className="flex min-w-0 items-center gap-3">
                      <IconTile icon={TYPE_ICONS[meta.key]} tone={TYPE_TONE[meta.key]} size={28} />
                      <span className="min-w-0">
                        <span className="block max-w-[440px] truncate font-semibold text-[var(--ad-label)]">{row.title || '(untitled)'}</span>
                        <span className="block max-w-[440px] truncate text-[13px] text-[var(--ad-label-3)]">
                          {meta.pathPrefix}/{row.slug}
                        </span>
                      </span>
                    </span>
                  );
                },
              },
              { key: 'type', header: 'Type', cell: (row) => getContentTypeMeta(row.type).short },
              { key: 'status', header: 'Status', cell: (row) => <Pill tone={STATUS_TONE[row.status]}>{row.status}</Pill> },
              { key: 'updated', header: 'Updated', align: 'right', cell: (row) => fmtDate(row.updated_at) },
              {
                key: 'view',
                header: <span className="sr-only">View</span>,
                align: 'right',
                cell: (row) => {
                  const href = viewLink(row);
                  return href ? (
                    <a
                      href={href}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[13px] font-semibold text-[var(--ad-tint)] hover:bg-[var(--ad-fill)]"
                    >
                      View <ExternalLink size={12} aria-hidden="true" />
                    </a>
                  ) : null;
                },
              },
            ]}
          />
        )}
      </div>

      <Sheet open={newOpen} onClose={() => setNewOpen(false)} title="New content">
        <ListGroup>
          {CREATABLE_CONTENT_TYPES.map((t) => (
            <ListRow
              key={t.key}
              href={`/admin/content/new?type=${t.key}`}
              leading={<IconTile icon={TYPE_ICONS[t.key]} tone={TYPE_TONE[t.key]} />}
              title={t.label}
              subtitle={t.hint}
            />
          ))}
        </ListGroup>
      </Sheet>
    </AdminPage>
  );
}
