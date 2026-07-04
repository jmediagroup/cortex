"use client";

/* =====================================================================
   Capital-Gains Tax Efficiency — UI component for Money Guy Mutants.vip
   Imports the tested engine from @/lib/tax/taxEngine2026 (the source of
   truth for the math — do not edit the engine without re-running its tests).
   Styling maps to Money Guy Mutants's CSS-variable design tokens via `palette`.
   The advanced modules (NIIT, QBI, ACA, IRMAA) are gated behind Finance Pro.
   ===================================================================== */

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Lock } from "lucide-react";
import { compute, C, type FilingStatus, type TaxInput } from "@/lib/tax/taxEngine2026";

type Form = TaxInput & Record<string, unknown>;

interface CapitalGainsTaxToolProps {
  isPro?: boolean;
  isLoggedIn?: boolean;
  onUpgrade?: () => void;
  initialValues?: Record<string, unknown>;
}

const palette = {
  paper: "var(--bg-page)", panel: "var(--bg-card)", ink: "var(--text-primary)", muted: "var(--text-tertiary)",
  hair: "var(--border-default)", accent: "var(--emerald-500)", accentSoft: "var(--emerald-tint-soft)",
  z0: "var(--emerald-500)", z15: "var(--color-warning)", z20: "var(--color-negative)", ordinary: "var(--text-muted)",
  warnBg: "var(--color-warning-soft)", goodBg: "var(--emerald-tint-soft)",
};
const mono = "var(--font-mono, ui-monospace, SFMono-Regular, Menlo, Consolas, monospace)";
const sans = "var(--font-sans, Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif)";
const $ = (n: number) => (n < 0 ? "-" : "") + "$" + Math.abs(Math.round(n)).toLocaleString("en-US");
const $1 = (n: number) => "$" + Math.round(n).toLocaleString("en-US");
const pct = (n: number) => (n * 100).toFixed(1) + "%";

function Money({ value, size = 14, color, bold }: { value: number; size?: number; color?: string; bold?: boolean }) {
  return <span style={{ fontFamily: mono, fontVariantNumeric: "tabular-nums", fontSize: size, color: color || palette.ink, fontWeight: bold ? 600 : 500, whiteSpace: "nowrap" }}>{$(value)}</span>;
}

function Field({ label, value, onChange, hint, prefix = "$", step = 1000 }:
  { label: string; value: number | string; onChange: (v: number | "") => void; hint?: string; prefix?: string; step?: number }) {
  const [focused, setFocused] = useState(false);
  return (
    <label style={{ display: "block", marginBottom: 10 }}>
      <div style={{ fontSize: 12, color: palette.muted, marginBottom: 4, display: "flex", justifyContent: "space-between" }}>
        <span>{label}</span>{hint && <span style={{ fontSize: 11, opacity: .8 }}>{hint}</span>}
      </div>
      <div style={{ display: "flex", alignItems: "center", background: "var(--bg-section)", border: `1px solid ${palette.hair}`, borderRadius: 12, padding: "0 12px", boxShadow: focused ? "0 0 0 2px var(--emerald-500)" : "none", transition: "box-shadow .15s ease" }}>
        {prefix && <span style={{ color: palette.muted, fontSize: 13, marginRight: 4 }}>{prefix}</span>}
        <input type="number" value={value} step={step}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          onChange={e => onChange(e.target.value === "" ? "" : +e.target.value)}
          style={{ flex: 1, border: "none", background: "transparent", outline: "none", fontFamily: mono, fontSize: 14, padding: "10px 0", color: palette.ink, fontVariantNumeric: "tabular-nums", width: "100%" }} />
      </div>
    </label>
  );
}

