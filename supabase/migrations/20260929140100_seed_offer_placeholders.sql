-- Placeholder offers for the approved pilot tools (docs/monetization/PILOT-TOOLS.md)
-- Run after 20260929140000_offers_engine.sql. Safe to re-run: inserts only
-- rows that don't exist yet, so it never overwrites what Drew has edited.
--
-- Nothing here can render. Every row is a draft with <<PASTE…>> placeholders,
-- and lib/offers/eligibility.ts refuses drafts and placeholders. To go live,
-- in /admin/ads: rename the advertiser to the approved program and paste its
-- homepage URL, set program_status = 'approved'; on the campaign paste the
-- affiliate link (put {sub_id} where the network takes a sub-ID) and set it
-- 'active'; replace the creative's placeholder copy with approved wording.

insert into public.ad_advertisers (slug, name, url, category, is_active, program_status, notes)
values
  ('offer-brokerage', 'Brokerage / robo-advisor (placeholder)', '<<PASTE_ADVERTISER_URL>>',
   'investing', true, 'draft',
   'Phase 1 pilot slot for Coast FIRE and the Index Fund Visualizer. Replace with the approved program.'),
  ('offer-mortgage', 'Mortgage lender (placeholder)', '<<PASTE_ADVERTISER_URL>>',
   'mortgage', true, 'draft',
   'Phase 1 pilot slot for Rent vs Buy. Replace with the approved program. Copy must not quote rates.')
on conflict (slug) do nothing;

insert into public.ad_campaigns
  (slug, advertiser_id, placement_id, name, status, tool_ids, hide_for_tiers, tracking_url, sub_id_template, notes)
select v.slug, a.id, p.id, v.name, 'draft', v.tool_ids, '{finance_pro}',
       '<<PASTE_AFFILIATE_URL>>', '{tool_id}-{session_short}', v.notes
from (values
  ('offer-brokerage-pilot', 'offer-brokerage', 'Pilot: investing account after Coast FIRE / Index Fund',
   '{coast-fire,index-fund-visualizer}'::text[], 'One offer, shown only after a result.'),
  ('offer-mortgage-pilot', 'offer-mortgage', 'Pilot: mortgage lender after Rent vs Buy',
   '{rent-vs-buy}'::text[], 'One offer, shown only after a result. No rate quotes in copy.')
) as v (slug, advertiser_slug, name, tool_ids, notes)
join public.ad_advertisers a on a.slug = v.advertiser_slug
join public.ad_placements p on p.slug = 'tool-post-result'
on conflict (slug) do nothing;

insert into public.ad_creatives (campaign_id, seed_key, format, headline, body, cta)
select c.id, c.slug || ':offer_card:1', 'offer_card',
       'Ready to act on this result?', '<<PASTE_APPROVED_OFFER_COPY>>', 'Learn more'
from public.ad_campaigns c
where c.slug in ('offer-brokerage-pilot', 'offer-mortgage-pilot')
on conflict (seed_key) do nothing;
