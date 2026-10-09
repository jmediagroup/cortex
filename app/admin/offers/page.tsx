'use client';

import { useCallback, useEffect, useState } from 'react';
import { CheckCircle2, CircleSlash, HandCoins, Upload } from 'lucide-react';
import { useAdminApi, readError } from '@/components/admin/useAdminApi';
import {
  AdminPage,
  Button,
  Callout,
  Card,
  CardTitle,
  DataTable,
  EmptyState,
  ListGroup,
  ListRow,
  PageSkeleton,
  Pill,
  inputClass,
  type Tone,
} from '@/components/admin/ui';

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

const EXAMPLE = `date,campaign,status,amount,id,tool,note
2026-10-01,offer-brokerage-pilot,approved,50.00,IMP-123456,coast-fire,`;

const CONVERSION_TONE: Record<Conversion['status'], Tone> = { pending: 'amber', confirmed: 'green', reversed: 'red' };

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

  const confirmed = (data?.conversions ?? []).filter((c) => c.status === 'confirmed');

  return (
    <AdminPage
      title="Offers"
      subtitle="The one disclosed offer shown after a result — what’s live, what’s blocking it, and what it earned"
      onRefresh={load}
    >
      <div className="space-y-7">
        {error && <Callout tone="error">{error}</Callout>}

        {loading ? (
          <PageSkeleton rows={4} />
        ) : data?.setupRequired ? (
          <Callout tone="warning" title="The offers tables aren’t in this database yet.">
            Apply <code>supabase/migrations/20260929140000_offers_engine.sql</code> and then{' '}
            <code>20260929140100_seed_offer_placeholders.sql</code>, then reload.
          </Callout>
        ) : (
          data && (
            <>
              {data.enabled ? (
                <Callout tone="success" title="Offers are switched on site-wide." />
              ) : (
                <Callout tone="warning" icon={CircleSlash} title="Offers are switched off site-wide.">
                  NEXT_PUBLIC_OFFERS_ENABLED is off. Nothing below shows to visitors until it is &ldquo;true&rdquo; and the site is
                  redeployed.
                </Callout>
              )}

              {/* Campaigns on the after-the-result placement */}
              {!data.campaigns?.length ? (
                <EmptyState icon={HandCoins} title="No offer campaigns yet" message="No campaigns on the after-the-result placement." />
              ) : (
                <div className="space-y-3">
                  <h2 className="px-1 text-[20px] font-bold tracking-[-0.01em]">Offer campaigns</h2>
                  <div className="grid gap-3 lg:grid-cols-2">
                    {data.campaigns.map((c) => (
                      <ListGroup
                        key={c.id}
                        footer={`Tools: ${c.toolIds === null ? 'all' : c.toolIds.join(', ') || 'none'} · slug ${c.slug ?? '—'}`}
                      >
                        <ListRow
                          href={`/admin/ads/campaigns/${c.id}`}
                          title={c.name}
                          subtitle={`${c.advertiserName ?? 'No advertiser'} · program ${c.programStatus ?? '—'} · campaign ${c.status}`}
                          leading={
                            c.blockers.length ? (
                              <CircleSlash size={22} className="shrink-0 text-[var(--ad-amber)]" aria-label="Blocked" />
                            ) : (
                              <CheckCircle2 size={22} className="shrink-0 text-[var(--ad-green)]" aria-label="Live" />
                            )
                          }
                        />
                        {c.blockers.length ? (
                          <div className="ad-row">
                            <div className="ad-row-main !block">
                              <p className="mb-1 text-[13px] font-semibold text-[var(--ad-label-3)]">Not showing yet because:</p>
                              <ul className="list-disc space-y-0.5 pl-5 text-[14px] text-[var(--ad-label-2)]">
                                {c.blockers.map((b) => (
                                  <li key={b}>{b}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        ) : (
                          <ListRow title={<span className="text-[var(--ad-green)]">Live after results on its tools</span>} />
                        )}
                      </ListGroup>
                    ))}
                  </div>
                </div>
              )}

              {/* Import */}
              <Card>
                <CardTitle icon={Upload}>Record conversions</CardTitle>
                <p className="mb-3 text-[14px] leading-relaxed text-[var(--ad-label-2)] [&_code]:rounded [&_code]:bg-[var(--ad-fill)] [&_code]:px-1 [&_code]:text-[12.5px]">
                  Export the conversion report from your affiliate network and paste it here as CSV. Columns:{' '}
                  <code>date, campaign, status, amount, id</code> (and optionally <code>tool, note</code>). Amounts come only from
                  the network&apos;s report. Re-importing a row with the same <code>id</code> updates it.
                </p>
                <label htmlFor="offers-csv" className="sr-only">
                  Conversion CSV
                </label>
                <textarea
                  id="offers-csv"
                  className={`${inputClass} font-mono !text-[13px]`}
                  rows={6}
                  value={csv}
                  onChange={(e) => setCsv(e.target.value)}
                  placeholder={EXAMPLE}
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                />
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <Button variant="primary" icon={Upload} onClick={onImport} loading={importing} disabled={!csv.trim()} className="max-sm:w-full">
                    Import
                  </Button>
                  {importResult && (
                    <span className="text-[14px] font-semibold text-[var(--ad-label-2)]">
                      {importResult.imported} row{importResult.imported === 1 ? '' : 's'} imported
                    </span>
                  )}
                </div>
                {importResult?.errors.length ? (
                  <Callout tone="error" className="mt-3">
                    <ul className="list-disc space-y-0.5 pl-4">
                      {importResult.errors.map((e) => (
                        <li key={e}>{e}</li>
                      ))}
                    </ul>
                  </Callout>
                ) : null}
              </Card>

              {/* Recent conversions */}
              <div className="space-y-3">
                <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 px-1">
                  <h2 className="text-[20px] font-bold tracking-[-0.01em]">Recent conversions</h2>
                  <span className="text-[13px] text-[var(--ad-label-3)]">
                    {confirmed.length} confirmed · {money(confirmed.reduce((s, c) => s + (c.amount_cents ?? 0), 0))} shown below
                  </span>
                </div>
                {!data.conversions?.length ? (
                  <EmptyState icon={HandCoins} title="None recorded yet" />
                ) : (
                  <DataTable
                    rows={data.conversions}
                    rowKey={(c) => c.id}
                    mobileRow={(c) => (
                      <ListRow
                        title={c.ad_campaigns?.slug ?? '—'}
                        subtitle={`${c.occurred_on} · ${c.tool_id ?? 'no tool'}${c.external_id ? ` · ${c.external_id}` : ''}`}
                        detail={money(c.amount_cents)}
                        trailing={<Pill tone={CONVERSION_TONE[c.status]}>{c.status}</Pill>}
                      />
                    )}
                    columns={[
                      { key: 'date', header: 'Date', cell: (c) => <span className="whitespace-nowrap">{c.occurred_on}</span> },
                      { key: 'campaign', header: 'Campaign', cell: (c) => c.ad_campaigns?.slug ?? '—' },
                      { key: 'status', header: 'Status', cell: (c) => <Pill tone={CONVERSION_TONE[c.status]}>{c.status}</Pill> },
                      { key: 'amount', header: 'Amount', align: 'right', cell: (c) => money(c.amount_cents) },
                      { key: 'tool', header: 'Tool', cell: (c) => c.tool_id ?? '—' },
                      { key: 'ext', header: 'Network id', cell: (c) => <span className="text-[var(--ad-label-3)]">{c.external_id ?? '—'}</span> },
                    ]}
                  />
                )}
              </div>
            </>
          )
        )}
      </div>
    </AdminPage>
  );
}