function Toggle({ label, checked, onChange, locked, onLockedClick }:
  { label: string; checked: boolean; onChange: (v: boolean) => void; locked?: boolean; onLockedClick?: () => void }) {
  return (
    <button onClick={() => (locked ? onLockedClick?.() : onChange(!checked))} style={{ display: "flex", alignItems: "center", gap: 8, background: "none", border: "none", cursor: "pointer", padding: "4px 0", width: "100%", opacity: locked ? 0.8 : 1 }}>
      <span style={{ width: 34, height: 20, borderRadius: 20, background: checked && !locked ? palette.accent : palette.hair, position: "relative", transition: "background .15s", flexShrink: 0 }}>
        <span style={{ position: "absolute", top: 2, left: checked && !locked ? 16 : 2, width: 16, height: 16, borderRadius: 16, background: "#fff", transition: "left .15s", boxShadow: "0 1px 2px rgba(0,0,0,.2)" }} />
      </span>
      <span style={{ fontSize: 13, color: palette.ink, textAlign: "left", flex: 1 }}>{label}</span>
      {locked && (
        <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 10, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", color: palette.accent, background: palette.accentSoft, borderRadius: 6, padding: "2px 6px", flexShrink: 0 }}>
          <Lock size={10} />Pro
        </span>
      )}
    </button>
  );
}

function Section({ title, children, defaultOpen = true, note }: { title: string; children: React.ReactNode; defaultOpen?: boolean; note?: string }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ borderTop: `1px solid ${palette.hair}`, padding: "14px 0" }}>
      <button onClick={() => setOpen(!open)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
        <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: ".06em", textTransform: "uppercase", color: palette.ink }}>{title}</span>
        <span style={{ color: palette.muted, fontSize: 13 }}>{open ? "–" : "+"}</span>
      </button>
      {note && open && <div style={{ fontSize: 11.5, color: palette.muted, margin: "6px 0 10px" }}>{note}</div>}
      {open && <div style={{ marginTop: 12 }}>{children}</div>}
    </div>
  );
}

const Lg = ({ c, t }: { c: string; t: string }) => (
  <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
    <span style={{ width: 10, height: 10, borderRadius: 2, background: c }} />{t}</span>
);

/* The signature element: the bracket-stacking ladder */
function BracketLadder({ r, status }: { r: ReturnType<typeof compute>; status: FilingStatus }) {
  const [b0, b15] = C.ltcg[status];
  const ord = r.ordinaryTaxable, a0 = r.cg.at0, a15 = r.cg.at15, a20 = r.cg.at20;
  const total = ord + a0 + a15 + a20;
  const domain = Math.max(total * 1.08, b0 * 1.25, 60000);
  const x = (v: number) => (v / domain) * 100;
  const seg = (start: number, len: number, color: string) => len <= 0 ? null :
    <div title={$1(len)} style={{ position: "absolute", left: `${x(start)}%`, width: `${x(len)}%`, top: 0, bottom: 0, background: color }} />;
  const tick = (v: number, label: string, color: string) => v > domain ? null : (
    <div style={{ position: "absolute", left: `${x(v)}%`, top: -6, bottom: -20 }}>
      <div style={{ width: 1, height: "100%", background: color, opacity: .55 }} />
      <div style={{ position: "absolute", top: "100%", left: 0, transform: "translateX(-50%)", fontSize: 9.5, color, whiteSpace: "nowrap", fontFamily: mono }}>{label}<br />{$1(v)}</div>
    </div>
  );
  return (
    <div style={{ margin: "6px 0 30px" }}>
      <div style={{ position: "relative", height: 34, background: palette.paper, border: `1px solid ${palette.hair}`, borderRadius: 6, overflow: "visible" }}>
        <div style={{ position: "absolute", inset: 0, overflow: "hidden", borderRadius: 6 }}>
          {seg(0, ord, palette.ordinary)}
          {seg(ord, a0, palette.z0)}
          {seg(ord + a0, a15, palette.z15)}
          {seg(ord + a0 + a15, a20, palette.z20)}
        </div>
        {tick(b0, "0% ends", palette.z0)}
        {b15 < domain && tick(b15, "15% ends", palette.z15)}
      </div>
      <div style={{ display: "flex", gap: 14, marginTop: 26, flexWrap: "wrap", fontSize: 11, color: palette.muted }}>
        <Lg c={palette.ordinary} t={`Ordinary income · ${$1(ord)}`} />
        {a0 > 0 && <Lg c={palette.z0} t={`Gains @ 0% · ${$1(a0)}`} />}
        {a15 > 0 && <Lg c={palette.z15} t={`Gains @ 15% · ${$1(a15)}`} />}
        {a20 > 0 && <Lg c={palette.z20} t={`Gains @ 20% · ${$1(a20)}`} />}
      </div>
    </div>
  );
}

