/* =====================================================================
   Known-answer tests for taxEngine2026.ts (25 cases).
   Run standalone:  npx tsx lib/tax/taxEngine2026.test.ts
   Or adapt to Vitest: replace `check(...)` with expect(got).toBeCloseTo(want).
   Keep these GREEN after any change to the engine.
   ===================================================================== */
import {
  C, bracketTax, ssTaxable, qbiDeduction, capGainsTax, niitTax, irmaa, acaPTC, compute,
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

console.log(`\n${pass} passed, ${fail} failed`);
const g = globalThis as unknown as { process?: { exit: (n: number) => void } };
if (g.process) g.process.exit(fail ? 1 : 0);
