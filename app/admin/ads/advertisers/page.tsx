'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, Plus } from 'lucide-react';
import { useAdminApi, readError } from '@/components/admin/useAdminApi';
import { ADVERTISER_CATEGORIES, type AdvertiserCategory, type AdvertiserRow } from '@/lib/ads/types';
import {
  AdminPage,
  Avatar,
  Button,
  Callout,
  DataTable,
  EmptyState,
  Pill,
  Sheet,
  SkeletonList,
  ListRow,
  helpClass,
  inputClass,
  labelClass,
  selectClass,
} from '@/components/admin/ui';

type ListRowData = AdvertiserRow & { campaign_count: number };

const fmtDate = (iso: string) => new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

export default function AdminAdvertisersList() {
  const api = useAdminApi();
  const router = useRouter();
  const [rows, setRows] = useState<ListRowData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [draft, setDraft] = useState<{ name: string; url: string; category: AdvertiserCategory }>({
    name: '',
    url: '',
    category: 'banking',
  });

  const load = useCallback(async () => {
    try {
      const res = await api('/api/admin/ads/advertisers');
      if (!res.ok) throw new Error(await readError(res, 'Failed to load advertisers'));
      setRows((await res.json()).advertisers);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load advertisers');
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    void load();
  }, [load]);

  async function createAdvertiser() {
    if (!draft.name.trim() || !draft.url.trim()) {
      setCreateError('Name and URL are required');
      return;
    }
    setCreating(true);
    setCreateError(null);
    try {
      const res = await api('/api/admin/ads/advertisers', { method: 'POST', body: JSON.stringify(draft) });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to create advertiser');
      router.push(`/admin/ads/advertisers/${json.id}`);
    } catch (e) {
      setCreateError(e instanceof Error ? e.message : 'Failed to create advertiser');
      setCreating(false);
    }
  }

  const statusPill = (row: ListRowData) =>
    row.is_active ? <Pill tone="green">Active</Pill> : <Pill tone="gray">Inactive</Pill>;

  return (
    <AdminPage
      title="Advertisers"
      subtitle="Affiliate partners whose campaigns run on the site"
      back={{ href: '/admin/ads', label: 'Ads' }}
      actions={[{ label: 'New advertiser', icon: Plus, variant: 'primary', onClick: () => setShowNew(true) }]}
      onRefresh={load}
    >
      <div className="space-y-5">
        {error && <Callout tone="error">{error}</Callout>}

        {loading ? (
          <SkeletonList rows={4} />
        ) : rows.length === 0 ? (
          <EmptyState
            icon={Building2}
            title="No advertisers yet"
            message="Run the seed migration or add one."
            action={
              <Button variant="primary" icon={Plus} onClick={() => setShowNew(true)}>
                New advertiser
              </Button>
            }
          />
        ) : (
          <DataTable
            rows={rows}
            rowKey={(r) => r.id}
            onRowClick={(r) => router.push(`/admin/ads/advertisers/${r.id}`)}
            mobileRow={(row) => (
              <ListRow
                href={`/admin/ads/advertisers/${row.id}`}
                leading={<Avatar name={row.name} tone={row.is_active ? 'orange' : 'gray'} size={36} />}
                title={row.name}
                subtitle={`${row.category} · ${row.campaign_count} campaign${row.campaign_count === 1 ? '' : 's'}`}
                trailing={statusPill(row)}
              />
            )}
            columns={[
              {
                key: 'name',
                header: 'Advertiser',
                cell: (row) => (
                  <span className="flex items-center gap-3">
                    <Avatar name={row.name} tone={row.is_active ? 'orange' : 'gray'} size={30} />
                    <span>
                      <span className="block font-semibold text-[var(--ad-label)]">{row.name}</span>
                      <span className="block text-[13px] text-[var(--ad-label-3)]">{row.slug}</span>
                    </span>
                  </span>
                ),
              },
              { key: 'category', header: 'Category', cell: (row) => <Pill tone="gray">{row.category}</Pill> },
              { key: 'status', header: 'Status', cell: statusPill },
              { key: 'campaigns', header: 'Campaigns', align: 'right', cell: (row) => row.campaign_count },
              { key: 'updated', header: 'Updated', align: 'right', cell: (row) => fmtDate(row.updated_at) },
            ]}
          />
        )}
      </div>

      <Sheet
        open={showNew}
        onClose={() => setShowNew(false)}
        title="New advertiser"
        footer={
          <Button variant="primary" size="lg" block icon={Plus} loading={creating} onClick={createAdvertiser}>
            Create advertiser
          </Button>
        }
      >
        <div className="ad-group space-y-4 p-4">
          {createError && <Callout tone="error">{createError}</Callout>}
          <div>
            <label className={labelClass} htmlFor="adv-name">
              Name
            </label>
            <input
              id="adv-name"
              className={inputClass}
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              placeholder="Rocket Money"
              autoComplete="off"
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="adv-url">
              Affiliate URL
            </label>
            <input
              id="adv-url"
              type="url"
              inputMode="url"
              autoCapitalize="none"
              autoCorrect="off"
              className={inputClass}
              value={draft.url}
              onChange={(e) => setDraft({ ...draft, url: e.target.value })}
              placeholder="https://…"
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="adv-category">
              Category
            </label>
            <select
              id="adv-category"
              className={selectClass}
              value={draft.category}
              onChange={(e) => setDraft({ ...draft, category: e.target.value as AdvertiserCategory })}
            >
              {ADVERTISER_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <p className={helpClass}>You can add the tagline, description and default CTA on the next screen.</p>
        </div>
      </Sheet>
    </AdminPage>
  );
}