function Headroom({ label, value, sub, tone, onSet }:
  { label: string; value: number | null; sub: string; tone?: "good" | "warn" | "ink"; onSet?: () => void }) {
  const color = tone === "good" ? palette.z0 : tone === "warn" ? palette.z20 : palette.accent;
  return (
    <div style={{ background: palette.panel, border: `1px solid ${palette.hair}`, borderRadius: 10, padding: "12px 13px", flex: "1 1 150px", minWidth: 140 }}>
      <div style={{ fontSize: 11, color: palette.muted, marginBottom: 3 }}>{label}</div>
      <div style={{ fontFamily: mono, fontVariantNumeric: "tabular-nums", fontSize: 19, fontWeight: 600, color }}>{value == null ? "—" : $1(value)}</div>
      <div style={{ fontSize: 11, color: palette.muted, marginTop: 3, lineHeight: 1.35 }}>{sub}</div>
      {onSet != null && value != null && value > 0 &&
        <button onClick={onSet} style={{ marginTop: 8, fontSize: 11, color: palette.accent, background: palette.accentSoft, border: "none", borderRadius: 6, padding: "4px 8px", cursor: "pointer", fontWeight: 600 }}>Set slider here</button>}
    </div>
  );
}

function Row({ label, value, color, strong, indent }: { label: string; value: number; color?: string; strong?: boolean; indent?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", paddingLeft: indent ? 14 : 0, borderBottom: `1px solid ${palette.hair}` }}>
      <span style={{ fontSize: strong ? 13.5 : 13, color: strong ? palette.ink : palette.muted, fontWeight: strong ? 600 : 400 }}>{label}</span>
      <Money value={value} color={color} bold={strong} size={strong ? 14 : 13} />
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: "good" | "warn" | "ink" }) {
  const color = tone === "good" ? palette.z0 : tone === "warn" ? palette.z20 : palette.ink;
  return (
    <div>
      <div style={{ fontSize: 11, color: palette.muted, marginBottom: 2 }}>{label}</div>
      <div style={{ fontFamily: mono, fontVariantNumeric: "tabular-nums", fontSize: 18, fontWeight: 600, color }}>{value}</div>
    </div>
  );
}

const FILING: [FilingStatus, string][] = [
  ["single", "Single"], ["mfj", "Married filing jointly"],
  ["hoh", "Head of household"], ["mfs", "Married filing separately"],
];

