# Phase 1 — turning on the first offer (Drew's checklist)

Everything below is off until you do these steps, in this order. Each step is safe to stop after.

## 1. Before merging the Phase 1 PR
- [ ] **Apply the two migrations** (Claude can do this when you say so):
  - `20260929140000_offers_engine.sql`
  - `20260929140100_seed_offer_placeholders.sql`

  They only add columns, one placement, one table and two draft placeholder campaigns. The admin's ad editors expect the new columns, so apply these before merging.

## 2. Apply to affiliate programs (only you can do this)
Two kinds of program cover all three approved pilot tools:

| Pilot tool | Offer category | Placeholder campaign |
|---|---|---|
| Coast FIRE, Index Fund Visualizer | Brokerage / robo-advisor | `offer-brokerage-pilot` |
| Rent vs Buy | Mortgage lender (copy must not quote rates) | `offer-mortgage-pilot` |

- [ ] Apply through a network (e.g. Impact) or directly with the program.
- [ ] When you're approved, **read the program's current terms yourself**. The research figures came from third-party directories and aren't verified. Note what it pays in the advertiser's "Payout note" field. That note is internal only; the site never shows or uses it.

## 3. Fill in the approved program (`/admin/ads` → Advertisers)
On the placeholder advertiser (`offer-brokerage` or `offer-mortgage`):
- [ ] Rename it to the program's real name and paste its homepage URL.
- [ ] Set **Affiliate program** to `approved`, pick the network, and set "Terms verified on" to today.
- [ ] Only if the program requires its own disclosure wording, paste it into "Offer disclosure". Otherwise leave it empty and the standard wording is used.

On its campaign (`/admin/offers` links to it):
- [ ] Paste the affiliate link exactly as the network gives it. To get per-tool reporting, put `{sub_id}` where the network's sub-ID parameter goes (Impact calls it `subId1`), e.g. `…?subId1={sub_id}`.
- [ ] Replace the creative's `<<PASTE_APPROVED_OFFER_COPY>>` with wording the program allows. No rates, APRs, bonuses or "guaranteed" claims unless the program supplies that exact language.
- [ ] Set the campaign to `active`. The editor's "Not showing on the site yet, because…" list should now contain only the offers switch.

## 4. Review the disclosure page
- [ ] Read `/disclosure` (marked `LEGAL_REVIEW_REQUIRED` in `app/disclosure/page.tsx`). Once you're happy with it, tell Claude to remove the `noindex` so search engines can list it.

## 5. Switch offers on
- [ ] In Vercel, set `NEXT_PUBLIC_OFFERS_ENABLED` = `true` for **Preview** first, then redeploy the preview.
- [ ] Phone walkthrough on the preview:
  1. Open a pilot tool; there should be no offer yet.
  2. Change a number; an offer appears below the calculator, with the disclosure beside the button.
  3. Tap it; you should land on the program through `/go/…`.
- [ ] Then set the same variable for **Production** and redeploy.
- [ ] To switch it off again: set the variable to anything else (or delete it) and redeploy.

## 6. Every week or month
- [ ] Export the network's conversion report and paste it into `/admin/offers` → **Record conversions**. Confirmed rows feed the scorecard's affiliate revenue line at `/admin/monetization`.
