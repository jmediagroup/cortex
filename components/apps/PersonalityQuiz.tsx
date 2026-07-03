'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from 'react';
import {
  ARCHETYPES,
  ARCHETYPE_ORDER,
  QUESTIONS,
  emptyScoreMap,
  maxPossibleScoreFor,
  resolveResult,
  type ArchetypeId,
  type ScoreMap,
} from '@/lib/personality-quiz-data';
import { ShareBar } from './personality-quiz/ShareBar';

type Stage = 'intro' | 'quiz' | 'result';

export default function PersonalityQuiz() {
  const [stage, setStage] = useState<Stage>('intro');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [transitioning, setTransitioning] = useState(false);

  const total = QUESTIONS.length;
  const question = QUESTIONS[currentIndex];
  const liveRegionRef = useRef<HTMLDivElement>(null);

  const result = useMemo(() => {
    if (stage !== 'result') {
      return { scores: emptyScoreMap(), primary: 'accumulator' as ArchetypeId, secondary: 'optimizer' as ArchetypeId };
    }
    return resolveResult(answers);
  }, [answers, stage]);

  useEffect(() => {
    if (stage === 'quiz' && liveRegionRef.current) {
      liveRegionRef.current.textContent = `Question ${question.index} of ${total}: ${question.prompt}`;
    }
  }, [stage, question, total]);

  const handleSelect = useCallback(
    (optionId: string) => {
      if (transitioning) return;
      const updated = { ...answers, [question.id]: optionId };
      setAnswers(updated);
      setTransitioning(true);

      window.setTimeout(() => {
        if (currentIndex + 1 < total) {
          setCurrentIndex((i) => i + 1);
          setTransitioning(false);
        } else {
          setStage('result');
          setTransitioning(false);
        }
      }, 280);
    },
    [answers, currentIndex, question, total, transitioning],
  );

  const handleBack = useCallback(() => {
    if (currentIndex === 0 || transitioning) return;
    setCurrentIndex((i) => i - 1);
  }, [currentIndex, transitioning]);

  const handleStart = useCallback(() => {
    setAnswers({});
    setCurrentIndex(0);
    setStage('quiz');
  }, []);

  const handleRetake = useCallback(() => {
    setAnswers({});
    setCurrentIndex(0);
    setStage('quiz');
  }, []);

  return (
    <div style={shellStyle}>
      <style>{quizCss}</style>

      <div className="pq-live" aria-live="polite" aria-atomic="true" ref={liveRegionRef} />

      {stage === 'intro' && <IntroPanel onStart={handleStart} />}

      {stage === 'quiz' && (
        <QuestionPanel
          questionIndex={currentIndex}
          total={total}
          selected={answers[question.id]}
          transitioning={transitioning}
          onSelect={handleSelect}
          onBack={handleBack}
        />
      )}

      {stage === 'result' && (
        <ResultPanel
          scores={result.scores}
          primary={result.primary}
          secondary={result.secondary}
          onRetake={handleRetake}
        />
      )}
    </div>
  );
}

/* ---------------- Intro ---------------- */

