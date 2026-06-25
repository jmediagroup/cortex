/* =====================================================================
   CAPITAL-GAINS TAX EFFICIENCY ENGINE — Tax Year 2026 (post-OBBBA)
   Pure, framework-agnostic. No dependencies. Fully unit-tested
   (see taxEngine2026.test.ts — 25 known-answer cases).

   ⚠️  THIS FILE IS THE SOURCE OF TRUTH FOR THE MATH.
   Do not "simplify" or refactor the calculations without re-running
   the test suite. Every constant is dated to tax year 2026 and sourced.

   Sources (verified June 2026):
   - IRS Rev. Proc. 2025-32 — brackets, std deduction, LTCG breakpoints,
     QBI thresholds, AMT, senior deduction.
   - IRC §1(h)/§1(j) — capital gain & qualified-dividend worksheet.
   - IRC §86 / Pub 915 — Social Security taxability.
   - IRC §199A — qualified business income deduction.
   - IRC §1411 — net investment income tax (NIIT).
   - Rev. Proc. 2025-25 — ACA applicable percentages; 400% FPL cliff
     reinstated for plan-year 2026 (enhanced subsidies expired 12/31/25).
   - CMS 2026 Medicare Parts A & B Premiums — IRMAA tiers/surcharges.
   - Virginia Title 58.1 (2026) — VA brackets, std deduction, age
     deduction, Social Security subtraction.

   ANNUAL MAINTENANCE: every fall the IRS releases the next year's
   Rev. Proc. Bump the constants in `C` and re-run the tests. Keep the
   "TAX_YEAR" export in sync.
   ===================================================================== */

export const TAX_YEAR = 2026;

export type FilingStatus = "single" | "mfj" | "hoh" | "mfs";
type Bracket = [start: number, rate: number];

export interface TaxInput {
  status: FilingStatus;
  // ordinary income
  wages?: number;               // W-2 (includes S-corp reasonable salary)
  k1?: number;                  // S-corp / pass-through ordinary profit (QBI-eligible)
  interest?: number;
  ordinaryDividends?: number;   // total ordinary dividends
  qualifiedDividends?: number;  // subset of the above, taxed at LTCG rates
  shortTermGains?: number;      // taxed as ordinary
  longTermGains?: number;       // preferential (the lever)
  otherOrdinary?: number;
  adjustments?: number;         // above-the-line (HSA, ½ SE tax, etc.)
  socialSecurity?: number;      // gross SS benefits
  taxExemptInterest?: number;   // muni interest (affects SS, NIIT MAGI, IRMAA)
  // deductions
  useStandard?: boolean;        // default true
  itemized?: number;            // total itemized if useStandard === false
  seniors?: number;             // count of taxpayers age 65+
  blind?: number;               // count of blind taxpayers
  // QBI inputs
  qbiWages?: number;            // W-2 wages the business paid (for the wage limit)
  qbiUBIA?: number;             // unadjusted basis of qualified property
  isSSTB?: boolean;             // specified service trade/business
  seIncome?: number;            // self-employment income (for additional Medicare)
  otherNII?: number;            // extra net investment income (rents, passive)
  // module toggles
  includeNIIT?: boolean;
  includeQBI?: boolean;
  includeACA?: boolean;
  includeIRMAA?: boolean;
  // ACA inputs
  householdSize?: number;
  benchmarkAnnual?: number;     // annual SLCSP benchmark premium (Form 1095-A col B)
  // IRMAA inputs
  medicareEnrollees?: number;
  // VA inputs
  vaItemized?: number;
  vaExemptions?: number;
}

export interface CapGainsSplit { tax: number; at0: number; at15: number; at20: number; }
export interface IrmaaResult {
  tier: number; surB?: number; surD?: number; annual: number; partB: number; nextBound: number | null;
}
export interface AcaResult {
  eligible: boolean; reason?: string; ptc: number; fplPct?: number; fpl?: number;
  cliff?: number; overCliff?: boolean; applicablePct?: number; expectedContribution?: number; acaMAGI?: number;
}
export interface TaxResult {
  agi: number; magi: number; taxableSS: number; deduction: number; seniorDed: number;
  qbiDed: number; taxableIncome: number; ordinaryTaxable: number; prefInTaxable: number; pref: number;
  ordTax: number; cg: CapGainsSplit; fedIncomeTax: number; niit: number; addlMedicare: number;
  vaTax: number; vaTaxable: number; irmaa: IrmaaResult | null; aca: AcaResult | null; totalIncomeTax: number;
}

