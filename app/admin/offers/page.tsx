'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertCircle, CheckCircle2, Loader2, Upload } from 'lucide-react';
import { useAdminApi, readError } from '@/components/admin/useAdminApi';

interface OfferCampaign {
  id: string;
  slug: string | null;
  name: string;
  status: string;
  toolIds: string[] | null;
  advertiserName: string | null;
  programStatus: string | null;
  blockers: string[];
}

interface Conversion {
  id: string;
  occurred_on: string;
  status: 'pending' | 'confirmed' | 'reversed';
  amount_cents: number | null;
  source: string;
  external_id: string | null;
  tool_id: string | null;
  note: string | null;
  ad_campaigns: { slug: string | null } | null;
}

interface OffersResponse {
  setupRequired?: boolean;
  enabled?: boolean;
  campaigns?: OfferCampaign[];
  conversions?: Conversion[];
}

const card = 'rounded-[var(--radius-xl)] border border-[var(--border-primary)] bg-[var(--surface-primary)]';
const cardShadow = { boxShadow: 'var(--shadow-card)' };

const EXAMPLE = `date,campaign,status,amount,id,tool,note
2026-10-01,offer-brokerage-pilot,approved,50.00,IMP-123456,coast-fire,`;

const money = (cents: number | null) => (cents === null ? '—' : `$${(cents / 100).toFixed(2)}`);

