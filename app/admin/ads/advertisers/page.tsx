'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Building2, Loader2, Plus } from 'lucide-react';
import { useAdminApi, readError } from '@/components/admin/useAdminApi';
import { ADVERTISER_CATEGORIES, type AdvertiserCategory, type AdvertiserRow } from '@/lib/ads/types';

type ListRow = AdvertiserRow & { campaign_count: number };

const inputClass =
  'w-full rounded-[var(--radius-md)] border border-[var(--border-primary)] bg-[var(--surface-primary)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--color-accent)] transition-colors';
const labelClass = 'block text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)] mb-1.5';
const cardClass = 'rounded-[var(--radius-xl)] border border-[var(--border-primary)] bg-[var(--surface-primary)] p-5';

export default function AdminAdvertisersList() {
  const api = useAdminApi();
  const router = useRouter();
  const [rows, setRows] = useState<ListRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState<{ name: string; url: string; category: AdvertiserCategory }>({
    name: '',
    url: '',
    category: 'banking',
  });

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api('/api/admin/ads/advertisers');
      if (!res.ok) throw new Error(await readError(res, 'Failed to load advertisers'));
      setRows((await res.json()).advertisers);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load advertisers');
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    load();
  }, [load]);

  async function createAdvertiser() {
    if (!draft.name.trim() || !draft.url.trim()) {
      setError('Name and URL are required');
      return;
    }
    setCreating(true);
    setError(null);
    try {
      const res = await api('/api/admin/ads/advertisers', { method: 'POST', body: JSON.stringify(draft) });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to create advertiser');
      router.push(`/admin/ads/advertisers/${json.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create advertiser');
      setCreating(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/admin/ads" className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--text-tertiary)] hover:text-[var(--text-primary)]">
            <ArrowLeft size={12} /> Ads
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">Advertisers</h1>
          <p className="mt-1 text-sm text-[var(--text-tertiary)] font-medium">Affiliate partners whose campaigns run on the site</p>
        </div>
        <button
          onClick={() => setShowNew((v) => !v)}
          className="inline-flex items-center gap-2 rounded-[var(--radius-md)] bg-navy px-4 py-2 text-sm font-bold text-white hover:opacity-90"
        >
          <Plus size={16} /> New advertiser
        </button>
      </div>

      {error && (
        <div className="rounded-[var(--radius-md)] border border-[var(--crimson-border)] bg-[var(--crimson-50)] px-4 py-3 text-sm font-medium text-[var(--crimson-500)]">
          {error}
        </div>
      )}

      {showNew && (
        <div className={cardClass}>
          <h2 className="mb-3 text-base font-bold text-[var(--text-primary)]">New advertiser</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_1.5fr_180px_auto] md:items-end">
            <div>
              <label className={labelClass}>Name</label>
              <input className={inputClass} value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="Rocket Money" />
            </div>
            <div>
              <label className={labelClass}>Affiliate URL</label>
              <input className={inputClass} value={draft.url} onChange={(e) => setDraft({ ...draft, url: e.target.value })} placeholder="https://…" />
            </div>
            <div>
              <label className={labelClass}>Category</label>
              <select className={inputClass} value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value as AdvertiserCategory })}>
                {ADVERTISER_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={createAdvertiser}
              disabled={creating}
              className="inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] bg-navy px-4 py-2 text-sm font-bold text-white hover:opacity-90 disabled:opacity-50"
            >
              {creating ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />} Create
            </button>
          </div>
          <p className="mt-2 text-xs text-[var(--text-tertiary)]">You can add the tagline, description and default CTA on the next screen.</p>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-[var(--color-accent)]" size={28} />
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-[var(--radius-xl)] border border-[var(--border-primary)] bg-[var(--surface-primary)] p-12 text-center">
          <Building2 className="mx-auto mb-3 text-[var(--text-tertiary)]" size={28} />
          <p className="text-sm font-medium text-[var(--text-secondary)]">No advertisers yet. Run the seed migration or create one above.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border-primary)] bg-[var(--surface-primary)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border-primary)] text-left text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)]">
                <th className="px-5 py-3">Advertiser</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3">Status</th>
                <th className="hidden px-5 py-3 md:table-cell">Campaigns</th>
                <th className="hidden px-5 py-3 md:table-cell">Updated</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b border-[var(--border-primary)] last:border-0 hover:bg-[var(--surface-secondary)]">
                  <td className="px-5 py-3">
                    <Link href={`/admin/ads/advertisers/${row.id}`} className="font-semibold text-[var(--text-primary)] hover:text-[var(--color-accent)]">
                      {row.name}
                    </Link>
                    <div className="text-xs text-[var(--text-tertiary)]">{row.slug}</div>
                  </td>
                  <td className="px-5 py-3">
                    <span className="inline-block rounded-full bg-[var(--surface-tertiary)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                      {row.category}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className="inline-block rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider"
                      style={
                        row.is_active
                          ? { backgroundColor: '#dcfce7', color: 'var(--color-positive)' }
                          : { backgroundColor: 'var(--surface-tertiary)', color: 'var(--text-tertiary)' }
                      }
                    >
                      {row.is_active ? 'active' : 'inactive'}
                    </span>
                  </td>
                  <td className="hidden px-5 py-3 text-[var(--text-secondary)] md:table-cell">{row.campaign_count}</td>
                  <td className="hidden px-5 py-3 text-[var(--text-tertiary)] md:table-cell">
                    {new Date(row.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
