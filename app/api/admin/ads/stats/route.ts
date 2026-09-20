import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/client';
import { errorResponse } from '@/lib/auth-helpers';
import { requireAdmin } from '@/lib/cms/admin';

interface Totals {
  impressions: number;
  clicks: number;
  ctr: number;
}

const bump = (map: Map<string, { impressions: number; clicks: number }>, key: string, imp: number, clk: number) => {
  const cur = map.get(key) ?? { impressions: 0, clicks: 0 };
  cur.impressions += imp;
  cur.clicks += clk;
  map.set(key, cur);
};

const withCtr = (map: Map<string, { impressions: number; clicks: number }>): Record<string, Totals> => {
  const out: Record<string, Totals> = {};
  for (const [key, v] of map) {
    out[key] = { ...v, ctr: v.impressions > 0 ? v.clicks / v.impressions : 0 };
  }
  return out;
};

/**
 * GET /api/admin/ads/stats?days=30
 * Impressions/clicks/CTR per campaign + per creative, and daily totals for a
 * chart. Reads the `ad_stats_daily` rollup view.
 */
export async function GET(request: NextRequest) {
  try {
    const denied = await requireAdmin(request);
    if (denied) return denied;

    const { searchParams } = new URL(request.url);
    const days = Math.min(365, Math.max(1, parseInt(searchParams.get('days') ?? '30', 10) || 30));
    const since = new Date(Date.now() - (days - 1) * 86_400_000);
    const sinceDay = since.toISOString().slice(0, 10);

    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from('ad_stats_daily')
      .select('campaign_id,creative_id,advertiser_id,day,impressions,clicks')
      .gte('day', sinceDay)
      .order('day', { ascending: true })
      .limit(50_000);
    if (error) {
      console.error('[ads stats] Error:', error);
      return errorResponse('Failed to load ad stats', 500);
    }

    const byCampaign = new Map<string, { impressions: number; clicks: number }>();
    const byCreative = new Map<string, { impressions: number; clicks: number }>();
    const byAdvertiser = new Map<string, { impressions: number; clicks: number }>();
    const byDay = new Map<string, { impressions: number; clicks: number }>();

    // Pre-fill every day in the window so the chart has a continuous axis.
    for (let i = 0; i < days; i++) {
      const d = new Date(since.getTime() + i * 86_400_000).toISOString().slice(0, 10);
      byDay.set(d, { impressions: 0, clicks: 0 });
    }

    let impressions = 0;
    let clicks = 0;
    for (const row of data ?? []) {
      const imp = Number(row.impressions) || 0;
      const clk = Number(row.clicks) || 0;
      impressions += imp;
      clicks += clk;
      if (row.campaign_id) bump(byCampaign, row.campaign_id, imp, clk);
      if (row.creative_id) bump(byCreative, row.creative_id, imp, clk);
      if (row.advertiser_id) bump(byAdvertiser, row.advertiser_id, imp, clk);
      bump(byDay, String(row.day).slice(0, 10), imp, clk);
    }

    return NextResponse.json({
      days,
      since: sinceDay,
      totals: { impressions, clicks, ctr: impressions > 0 ? clicks / impressions : 0 },
      daily: [...byDay.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([day, v]) => ({ day, ...v })),
      campaigns: withCtr(byCampaign),
      creatives: withCtr(byCreative),
      advertisers: withCtr(byAdvertiser),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    console.error('[ads stats] Unexpected error:', error);
    return errorResponse(message, 500);
  }
}