export const C = {
  ordinary: {
    single: [[0,.10],[12400,.12],[50400,.22],[105700,.24],[201775,.32],[256225,.35],[640600,.37]],
    mfj:    [[0,.10],[24800,.12],[100800,.22],[211400,.24],[403550,.32],[512450,.35],[768700,.37]],
    hoh:    [[0,.10],[17700,.12],[67450,.22],[105700,.24],[201775,.32],[256200,.35],[640600,.37]],
    mfs:    [[0,.10],[12400,.12],[50400,.22],[105700,.24],[201775,.32],[256225,.35],[384350,.37]],
  } as Record<FilingStatus, Bracket[]>,
  stdDed:  { single:16100, mfj:32200, hoh:24150, mfs:16100 } as Record<FilingStatus, number>,
  addlStd: { single:2050, mfj:1650, hoh:2050, mfs:1650 } as Record<FilingStatus, number>,
  ltcg:    { single:[49450,545500], mfj:[98900,613700], hoh:[66200,579600], mfs:[49450,306850] } as Record<FilingStatus, [number,number]>,
  niit:    { single:200000, mfj:250000, hoh:200000, mfs:125000 } as Record<FilingStatus, number>,
  qbiThresh:{ single:201775, mfj:403500, hoh:201775, mfs:201750 } as Record<FilingStatus, number>,
  qbiPhase: { single:75000, mfj:150000, hoh:75000, mfs:75000 } as Record<FilingStatus, number>,
  senior:  { amount:6000, floor:{ single:75000, mfj:150000, hoh:75000, mfs:75000 } as Record<FilingStatus, number>, rate:.06 },
  ssBase:  { single:[25000,34000], mfj:[32000,44000], hoh:[25000,34000], mfs:[0,0] } as Record<FilingStatus, [number,number]>,
  va: {
    brackets: [[0,.02],[3000,.03],[5000,.05],[17000,.0575]] as Bracket[],
    stdDed:   { single:8750, mfj:17500, hoh:8750, mfs:8750 } as Record<FilingStatus, number>,
    exemption: 930,
    ageDed:   { amount:12000, floor:{ single:50000, mfj:75000, hoh:50000, mfs:50000 } as Record<FilingStatus, number> },
  },
  fpl1: 15650, fplStep: 5500,                    // 2025 HHS poverty guideline (used for 2026 coverage)
  irmaaPartB: 202.90,
  irmaa: {
    single: [109000,137000,171000,205000,500000],
    mfj:    [218000,274000,342000,410000,750000],
    partB:  [81.20,202.90,324.60,446.30,487.00], // per-person monthly surcharge by tier
    partD:  [14.50,37.50,60.40,83.30,91.00],
  },
};

/** Progressive tax on `amount` given [startThreshold, rate] brackets. */
export function bracketTax(amount: number, brackets: Bracket[]): number {
  if (amount <= 0) return 0;
  let tax = 0;
  for (let i = 0; i < brackets.length; i++) {
    const start = brackets[i][0], rate = brackets[i][1];
    const next = i + 1 < brackets.length ? brackets[i + 1][0] : Infinity;
    if (amount > start) tax += (Math.min(amount, next) - start) * rate; else break;
  }
  return tax;
}

/** Taxable portion of Social Security — IRC §86 lesser-of worksheet (Pub 915). */
export function ssTaxable(ss: number, other: number, exempt: number, status: FilingStatus): number {
  if (ss <= 0) return 0;
  const [t1, t2] = C.ssBase[status];
  const prov = other + exempt + 0.5 * ss;
  if (prov <= t1) return 0;
  const firstMax = 0.5 * (t2 - t1);
  if (prov <= t2) return Math.min(0.5 * (prov - t1), 0.5 * ss);
  const lower = Math.min(0.5 * (prov - t1), 0.5 * ss, firstMax);
  return Math.min(0.85 * ss, 0.85 * (prov - t2) + lower);
}

export interface QbiArgs {
  qbi: number; taxableBeforeQBI: number; netCapGains: number;
  w2wages?: number; ubia?: number; isSSTB?: boolean; status: FilingStatus;
}
/** §199A QBI deduction with SSTB + wage-limit phase-in and the overall taxable-income cap. */
export function qbiDeduction({ qbi, taxableBeforeQBI, netCapGains, w2wages = 0, ubia = 0, isSSTB = false, status }: QbiArgs): number {
  if (qbi <= 0) return 0;
  const thresh = C.qbiThresh[status], phase = C.qbiPhase[status];
  const tentative = 0.20 * qbi;
  const wageLimit = Math.max(0.50 * w2wages, 0.25 * w2wages + 0.025 * ubia);
  let ded: number;
  const over = taxableBeforeQBI - thresh;
  if (over <= 0) ded = tentative;
  else if (over >= phase) ded = isSSTB ? 0 : Math.min(tentative, wageLimit);
  else {
    const pct = over / phase;
    ded = isSSTB ? tentative * (1 - pct) : tentative - (tentative - Math.min(tentative, wageLimit)) * pct;
  }
  const cap = 0.20 * Math.max(0, taxableBeforeQBI - netCapGains); // overall limit
  return Math.max(0, Math.min(ded, cap));
}

