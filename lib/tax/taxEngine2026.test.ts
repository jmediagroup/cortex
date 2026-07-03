/* =====================================================================
   Known-answer tests for taxEngine2026.ts (40 cases).
   Run standalone:  npx tsx lib/tax/taxEngine2026.test.ts
   Or adapt to Vitest: replace `check(...)` with expect(got).toBeCloseTo(want).
   Keep these GREEN after any change to the engine.
   ===================================================================== */
import {
  C, bracketTax, ssTaxable, qbiDeduction, capGainsTax, niitTax, irmaa, acaPTC, acaApplicablePct, compute,
} from "./taxEngine2026";

let pass = 0, fail = 0;
const near = (a: number, b: number, t = 0.5) => Math.abs(a - b) <= t;
function check(name: string, got: number, want: number, t = 0.5) {
  const ok = near(got, want, t);
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}  got=${(+got).toFixed(2)} want=${(+want).toFixed(2)}`);
  ok ? pass++ : fail++;
}

// 1-2 ordinary brackets
check("ordinary single $50,400", bracketTax(50400, C.ordinary.single), 0.10*12400 + 0.12*(50400-12400));
check("ordinary single $100,000", bracketTax(100000, C.ordinary.single), 0.10*12400 + 0.12*38000 + 0.22*(100000-50400));

// 3-5 LTCG stacking
{
  const cg = capGainsTax(30000, 30000, "single");
  check("LTCG single 30k/30k tax", cg.tax, 1582.50);
  check("LTCG single 30k/30k at0", cg.at0, 19450);
  check("LTCG single 30k/30k at15", cg.at15, 10550);
}
check("LTCG single all 0%", capGainsTax(10000, 20000, "single").tax, 0);

// 6 NIIT
check("NIIT single", niitTax(60000, 250000, "single"), 1900);

// 7-8 Social Security
check("SS MFJ 60k+30k", ssTaxable(30000, 60000, 0, "mfj"), 25500);
check("SS single below thresh", ssTaxable(20000, 8000, 0, "single"), 0);

// 9 Virginia
check("VA $50,000", bracketTax(50000, C.va.brackets), 0.02*3000 + 0.03*2000 + 0.05*12000 + 0.0575*(50000-17000));

// 10-11 QBI
check("QBI below thresh", qbiDeduction({ qbi:100000, taxableBeforeQBI:150000, netCapGains:20000, status:"single" }), 20000);
check("QBI overall cap", qbiDeduction({ qbi:100000, taxableBeforeQBI:50000, netCapGains:10000, status:"single" }), 8000);

// 12-14 IRMAA
{
  const r = irmaa(140000, "single", 1);
  check("IRMAA single 140k tier", r.tier, 2, 0);
  check("IRMAA single 140k annual", r.annual, (202.90+37.50)*12);
}
check("IRMAA mfj 220k tier", irmaa(220000, "mfj", 1).tier, 1, 0);

// 15-19 ACA
{
  const a = acaPTC({ acaMAGI:63000, householdSize:1, benchmarkAnnual:9000, status:"single" });
  check("ACA cliff over 400%", a.eligible ? 1 : 0, 0, 0);
  check("ACA cliff ptc 0", a.ptc, 0);
}
{
  const a = acaPTC({ acaMAGI:50000, householdSize:1, benchmarkAnnual:9000, status:"single" });
  check("ACA 50k applicable%", a.applicablePct!, 9.96, 0.05);
  check("ACA 50k expected", a.expectedContribution!, 50000*0.0996, 1);
  check("ACA 50k ptc", a.ptc, Math.max(0, 9000 - 50000*0.0996), 1);
}

// 20-23 end-to-end (single, $120k wages, $50k LTCG, std)
{
  const r = compute({ status:"single", wages:120000, longTermGains:50000, useStandard:true, includeNIIT:true, includeQBI:true });
  check("E2E taxableIncome", r.taxableIncome, 153900);
  check("E2E ordinaryTaxable", r.ordinaryTaxable, 103900);
  check("E2E ordTax", r.ordTax, bracketTax(103900, C.ordinary.single));
  check("E2E LTCG tax", r.cg.tax, 7500);
}

// 24-25 end-to-end NIIT trip
{
  const r = compute({ status:"single", wages:180000, longTermGains:60000, useStandard:true, includeNIIT:true });
  check("E2E NIIT", r.niit, 1520);
  check("E2E NIIT off", compute({ status:"single", wages:180000, longTermGains:60000, useStandard:true, includeNIIT:false }).niit, 0);
}

// 27-28 §1211 capital-loss limit ($3,000 / $1,500 MFS)
check("cap loss limit single AGI", compute({ status:"single", wages:100000, longTermGains:-20000, useStandard:true }).agi, 97000);
check("cap loss limit mfs AGI", compute({ status:"mfs", wages:100000, longTermGains:-20000, useStandard:true }).agi, 98500);

// 29-30 negative LTCG must not inflate ordinaryTaxable past taxableIncome
{
  const r = compute({ status:"single", wages:100000, longTermGains:-20000, useStandard:true });
  check("cap loss ordinaryTaxable == taxable", r.ordinaryTaxable, r.taxableIncome);
  check("cap loss ordTax", r.ordTax, bracketTax(97000 - 16100, C.ordinary.single));
}

// 31-32 ST/LT netting flows into pref + NIIT (§1411 nets gains)
{
  const r = compute({ status:"single", wages:240000, shortTermGains:-30000, longTermGains:50000, useStandard:true, includeNIIT:true });
  check("netting pref", r.pref, 20000);
  check("netting NIIT", r.niit, 760);
}

// 33 SSTB phase-in applies the wage limit to reduced amounts (§199A(d)(3))
check("QBI SSTB phase-in wage limit",
  qbiDeduction({ qbi:100000, taxableBeforeQBI:239275, netCapGains:0, w2wages:0, isSSTB:true, status:"single" }), 5000);

// 34 OBBBA senior deduction — MFS ineligible
check("senior deduction mfs = 0", compute({ status:"mfs", wages:50000, seniors:1, useStandard:true }).seniorDed, 0);

// 35 VA age deduction phases out on AFAGI (AGI minus taxable SS), not AGI
check("VA age ded AFAGI mfj",
  compute({ status:"mfj", interest:70000, socialSecurity:40000, seniors:2, vaExemptions:2, useStandard:true }).vaTax, 1274.30);

// 36-37 ACA 133-150% FPL band starts at 3.14% (Rev. Proc. 2025-25)
check("ACA 140% FPL applicable%", acaApplicablePct(140), 3.14 + (4.19 - 3.14) * (7 / 17), 0.005);
{
  const a = acaPTC({ acaMAGI:21910, householdSize:1, benchmarkAnnual:7200, status:"single" });
  check("ACA 140% FPL ptc", a.ptc, 7200 - 21910 * (acaApplicablePct(140) / 100), 1);
}

// 38 MFS IRMAA jumps to the second-highest tier above the first threshold
{
  const r = irmaa(150000, "mfs", 1);
  check("IRMAA mfs 150k tier", r.tier, 4, 0);
  check("IRMAA mfs 150k annual", r.annual, (446.30 + 83.30) * 12);
}

// 40 Additional Medicare is mandatory — not gated by the NIIT toggle
check("addl Medicare with NIIT off",
  compute({ status:"single", wages:300000, useStandard:true, includeNIIT:false }).addlMedicare, 900);

console.log(`\n${pass} passed, ${fail} failed`);
const g = globalThis as unknown as { process?: { exit: (n: number) => void } };
if (g.process) g.process.exit(fail ? 1 : 0);