export default function CapitalGainsTaxTool({ isPro = false, onUpgrade, initialValues }: CapitalGainsTaxToolProps) {
  const [inp, setInp] = useState<Form>({
    status: "single", wages: 120000, k1: 0, interest: 1500, ordinaryDividends: 3000,
    qualifiedDividends: 2500, shortTermGains: 0, longTermGains: 40000, otherOrdinary: 0,
    adjustments: 0, socialSecurity: 0, taxExemptInterest: 0,
    useStandard: true, itemized: 25000, seniors: 0, blind: 0,
    qbiWages: 0, qbiUBIA: 0, isSSTB: false, seIncome: 0, otherNII: 0,
    includeNIIT: true, includeQBI: true, includeACA: false, includeIRMAA: false,
    householdSize: 1, benchmarkAnnual: 9000, medicareEnrollees: 1, vaExemptions: 1,
  });

  // Hydrate a saved scenario (?scenario=…) once on mount.
  const hydrated = useRef(false);
  useEffect(() => {
    if (!initialValues || hydrated.current) return;
    hydrated.current = true;
    setInp(p => ({ ...p, ...initialValues }));
  }, [initialValues]);

  const set = (k: string, v: number | string | boolean) => setInp(p => ({ ...p, [k]: v } as Form));
  const status = inp.status as FilingStatus;
  const upgrade = () => onUpgrade?.();

  // Advanced modules are Finance Pro. For free users, force them off so the
  // engine never computes (or reveals) gated layers — applied to every compute().
  // Virginia personal exemptions follow filing status ($930 per person).
  const effInp = useMemo<Form>(() => {
    const withVa = { ...inp, vaExemptions: inp.status === "mfj" ? 2 : 1 };
    return isPro ? withVa : { ...withVa, includeNIIT: false, includeQBI: false, includeACA: false, includeIRMAA: false };
  }, [inp, isPro]);

  const cur = useMemo(() => compute(effInp as TaxInput), [effInp]);
  // Baseline zeroes ONLY the long-term-gains lever. Short-term gains are part
  // of the user's standing income — zeroing them too would misattribute their
  // ordinary tax to the LT slider and corrupt the 0%-bracket headroom.
  const base = useMemo(() => compute({ ...effInp, longTermGains: 0 } as TaxInput), [effInp]);
  const plus = useMemo(() => compute({ ...effInp, longTermGains: (+(effInp.longTermGains as number) || 0) + 1000 } as TaxInput), [effInp]);

  const marginalNext = (plus.totalIncomeTax - cur.totalIncomeTax) / 1000;
  const ltcg = +(inp.longTermGains as number) || 0;
  const cgEffective = ltcg > 0 ? (cur.totalIncomeTax - base.totalIncomeTax) / ltcg : 0;

  // headroom from the zero-gains baseline
  const [b0] = C.ltcg[status];
  const room0 = Math.max(0, b0 - base.ordinaryTaxable - base.cg.at0);
  const niitThresh = C.niit[status];
  const roomNIIT = Math.max(0, niitThresh - base.magi);
  let roomIRMAA: number | null = null, irmaaLabel = "";
  if (effInp.includeIRMAA) {
    // MFS has its own two-tier IRMAA schedule (mirrors the engine).
    const bounds = status === "mfs"
      ? [C.irmaa.single[0], C.irmaa.single[4] - C.irmaa.single[0]]
      : C.irmaa[status === "mfj" ? "mfj" : "single"];
    const m = base.magi; let nb: number | null = null;
    for (const b of bounds) { if (m <= b) { nb = b; break; } }
    if (nb != null) { roomIRMAA = Math.max(0, nb - m); irmaaLabel = `Until next IRMAA tier (${$1(nb)} MAGI)`; }
  }
  let roomACA: number | null = null;
  if (effInp.includeACA && base.aca && base.aca.cliff && !base.aca.overCliff) {
    roomACA = Math.max(0, base.aca.cliff - (base.aca.acaMAGI || 0));
  }

  const setLTCG = (v: number) => set("longTermGains", Math.round(v));
  const sliderMax = Math.max(200000, Math.ceil((ltcg * 1.5 + room0 + 100000) / 50000) * 50000);
  const sliderPos = (Math.min(ltcg, sliderMax) / sliderMax) * 100;

  return (
    <div style={{ fontFamily: sans, color: palette.ink }}>
      <style>{`.cgtool input[type=range]{-webkit-appearance:none;appearance:none;height:6px;border-radius:6px;outline:none}
        .cgtool input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:22px;height:22px;border-radius:50%;background:${palette.accent};cursor:pointer;border:3px solid var(--bg-card);box-shadow:0 1px 4px rgba(0,0,0,.35)}
        .cgtool input[type=range]::-moz-range-thumb{width:22px;height:22px;border-radius:50%;background:${palette.accent};cursor:pointer;border:3px solid var(--bg-card)}
        .cgtool-grid{display:grid;grid-template-columns:minmax(280px,360px) 1fr;gap:18px;align-items:start}
        @media (max-width:820px){.cgtool-grid{grid-template-columns:1fr}}`}</style>

      <div className="cgtool">
        <div className="cgtool-grid">
          {/* ============ INPUTS ============ */}
          <div style={{ background: palette.panel, border: `1px solid ${palette.hair}`, borderRadius: 14, padding: "4px 18px 18px" }}>
            <Section title="Filing & income" note="Enter your income before any stock sale. S-corp cash distributions aren't taxed again — enter the K-1 pass-through profit, not distributions.">
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 12, color: palette.muted, marginBottom: 5 }}>Filing status</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                  {FILING.map(([v, l]) => (
                    <button key={v} onClick={() => set("status", v)} style={{ padding: "8px 6px", fontSize: 12, borderRadius: 8, cursor: "pointer", border: `1px solid ${status === v ? palette.accent : palette.hair}`, background: status === v ? palette.accentSoft : palette.paper, color: status === v ? palette.accent : palette.ink, fontWeight: status === v ? 600 : 400 }}>{l}</button>
                  ))}
                </div>
              </div>
              <Field label="Wages / S-corp salary (W-2)" value={inp.wages as number} onChange={v => set("wages", v)} />
              <Field label="S-corp / pass-through profit (K-1)" value={inp.k1 as number} onChange={v => set("k1", v)} hint="ordinary, no SE tax" />
              <Field label="Taxable interest" value={inp.interest as number} onChange={v => set("interest", v)} step={500} />
              <Field label="Ordinary dividends (total)" value={inp.ordinaryDividends as number} onChange={v => set("ordinaryDividends", v)} step={500} />
              <Field label="…of which qualified" value={inp.qualifiedDividends as number} onChange={v => set("qualifiedDividends", v)} hint="taxed at cap-gains rates" step={500} />
              <Field label="Short-term gains (held ≤1 yr)" value={inp.shortTermGains as number} onChange={v => set("shortTermGains", v)} hint="taxed as ordinary" />
              <Field label="Social Security benefits" value={inp.socialSecurity as number} onChange={v => set("socialSecurity", v)} step={500} />
              <Field label="Above-the-line adjustments" value={inp.adjustments as number} onChange={v => set("adjustments", v)} hint="HSA, ½ SE tax…" step={500} />
              <Field label="Tax-exempt interest (muni)" value={inp.taxExemptInterest as number} onChange={v => set("taxExemptInterest", v)} step={500} />
            </Section>

            <Section title="Deductions">
              <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
                {[["std", "Standard", true], ["item", "Itemized", false]].map(([k, l, std]) => (
                  <button key={k as string} onClick={() => set("useStandard", std as boolean)} style={{ flex: 1, padding: "8px", fontSize: 12.5, borderRadius: 8, cursor: "pointer", border: `1px solid ${inp.useStandard === std ? palette.accent : palette.hair}`, background: inp.useStandard === std ? palette.accentSoft : palette.paper, color: inp.useStandard === std ? palette.accent : palette.ink, fontWeight: inp.useStandard === std ? 600 : 400 }}>{l as string}</button>
                ))}
              </div>
              {inp.useStandard
                ? <div style={{ fontSize: 12, color: palette.muted }}>2026 standard deduction: <b style={{ color: palette.ink }}>{$1(C.stdDed[status])}</b>{inp.seniors ? ` + ${$1((inp.seniors as number) * C.addlStd[status])} age 65+` : ""}.</div>
                : <Field label="Total itemized (SALT capped $40k)" value={inp.itemized as number} onChange={v => set("itemized", v)} hint="VA must match federal choice" />}
            </Section>

            <Section title="Modules" note="Toggle the layers relevant to you. Each adds its own cliff to watch.">
              <div style={{ display: "grid", gap: 6 }}>
                <Toggle label="Net Investment Income Tax (3.8%)" checked={!!effInp.includeNIIT} onChange={v => set("includeNIIT", v)} locked={!isPro} onLockedClick={upgrade} />
                <Toggle label="QBI deduction (S-corp / 199A)" checked={!!effInp.includeQBI} onChange={v => set("includeQBI", v)} locked={!isPro} onLockedClick={upgrade} />
                <Toggle label="ACA premium-tax-credit cliff" checked={!!effInp.includeACA} onChange={v => set("includeACA", v)} locked={!isPro} onLockedClick={upgrade} />
                <Toggle label="Medicare IRMAA tiers" checked={!!effInp.includeIRMAA} onChange={v => set("includeIRMAA", v)} locked={!isPro} onLockedClick={upgrade} />
                <Toggle label="Age 65+ (senior deductions)" checked={!!inp.seniors} onChange={v => set("seniors", v ? (status === "mfj" ? 2 : 1) : 0)} />
              </div>
              {!isPro &&
                <div style={{ marginTop: 12, fontSize: 11.5, color: palette.muted, lineHeight: 1.45 }}>
                  NIIT, QBI, ACA-cliff and IRMAA modeling are part of <b style={{ color: palette.accent }}>Finance Pro</b>. The core 0/15/20% picture and 0%-bracket headroom are free.
                </div>}
              {isPro && effInp.includeQBI &&
                <div style={{ marginTop: 12, paddingTop: 10, borderTop: `1px dashed ${palette.hair}` }}>
                  <div style={{ fontSize: 11.5, color: palette.muted, marginBottom: 8 }}>QBI wage limit applies only above {$1(C.qbiThresh[status])} taxable income.</div>
                  <Field label="S-corp W-2 wages paid (for QBI limit)" value={inp.qbiWages as number} onChange={v => set("qbiWages", v)} />
                  <Toggle label="Business is an SSTB (consulting, etc.)" checked={!!inp.isSSTB} onChange={v => set("isSSTB", v)} />
                </div>}
              {isPro && effInp.includeACA &&
                <div style={{ marginTop: 12, paddingTop: 10, borderTop: `1px dashed ${palette.hair}` }}>
                  <Field label="Household size" value={inp.householdSize as number} onChange={v => set("householdSize", v)} prefix="" step={1} />
                  <Field label="Benchmark silver premium (annual)" value={inp.benchmarkAnnual as number} onChange={v => set("benchmarkAnnual", v)} hint="SLCSP, Form 1095-A col B" step={500} />
                </div>}
              {isPro && effInp.includeIRMAA &&
                <div style={{ marginTop: 12, paddingTop: 10, borderTop: `1px dashed ${palette.hair}` }}>
                  <Field label="People on Medicare in household" value={inp.medicareEnrollees as number} onChange={v => set("medicareEnrollees", v)} prefix="" step={1} />
                  <div style={{ fontSize: 11, color: palette.muted, marginTop: 4 }}>2026 income sets your <b>2028</b> Part B/D premium (2-yr lookback).</div>
                </div>}
            </Section>
          </div>

          {/* ============ RESULTS ============ */}
          <div style={{ display: "grid", gap: 16 }}>
            <div style={{ background: palette.panel, border: `1px solid ${palette.hair}`, borderRadius: 14, padding: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>Long-term gains to realize</span>
                <span style={{ fontFamily: mono, fontSize: 24, fontWeight: 700, color: palette.accent, fontVariantNumeric: "tabular-nums" }}>{$1(ltcg)}</span>
              </div>
              <input type="range" min={0} max={sliderMax} step={1000} value={Math.min(ltcg, sliderMax)}
                onChange={e => setLTCG(+e.target.value)}
                style={{ width: "100%", background: `linear-gradient(90deg, ${palette.accent} ${sliderPos}%, ${palette.hair} ${sliderPos}%)` }} />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: palette.muted, marginTop: 2 }}>
                <span>$0</span><span>{$1(sliderMax)}</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))", gap: 10, marginTop: 16 }}>
                <Stat label="Total tax (fed+VA)" value={$1(cur.totalIncomeTax)} />
                <Stat label="Tax on these gains" value={$1(cur.totalIncomeTax - base.totalIncomeTax)} />
                <Stat label="Next-$ marginal rate" value={pct(marginalNext)} tone={marginalNext > 0.30 ? "warn" : "good"} />
                <Stat label="Effective rate on gains" value={ltcg > 0 ? pct(cgEffective) : "—"} />
                <Stat label="After-tax from gains" value={$1(ltcg - (cur.totalIncomeTax - base.totalIncomeTax))} tone="good" />
              </div>
            </div>

            <div style={{ background: palette.goodBg, border: `1px solid ${palette.hair}`, borderRadius: 14, padding: "14px 16px" }}>
              <div style={{ fontSize: 12.5, color: palette.ink }}>
                <b style={{ color: palette.z0 }}>0% federal bracket:</b> based on your other income, the first{" "}
                <b style={{ fontFamily: mono }}>{$1(room0)}</b> of long-term gains is taxed at <b>0% federally</b>.
                {room0 > 0 && <> Virginia still taxes it at up to 5.75% (~{$1(room0 * 0.0575)}).</>}
                {room0 === 0 && <> Your other income already fills the 0% bracket, so additional gains start at 15%.</>}
                {(+(inp.socialSecurity as number) || 0) > 0 && <> Realizing gains can also make more of your Social Security taxable, which shrinks this headroom — treat it as an upper bound.</>}
              </div>
            </div>

            <div style={{ background: palette.panel, border: `1px solid ${palette.hair}`, borderRadius: 14, padding: "16px 18px" }}>
              <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: ".06em", textTransform: "uppercase", marginBottom: 6 }}>How your income stacks</div>
              <div style={{ fontSize: 11.5, color: palette.muted, marginBottom: 6 }}>Ordinary income fills the brackets first; long-term gains stack on top and are taxed in the 0 → 15 → 20% zones.</div>
              <BracketLadder r={cur} status={status} />
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Headroom label="Gains at 0% federal" value={room0} tone="good" sub="Most efficient slice — fills the 0% LTCG bracket." onSet={() => setLTCG(room0)} />
              {effInp.includeNIIT && <Headroom label="Headroom before 3.8% NIIT" value={roomNIIT} tone={roomNIIT < 50000 ? "warn" : "ink"} sub={`MAGI crosses ${$1(niitThresh)} → 3.8% on investment income.`} onSet={() => setLTCG(roomNIIT)} />}
              {effInp.includeIRMAA && roomIRMAA != null && <Headroom label="Headroom before IRMAA jump" value={roomIRMAA} tone={roomIRMAA < 30000 ? "warn" : "ink"} sub={irmaaLabel} onSet={() => setLTCG(roomIRMAA!)} />}
              {effInp.includeACA && roomACA != null && <Headroom label="Headroom before ACA cliff" value={roomACA} tone="warn" sub="Crossing 400% FPL forfeits the entire premium credit." onSet={() => setLTCG(roomACA!)} />}
            </div>

            <div style={{ background: palette.panel, border: `1px solid ${palette.hair}`, borderRadius: 14, padding: "6px 18px 14px" }}>
              <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: ".06em", textTransform: "uppercase", margin: "12px 0 4px" }}>Full breakdown</div>
              <Row label="Adjusted gross income (AGI)" value={cur.agi} />
              {cur.taxableSS > 0 && <Row label="Taxable Social Security" value={cur.taxableSS} indent />}
              <Row label={`Deduction (${inp.useStandard ? "standard" : "itemized"})`} value={-cur.deduction} />
              {cur.seniorDed > 0 && <Row label="Senior deduction (OBBBA)" value={-cur.seniorDed} indent />}
              {cur.qbiDed > 0 && <Row label="QBI deduction (§199A)" value={-cur.qbiDed} />}
              <Row label="Taxable income" value={cur.taxableIncome} strong />
              <div style={{ height: 8 }} />
              <Row label="Federal ordinary income tax" value={cur.ordTax} />
              <Row label="Federal LTCG / qual-div tax" value={cur.cg.tax} />
              {cur.niit > 0 && <Row label="Net Investment Income Tax (3.8%)" value={cur.niit} color={palette.z20} />}
              {cur.addlMedicare > 0 && <Row label="Additional Medicare (0.9%)" value={cur.addlMedicare} color={palette.z20} />}
              <Row label="Virginia income tax" value={cur.vaTax} />
              <Row label="Total income tax" value={cur.totalIncomeTax} strong color={palette.ink} />
            </div>

            {effInp.includeACA && cur.aca &&
              <div style={{ background: cur.aca.overCliff ? palette.warnBg : palette.panel, border: `1px solid ${palette.hair}`, borderRadius: 14, padding: "14px 18px" }}>
                <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: ".06em", textTransform: "uppercase", marginBottom: 8 }}>ACA premium tax credit</div>
                {cur.aca.eligible ? (
                  <div style={{ fontSize: 13, color: palette.ink }}>
                    At <b>{cur.aca.fplPct!.toFixed(0)}% of poverty</b> you contribute {cur.aca.applicablePct!.toFixed(2)}% of income ({$1(cur.aca.expectedContribution!)}/yr) → estimated credit <b style={{ color: palette.z0 }}>{$1(cur.aca.ptc)}/yr</b>.
                  </div>
                ) : (
                  <div style={{ fontSize: 13, color: cur.aca.overCliff ? palette.z20 : palette.ink }}>
                    {cur.aca.overCliff
                      ? <><b>Over the 400% FPL cliff</b> ({cur.aca.fplPct!.toFixed(0)}%). You forfeit the <b>entire</b> premium credit — this can cost thousands. The cliff sits at {$1(cur.aca.cliff!)} of ACA-MAGI.</>
                      : cur.aca.reason}
                  </div>
                )}
              </div>}

            {effInp.includeIRMAA && cur.irmaa &&
              <div style={{ background: palette.panel, border: `1px solid ${palette.hair}`, borderRadius: 14, padding: "14px 18px" }}>
                <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: ".06em", textTransform: "uppercase", marginBottom: 8 }}>Medicare IRMAA (affects 2028 premiums)</div>
                {cur.irmaa.tier === 0
                  ? <div style={{ fontSize: 13 }}>Below the first threshold — no surcharge. Next tier starts at {$1(cur.irmaa.nextBound!)} MAGI.</div>
                  : <div style={{ fontSize: 13, color: palette.ink }}>Tier <b>{cur.irmaa.tier}</b> → surcharge of <b style={{ color: palette.z20 }}>{$1(cur.irmaa.annual)}/yr</b>{(+(inp.medicareEnrollees as number)! || 1) > 1 ? ` (${inp.medicareEnrollees} enrollees)` : ""}. IRMAA is a cliff — one dollar over jumps the whole tier.</div>}
              </div>}

            <div style={{ fontSize: 11, color: palette.muted, lineHeight: 1.5, padding: "0 4px" }}>
              Simplifications: AMT, the 0.9% interplay with self-employment, VA subtractions beyond the Social Security exemption and age deduction, and collectibles/§1250/QSBS special rates are not modeled. Virginia taxes all gains as ordinary income (no preferential rate) and fully exempts Social Security. Verify with a CPA before acting on a large sale.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