/** Federal LTCG/qualified-dividend tax via the stacking worksheet (0/15/20%). */
export function capGainsTax(ordinaryTaxable: number, pref: number, status: FilingStatus): CapGainsSplit {
  if (pref <= 0) return { tax: 0, at0: 0, at15: 0, at20: 0 };
  const [b0, b15] = C.ltcg[status];
  let rem = pref;
  const at0 = Math.min(rem, Math.max(0, b0 - Math.max(ordinaryTaxable, 0))); rem -= at0;
  const start15 = Math.max(ordinaryTaxable, b0);
  const at15 = Math.min(rem, Math.max(0, b15 - start15)); rem -= at15;
  const at20 = rem;
  return { tax: at15 * 0.15 + at20 * 0.20, at0, at15, at20 };
}

/** Net Investment Income Tax — IRC §1411. */
export function niitTax(nii: number, magi: number, status: FilingStatus): number {
  const t = C.niit[status];
  return (magi <= t || nii <= 0) ? 0 : 0.038 * Math.min(nii, magi - t);
}

/** Additional Medicare Tax 0.9% on wages + SE income — IRC §3101(b)(2). */
export function addlMedicare(wagesPlusSE: number, status: FilingStatus): number {
  const t = C.niit[status];
  return wagesPlusSE > t ? 0.009 * (wagesPlusSE - t) : 0;
}

/** Virginia age deduction (65+): $12,000/person, reduced $1 per $1 AFAGI over the floor. */
export function vaAgeDeduction(numSeniors: number, afagi: number, status: FilingStatus): number {
  if (!numSeniors) return 0;
  const floor = C.va.ageDed.floor[status];
  return Math.max(0, C.va.ageDed.amount - Math.max(0, afagi - floor)) * numSeniors;
}

/** IRMAA tier + ANNUAL surcharge. MAGI = AGI + tax-exempt interest. (hoh/mfs approximated as single.) */
export function irmaa(magi: number, status: FilingStatus, enrollees = 1): IrmaaResult {
  const key: "single" | "mfj" = status === "mfj" ? "mfj" : "single";
  const bounds = C.irmaa[key];
  let tier = 0;
  for (let i = 0; i < bounds.length; i++) if (magi > bounds[i]) tier = i + 1;
  if (tier === 0) return { tier: 0, annual: 0, partB: C.irmaaPartB, nextBound: bounds[0] };
  const surB = C.irmaa.partB[tier - 1], surD = C.irmaa.partD[tier - 1];
  return { tier, surB, surD, annual: (surB + surD) * 12 * enrollees, partB: C.irmaaPartB + surB, nextBound: tier < 5 ? bounds[tier] : null };
}

/** ACA applicable percentage (Rev. Proc. 2025-25, 2026) by FPL ratio. */
export function acaApplicablePct(fplPct: number): number {
  if (fplPct < 133) return 2.10;
  const bands: [number, number, number, number][] = [
    [133,150,2.10,4.19],[150,200,4.19,6.60],[200,250,6.60,8.44],[250,300,8.44,9.96],[300,400,9.96,9.96],
  ];
  for (const [lo, hi, a, b] of bands) if (fplPct >= lo && fplPct < hi) { const t = (fplPct - lo) / (hi - lo); return a + (b - a) * t; }
  return 9.96;
}

export interface AcaArgs { acaMAGI: number; householdSize: number; benchmarkAnnual: number; status: FilingStatus; }
/** ACA premium tax credit with the 2026 400% FPL cliff. */
export function acaPTC({ acaMAGI, householdSize, benchmarkAnnual, status }: AcaArgs): AcaResult {
  if (status === "mfs") return { eligible: false, reason: "Married-separate is generally ineligible", ptc: 0 };
  const fpl = C.fpl1 + (Math.max(1, householdSize) - 1) * C.fplStep;
  const fplPct = (acaMAGI / fpl) * 100;
  const cliff = fpl * 4;
  if (fplPct < 100) return { eligible: false, reason: "Below 100% FPL (likely Medicaid)", ptc: 0, fplPct, fpl, cliff };
  if (fplPct > 400) return { eligible: false, reason: "Over 400% FPL — subsidy cliff", ptc: 0, fplPct, fpl, cliff, overCliff: true };
  const pct = acaApplicablePct(fplPct);
  const expected = acaMAGI * (pct / 100);
  return { eligible: true, ptc: Math.max(0, (benchmarkAnnual || 0) - expected), fplPct, fpl, cliff, applicablePct: pct, expectedContribution: expected };
}