export default function AdminOffers() {
  const api = useAdminApi();
  const [data, setData] = useState<OffersResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [csv, setCsv] = useState('');
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ imported: number; errors: string[] } | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await api('/api/admin/offers');
      if (!res.ok) throw new Error(await readError(res, 'Failed to load offers'));
      setData(await res.json());
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load offers');
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    void load();
  }, [load]);

  async function onImport() {
    setImporting(true);
    setImportResult(null);
    try {
      const res = await api('/api/admin/offers', { method: 'POST', body: JSON.stringify({ csv }) });
      const json = await res.json();
      if (!res.ok && !Array.isArray(json.errors)) throw new Error(json.error || 'Import failed');
      setImportResult({ imported: json.imported ?? 0, errors: json.errors ?? [] });
      if (json.imported) {
        setCsv('');
        await load();
      }
    } catch (e) {
      setImportResult({ imported: 0, errors: [e instanceof Error ? e.message : 'Import failed'] });
    } finally {
      setImporting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-[var(--color-accent)]" size={28} />
      </div>
    );
  }

  const confirmed = (data?.conversions ?? []).filter((c) => c.status === 'confirmed');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">Offers</h1>
        <p className="text-sm text-[var(--text-tertiary)] font-medium mt-1">
          The one disclosed offer shown after a result — what&apos;s live, what&apos;s blocking it, and what it earned
        </p>
      </div>

      {error && (
        <div className={`${card} p-4 flex items-start gap-3 text-sm text-[var(--color-negative)]`}>
          <AlertCircle size={18} className="shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      {data?.setupRequired ? (
        <div className={`${card} p-5 text-sm text-[var(--text-secondary)]`} style={cardShadow}>
          <p className="font-bold text-[var(--text-primary)]">The offers tables aren&apos;t in this database yet.</p>
          <p className="mt-1">
            Apply <code>supabase/migrations/20260929140000_offers_engine.sql</code> and then{' '}
            <code>20260929140100_seed_offer_placeholders.sql</code>, then reload.
          </p>
        </div>
      ) : (
        data && (
          <>
            <div
              className={`${card} p-4 text-sm font-semibold ${
                data.enabled ? 'text-[var(--emerald-600)]' : 'text-[var(--text-secondary)]'
              }`}
              style={cardShadow}
            >
              {data.enabled
                ? 'Offers are switched on site-wide.'
                : 'Offers are switched off site-wide (NEXT_PUBLIC_OFFERS_ENABLED). Nothing below shows to visitors until it is "true" and the site is redeployed.'}
            </div>

            <div className={`${card} p-6`} style={cardShadow}>
              <h2 className="text-base font-bold text-[var(--text-primary)] mb-4">Offer campaigns</h2>
              {!data.campaigns?.length ? (
                <p className="text-sm text-[var(--text-tertiary)]">No campaigns on the after-the-result placement yet.</p>
              ) : (
                <ul className="space-y-4">
                  {data.campaigns.map((c) => (
                    <li key={c.id} className="border-t border-[var(--border-primary)] pt-4 first:border-0 first:pt-0">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <Link href={`/admin/ads/campaigns/${c.id}`} className="font-bold text-[var(--text-primary)] hover:underline">
                          {c.name}
                        </Link>
                        <span className="text-xs font-semibold text-[var(--text-tertiary)]">
                          {c.advertiserName ?? 'No advertiser'} · program {c.programStatus ?? '—'} · campaign {c.status}
                        </span>
                      </div>
                      <p className="text-xs text-[var(--text-tertiary)] mt-1">
                        Tools: {c.toolIds === null ? 'all' : c.toolIds.join(', ') || 'none'} · slug {c.slug ?? '—'}
                      </p>
                      {c.blockers.length ? (
                        <ul className="mt-2 list-disc pl-5 text-sm text-[var(--text-secondary)] space-y-0.5">
                          {c.blockers.map((b) => (
                            <li key={b}>{b}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-[var(--emerald-600)]">
                          <CheckCircle2 size={15} /> Live after results on its tools.
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className={`${card} p-6`} style={cardShadow}>
              <h2 className="text-base font-bold text-[var(--text-primary)] mb-1">Record conversions</h2>
              <p className="text-sm text-[var(--text-tertiary)] mb-3">
                Export the conversion report from your affiliate network and paste it here as CSV. Columns:{' '}
                <code>date, campaign, status, amount, id</code> (and optionally <code>tool, note</code>). Amounts come
                only from the network&apos;s report. Re-importing a row with the same <code>id</code> updates it.
              </p>
              <textarea
                className="w-full rounded-[var(--radius-md)] border border-[var(--border-primary)] bg-[var(--surface-primary)] px-3 py-2 font-mono text-xs text-[var(--text-primary)] outline-none focus:border-[var(--color-accent)]"
                rows={6}
                value={csv}
                onChange={(e) => setCsv(e.target.value)}
                placeholder={EXAMPLE}
              />
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <button
                  onClick={onImport}
                  disabled={importing || !csv.trim()}
                  className="inline-flex items-center gap-2 rounded-[var(--radius-md)] bg-navy px-4 py-2 text-sm font-bold text-white hover:opacity-90 disabled:opacity-50"
                >
                  {importing ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
                  Import
                </button>
                {importResult && (
                  <span className="text-sm font-semibold text-[var(--text-secondary)]">
                    {importResult.imported} row{importResult.imported === 1 ? '' : 's'} imported
                  </span>
                )}
              </div>
              {importResult?.errors.length ? (
                <ul className="mt-3 list-disc pl-5 text-sm text-[var(--color-negative)] space-y-0.5">
                  {importResult.errors.map((e) => (
                    <li key={e}>{e}</li>
                  ))}
                </ul>
              ) : null}
            </div>

            <div className={`${card} p-6`} style={cardShadow}>
              <div className="flex flex-wrap items-baseline justify-between gap-2 mb-4">
                <h2 className="text-base font-bold text-[var(--text-primary)]">Recent conversions</h2>
                <span className="text-sm text-[var(--text-tertiary)]">
                  {confirmed.length} confirmed · {money(confirmed.reduce((s, c) => s + (c.amount_cents ?? 0), 0))} shown below
                </span>
              </div>
              {!data.conversions?.length ? (
                <p className="text-sm text-[var(--text-tertiary)]">None recorded yet.</p>
              ) : (
                <div className="overflow-x-auto -mx-2">
                  <table className="w-full text-sm min-w-[560px]">
                    <thead>
                      <tr className="text-left text-xs uppercase tracking-wider text-[var(--text-tertiary)]">
                        {['Date', 'Campaign', 'Status', 'Amount', 'Tool', 'Network id'].map((h) => (
                          <th key={h} className="px-2 py-2 font-bold">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {data.conversions.map((c) => (
                        <tr key={c.id} className="border-t border-[var(--border-primary)]">
                          <td className="px-2 py-2 whitespace-nowrap">{c.occurred_on}</td>
                          <td className="px-2 py-2">{c.ad_campaigns?.slug ?? '—'}</td>
                          <td className="px-2 py-2">{c.status}</td>
                          <td className="px-2 py-2">{money(c.amount_cents)}</td>
                          <td className="px-2 py-2">{c.tool_id ?? '—'}</td>
                          <td className="px-2 py-2 text-[var(--text-tertiary)]">{c.external_id ?? '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )
      )}
    </div>
  );
}