function IntroPanel({ onStart }: { onStart: () => void }) {
  return (
    <section className="pq-card pq-fade-in" aria-labelledby="pq-intro-title">
      <div className="eyebrow" style={{ color: 'var(--emerald-500)', marginBottom: 12 }}>
        ● 10 QUESTIONS · 2 MINUTES
      </div>
      <h2
        id="pq-intro-title"
        style={{
          fontSize: 'clamp(28px, 5vw, 40px)',
          fontWeight: 700,
          letterSpacing: '-0.025em',
          margin: '0 0 14px',
          lineHeight: 1.1,
        }}
      >
        What kind of investor are you, really?
      </h2>
      <p
        style={{
          color: 'var(--text-secondary)',
          fontSize: 16,
          lineHeight: 1.6,
          margin: '0 0 28px',
          maxWidth: 560,
        }}
      >
        Money Guy Mutants maps your money instincts to one of six investor archetypes — from
        the patient Accumulator to the high-conviction Visionary. No email required.
        Just answer honestly, and we&rsquo;ll tell you exactly how you&rsquo;re wired.
      </p>

      <button type="button" className="pq-btn pq-btn--primary" onClick={onStart}>
        Start the quiz <span aria-hidden="true">→</span>
      </button>

      <div
        style={{
          marginTop: 40,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 12,
        }}
      >
        {ARCHETYPE_ORDER.map((id) => {
          const a = ARCHETYPES[id];
          return (
            <div key={id} className="pq-archetype-chip">
              <span className="pq-archetype-chip__name">{a.shortName}</span>
              <span className="pq-archetype-chip__tag">{a.tagline}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ---------------- Question ---------------- */

function QuestionPanel({
  questionIndex,
  total,
  selected,
  transitioning,
  onSelect,
  onBack,
}: {
  questionIndex: number;
  total: number;
  selected?: string;
  transitioning: boolean;
  onSelect: (optionId: string) => void;
  onBack: () => void;
}) {
  const question = QUESTIONS[questionIndex];
  const progress = ((questionIndex + (selected ? 1 : 0)) / total) * 100;

  return (
    <section className="pq-card" aria-label={`Question ${question.index} of ${total}`}>
      <div className="pq-progress" aria-hidden="true">
        <div className="pq-progress__track">
          <div
            className="pq-progress__fill"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="pq-progress__label">
          <span className="mono" style={{ color: 'var(--text-tertiary)' }}>
            QUESTION {String(question.index).padStart(2, '0')} / {String(total).padStart(2, '0')}
          </span>
          <button
            type="button"
            className="pq-back"
            onClick={onBack}
            disabled={questionIndex === 0}
            aria-label="Previous question"
          >
            ← Back
          </button>
        </div>
      </div>

      <fieldset
        className={transitioning ? 'pq-fieldset pq-fieldset--leaving' : 'pq-fieldset pq-fieldset--entering'}
        key={question.id}
      >
        <legend className="pq-legend">{question.prompt}</legend>
        <div className="pq-options" role="radiogroup">
          {question.options.map((opt, i) => {
            const isSelected = selected === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                role="radio"
                aria-checked={isSelected}
                className={`pq-option ${isSelected ? 'pq-option--selected' : ''}`}
                style={{ animationDelay: `${i * 50}ms` }}
                onClick={() => onSelect(opt.id)}
              >
                <span className="pq-option__letter" aria-hidden="true">
                  {String.fromCharCode(65 + i)}
                </span>
                <span className="pq-option__label">{opt.label}</span>
              </button>
            );
          })}
        </div>
      </fieldset>
    </section>
  );
}

/* ---------------- Result ---------------- */

function ResultPanel({
  scores,
  primary,
  secondary,
  onRetake,
}: {
  scores: ScoreMap;
  primary: ArchetypeId;
  secondary: ArchetypeId;
  onRetake: () => void;
}) {
  const archetype = ARCHETYPES[primary];
  const secondaryArchetype = ARCHETYPES[secondary];
  const maxScores = useMemo(
    () =>
      Object.fromEntries(
        ARCHETYPE_ORDER.map((id) => [id, maxPossibleScoreFor(id)]),
      ) as Record<ArchetypeId, number>,
    [],
  );
  const [typed, setTyped] = useState('');

  useEffect(() => {
    let i = 0;
    const target = archetype.name;
    const interval = window.setInterval(() => {
      i += 1;
      setTyped(target.slice(0, i));
      if (i >= target.length) window.clearInterval(interval);
    }, 55);
    return () => window.clearInterval(interval);
  }, [archetype.name]);

  return (
    <section className="pq-card pq-card--result pq-fade-in" aria-live="polite">
      <div
        className="eyebrow mono"
        style={{ color: 'var(--emerald-500)', marginBottom: 14, letterSpacing: '0.18em' }}
      >
        ● FINANCIAL PERSONALITY REPORT
      </div>

      <h2 className="pq-result-name">
        {typed}
        <span className="pq-caret" aria-hidden="true" />
      </h2>
      <p className="pq-result-tagline">&ldquo;{archetype.tagline}&rdquo;</p>

      <div className="pq-pills" style={{ marginTop: 20 }}>
        <span className="pq-pill pq-pill--primary">
          <span className="pq-pill__label">PRIMARY</span>
          <span className="pq-pill__value">{archetype.name}</span>
        </span>
        <span className="pq-pill">
          <span className="pq-pill__label">SECONDARY</span>
          <span className="pq-pill__value">{secondaryArchetype.name}</span>
        </span>
      </div>

      <div className="pq-meters" aria-label="Score breakdown by archetype">
        {ARCHETYPE_ORDER.map((id, i) => {
          const a = ARCHETYPES[id];
          const value = scores[id];
          const pct = Math.max(4, Math.round((value / maxScores[id]) * 100));
          const isPrimary = id === primary;
          const isSecondary = id === secondary;
          return (
            <div key={id} className="pq-meter">
              <div className="pq-meter__row">
                <span className={`pq-meter__label mono ${isPrimary ? 'pq-meter__label--primary' : ''}`}>
                  {a.shortName.toUpperCase()}
                </span>
                <span className="pq-meter__value mono">{value}</span>
              </div>
              <div className="pq-meter__track">
                <div
                  className={`pq-meter__fill ${isPrimary ? 'pq-meter__fill--primary' : ''} ${isSecondary ? 'pq-meter__fill--secondary' : ''}`}
                  style={{
                    ['--pq-fill' as keyof CSSProperties as string]: `${pct}%`,
                    animationDelay: `${i * 90}ms`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <p className="pq-result-summary">{archetype.summary}</p>

      <div className="pq-grid">
        <div className="pq-block">
          <div className="eyebrow" style={{ color: 'var(--emerald-500)', marginBottom: 10 }}>
            ▲ STRENGTHS
          </div>
          <ul className="pq-list">
            {archetype.strengths.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </div>
        <div className="pq-block">
          <div className="eyebrow" style={{ color: 'var(--color-warning)', marginBottom: 10 }}>
            ◆ WATCH OUT FOR
          </div>
          <ul className="pq-list">
            {archetype.watchOuts.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="pq-tools">
        <div className="eyebrow" style={{ color: 'var(--text-tertiary)', marginBottom: 10 }}>
          NEXT FROM CORTEX
        </div>
        <div className="pq-tools__row">
          {archetype.tools.map((tool) => (
            <a key={tool.href} href={tool.href} className="pq-tool-pill">
              {tool.label} <span aria-hidden="true">→</span>
            </a>
          ))}
        </div>
      </div>

      <ShareBar primary={primary} secondary={secondary} onRetake={onRetake} />
    </section>
  );
}

/* ---------------- styles ---------------- */

const shellStyle: CSSProperties = {
  width: '100%',
  maxWidth: 760,
  margin: '0 auto',
};

const quizCss = `
  .pq-live {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0,0,0,0);
    white-space: nowrap;
    border: 0;
  }

  .pq-card {
    background: var(--bg-glass);
    border: 1px solid var(--glass-border);
    border-radius: var(--radius-xl);
    backdrop-filter: var(--glass-blur);
    -webkit-backdrop-filter: var(--glass-blur);
    padding: clamp(20px, 4vw, 36px);
    box-shadow: var(--shadow-card), var(--shadow-inset-top);
  }

  .pq-card--result {
    background:
      radial-gradient(circle at top right, var(--aurora-emerald), transparent 55%),
      var(--bg-glass);
  }

  .pq-fade-in {
    animation: pq-fade-up 420ms var(--ease-out-expo) both;
  }

  /* Progress bar */
  .pq-progress { margin-bottom: 28px; }
  .pq-progress__track {
    height: 4px;
    background: var(--bg-glass);
    border-radius: var(--radius-full);
    overflow: hidden;
    border: 1px solid var(--border-subtle);
  }
  .pq-progress__fill {
    height: 100%;
    background: linear-gradient(90deg, var(--emerald-600), var(--emerald-500));
    box-shadow: 0 0 12px var(--emerald-500);
    border-radius: var(--radius-full);
    transition: width 460ms var(--ease-out-expo);
  }
  .pq-progress__label {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 10px;
    font-size: 11px;
    letter-spacing: 0.14em;
  }
  .pq-back {
    background: transparent;
    border: 0;
    color: var(--text-tertiary);
    font-size: 12px;
    cursor: pointer;
    padding: 4px 0;
    letter-spacing: 0.04em;
  }
  .pq-back:hover:not(:disabled) { color: var(--text-primary); }
  .pq-back:disabled { opacity: 0.35; cursor: not-allowed; }

  /* Question */
  .pq-fieldset {
    border: 0;
    margin: 0;
    padding: 0;
    min-width: 0;
  }
  .pq-fieldset--entering {
    animation: pq-slide-in 360ms var(--ease-out-expo) both;
  }
  .pq-fieldset--leaving {
    animation: pq-slide-out 260ms var(--ease-out-quart) both;
  }
  .pq-legend {
    font-size: clamp(20px, 3.6vw, 28px);
    font-weight: 700;
    color: var(--text-primary);
    letter-spacing: -0.02em;
    line-height: 1.25;
    margin-bottom: 24px;
    padding: 0;
    display: block;
    width: 100%;
  }

  .pq-options {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .pq-option {
    display: flex;
    align-items: center;
    gap: 14px;
    width: 100%;
    min-height: 64px;
    text-align: left;
    background: var(--bg-glass);
    border: 1px solid var(--glass-border);
    border-radius: var(--radius-md);
    padding: 14px 18px;
    color: var(--text-primary);
    font-size: 15px;
    line-height: 1.45;
    cursor: pointer;
    transition: transform 160ms var(--ease-out-quart),
                background 160ms ease,
                border-color 160ms ease,
                box-shadow 160ms ease;
    animation: pq-option-in 380ms var(--ease-out-expo) both;
  }
  .pq-option:hover {
    background: var(--bg-glass-strong);
    border-color: var(--emerald-border-soft);
    transform: translateY(-1px);
  }
  .pq-option:focus-visible {
    outline: 2px solid var(--emerald-500);
    outline-offset: 2px;
  }
  .pq-option--selected {
    background: var(--emerald-tint);
    border-color: var(--emerald-500);
    box-shadow: 0 0 0 1px var(--emerald-500), 0 0 24px var(--emerald-tint);
  }

  .pq-option__letter {
    flex-shrink: 0;
    width: 32px;
    height: 32px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    background: var(--bg-glass-strong);
    border: 1px solid var(--glass-border);
    font-family: var(--font-mono);
    font-size: 12px;
    font-weight: 600;
    color: var(--text-secondary);
  }
  .pq-option--selected .pq-option__letter {
    background: var(--emerald-500);
    color: var(--obsidian-900);
    border-color: var(--emerald-500);
  }
  .pq-option__label { flex: 1; }

  /* Intro chips */
  .pq-archetype-chip {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 12px 14px;
    background: var(--bg-glass);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-sm);
  }
  .pq-archetype-chip__name {
    font-size: 13px;
    font-weight: 600;
    color: var(--text-primary);
    letter-spacing: -0.01em;
  }
  .pq-archetype-chip__tag {
    font-size: 11px;
    color: var(--text-tertiary);
    font-style: italic;
  }

  /* Buttons */
  .pq-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    border-radius: 12px;
    padding: 12px 22px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    text-decoration: none;
    border: 1px solid transparent;
    transition: transform 140ms var(--ease-out-quart),
                box-shadow 160ms ease,
                background 160ms ease;
  }
  .pq-btn--primary {
    background: var(--emerald-500);
    color: var(--obsidian-900);
    box-shadow: 0 0 0 1px var(--cta-glow-ring), 0 0 28px var(--cta-glow-soft);
  }
  .pq-btn--primary:hover {
    transform: translateY(-1px);
    box-shadow: 0 0 0 1px var(--cta-glow-ring), 0 0 36px var(--cta-glow-strong);
  }
  .pq-btn--ghost {
    background: var(--bg-glass);
    color: var(--text-primary);
    border-color: var(--glass-border-strong);
  }
  .pq-btn--ghost:hover {
    background: var(--bg-glass-strong);
    border-color: var(--emerald-border-soft);
  }
  .pq-link {
    background: transparent;
    border: 0;
    color: var(--text-tertiary);
    font-size: 13px;
    cursor: pointer;
    text-decoration: underline;
    text-underline-offset: 3px;
  }
  .pq-link:hover { color: var(--text-primary); }

  /* Result */
  .pq-result-name {
    font-size: clamp(32px, 6vw, 48px);
    font-weight: 700;
    letter-spacing: -0.03em;
    margin: 0 0 6px;
    line-height: 1.05;
    color: var(--text-primary);
  }
  .pq-caret {
    display: inline-block;
    width: 3px;
    height: 1em;
    background: var(--emerald-500);
    margin-left: 4px;
    vertical-align: -0.18em;
    animation: pq-blink 900ms steps(2, end) infinite;
  }
  .pq-result-tagline {
    font-style: italic;
    color: var(--text-secondary);
    font-size: 16px;
    margin: 0;
  }

  .pq-pills {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-bottom: 8px;
  }
  .pq-pill {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 6px 12px;
    border-radius: var(--radius-full);
    background: var(--bg-glass);
    border: 1px solid var(--glass-border);
    font-size: 12px;
    animation: pq-pop-in 380ms var(--ease-spring-soft) both;
  }
  .pq-pill:nth-child(2) { animation-delay: 120ms; }
  .pq-pill__label {
    font-family: var(--font-mono);
    font-size: 10px;
    color: var(--text-tertiary);
    letter-spacing: 0.16em;
  }
  .pq-pill__value { color: var(--text-primary); font-weight: 600; }
  .pq-pill--primary {
    background: var(--emerald-tint);
    border-color: var(--emerald-500);
  }
  .pq-pill--primary .pq-pill__label { color: var(--emerald-500); }

  /* Score meters */
  .pq-meters {
    margin: 28px 0;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }
  .pq-meter__row {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: 6px;
    font-size: 11px;
    letter-spacing: 0.12em;
  }
  .pq-meter__label { color: var(--text-tertiary); }
  .pq-meter__label--primary { color: var(--emerald-500); }
  .pq-meter__value { color: var(--text-secondary); }
  .pq-meter__track {
    height: 8px;
    background: var(--bg-glass);
    border-radius: var(--radius-full);
    overflow: hidden;
    border: 1px solid var(--border-subtle);
  }
  .pq-meter__fill {
    height: 100%;
    width: 0;
    background: var(--mist-600);
    border-radius: var(--radius-full);
    animation: pq-meter-fill 700ms var(--ease-out-expo) forwards;
  }
  .pq-meter__fill--secondary {
    background: linear-gradient(90deg, var(--mist-500), var(--emerald-700));
  }
  .pq-meter__fill--primary {
    background: linear-gradient(90deg, var(--emerald-600), var(--emerald-500));
    box-shadow: 0 0 16px var(--emerald-500);
  }

  .pq-result-summary {
    color: var(--text-secondary);
    font-size: 16px;
    line-height: 1.65;
    margin: 0 0 24px;
  }

  .pq-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 18px;
    margin-bottom: 24px;
  }
  .pq-block {
    padding: 16px;
    background: var(--bg-glass);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-md);
  }
  .pq-list {
    margin: 0;
    padding: 0 0 0 16px;
    color: var(--text-secondary);
    font-size: 14px;
    line-height: 1.55;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .pq-tools { margin-bottom: 24px; }
  .pq-tools__row {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }
  .pq-tool-pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 10px 16px;
    border-radius: var(--radius-full);
    border: 1px solid var(--emerald-border-soft);
    color: var(--emerald-500);
    text-decoration: none;
    font-size: 13px;
    font-weight: 600;
    background: transparent;
    transition: background 160ms ease, border-color 160ms ease;
  }
  .pq-tool-pill:hover {
    background: var(--emerald-tint-soft);
    border-color: var(--emerald-500);
  }

  /* keyframes */
  @keyframes pq-fade-up {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes pq-slide-in {
    from { opacity: 0; transform: translateX(24px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes pq-slide-out {
    from { opacity: 1; transform: translateX(0); }
    to   { opacity: 0; transform: translateX(-24px); }
  }
  @keyframes pq-option-in {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes pq-pop-in {
    from { opacity: 0; transform: scale(0.85); }
    to   { opacity: 1; transform: scale(1); }
  }
  @keyframes pq-meter-fill {
    from { width: 0; }
    to   { width: var(--pq-fill, 0%); }
  }
  @keyframes pq-blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
  }

  @media (max-width: 540px) {
    .pq-grid { grid-template-columns: 1fr; }
    .pq-option { font-size: 14px; padding: 14px 16px; }
  }

  @media (prefers-reduced-motion: reduce) {
    .pq-fade-in,
    .pq-fieldset--entering,
    .pq-fieldset--leaving,
    .pq-option,
    .pq-pill,
    .pq-meter__fill { animation: none !important; }
    .pq-progress__fill { transition: none; }
    .pq-caret { animation: none; opacity: 0; }
  }
`;