const num = (v: unknown): number => (typeof v === "number" ? v : +(v as number)) || 0;

/** Master orchestrator: full federal + Virginia picture for a given income scenario. */
export function compute(inp: TaxInput): TaxResult {
  const s = inp.status;
  const wages = num(inp.wages), k1 = num(inp.k1), interest = num(inp.interest);
  const ordDiv = num(inp.ordinaryDividends), qDiv = num(inp.qualifiedDividends);
  const stcg = num(inp.shortTermGains), ltcg = num(inp.longTermGains);
  const otherOrd = num(inp.otherOrdinary), adj = num(inp.adjustments);
  const ss = num(inp.socialSecurity), exempt = num(inp.taxExemptInterest);

  const ordinaryNonSS = wages + k1 + interest + (ordDiv - qDiv) + stcg + otherOrd - adj;
  const taxableSS = ssTaxable(ss, ordinaryNonSS + ltcg + qDiv, exempt, s);
  const agi = ordinaryNonSS + ltcg + qDiv + taxableSS;

  const baseStd = C.stdDed[s] + num(inp.seniors) * C.addlStd[s] + num(inp.blind) * C.addlStd[s];
  const useStandard = inp.useStandard !== false;
  const deduction = useStandard ? baseStd : num(inp.itemized);

  let seniorDed = 0;
  if (inp.seniors) {
    const over = Math.max(0, agi - C.senior.floor[s]);
    seniorDed = Math.max(0, C.senior.amount * num(inp.seniors) - C.senior.rate * over);
  }

  const pref = ltcg + qDiv;
  const taxableBeforeQBI = Math.max(0, agi - deduction - seniorDed);
  const qbiDed = inp.includeQBI
    ? qbiDeduction({ qbi: Math.max(0, k1), taxableBeforeQBI, netCapGains: pref, w2wages: num(inp.qbiWages), ubia: num(inp.qbiUBIA), isSSTB: !!inp.isSSTB, status: s })
    : 0;
  const taxableIncome = Math.max(0, taxableBeforeQBI - qbiDed);
  const prefInTaxable = Math.min(pref, taxableIncome);
  const ordinaryTaxable = Math.max(0, taxableIncome - prefInTaxable);

  const ordTax = bracketTax(ordinaryTaxable, C.ordinary[s]);
  const cg = capGainsTax(ordinaryTaxable, prefInTaxable, s);
  const fedIncomeTax = ordTax + cg.tax;

  const nii = interest + ordDiv + Math.max(0, stcg) + Math.max(0, ltcg) + num(inp.otherNII);
  const magi = agi + exempt;
  const niitAmt = inp.includeNIIT ? niitTax(nii, magi, s) : 0;
  const addlMed = inp.includeNIIT ? addlMedicare(wages + num(inp.seIncome), s) : 0;

  const ageDed = vaAgeDeduction(num(inp.seniors), agi, s);
  const vagi = agi - taxableSS; // VA fully exempts Social Security
  const vaDed = useStandard ? C.va.stdDed[s] : (num(inp.vaItemized) || num(inp.itemized));
  const vaTaxable = Math.max(0, vagi - vaDed - (num(inp.vaExemptions) || 1) * C.va.exemption - ageDed);
  const vaTax = bracketTax(vaTaxable, C.va.brackets);

  const irmaaRes = inp.includeIRMAA ? irmaa(magi, s, num(inp.medicareEnrollees) || 1) : null;
  let acaRes: AcaResult | null = null;
  if (inp.includeACA) {
    const acaMAGI = agi + exempt + (ss - taxableSS); // add back untaxed SS
    acaRes = acaPTC({ acaMAGI, householdSize: num(inp.householdSize) || 1, benchmarkAnnual: num(inp.benchmarkAnnual), status: s });
    acaRes.acaMAGI = acaMAGI;
  }

  const totalIncomeTax = fedIncomeTax + niitAmt + addlMed + vaTax;
  return {
    agi, magi, taxableSS, deduction, seniorDed, qbiDed, taxableIncome, ordinaryTaxable, prefInTaxable, pref,
    ordTax, cg, fedIncomeTax, niit: niitAmt, addlMedicare: addlMed, vaTax, vaTaxable,
    irmaa: irmaaRes, aca: acaRes, totalIncomeTax,
  };
}
