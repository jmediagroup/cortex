'use client';

import { useCallback, useMemo, useState } from 'react';
import Link from 'next/link';
import { createBrowserClient } from '@/lib/supabase/client';
import { WHY_QUESTIONS } from '@/lib/why/questions';
import type { WhySummary } from '@/lib/why/synthesis';

type Stage = 'intro' | 'reflect' | 'loading' | 'result' | 'error';

interface Props {
  /** Whether a session exists — gates the AI generation step. */
  isLoggedIn: boolean;
}

export default function WhatsYourWhy({ isLoggedIn }: Props) {
  const [stage, setStage] = useState<Stage>('intro');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [summary, setSummary] = useState<WhySummary | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const total = WHY_QUESTIONS.length;
  const question = WHY_QUESTIONS[currentIndex];
  const isLast = currentIndex === total - 1;

  const answeredCount = useMemo(
    () => Object.values(answers).filter((a) => a.trim().length > 0).length,
    [answers],
  );

  const setAnswer = useCallback(
    (value: string) => {
      setAnswers((prev) => ({ ...prev, [question.id]: value }));
    },
    [question.id],
  );

  const start = useCallback(() => {
    setAnswers({});
    setSummary(null);
    setCurrentIndex(0);
    setStage('reflect');
  }, []);

  const next = useCallback(() => {
    setCurrentIndex((i) => Math.min(i + 1, total - 1));
  }, [total]);

  const back = useCallback(() => {
    setCurrentIndex((i) => Math.max(i - 1, 0));
  }, []);

  const generate = useCallback(async () => {
    setStage('loading');
    setErrorMessage('');
    try {
      const supabase = createBrowserClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) {
        setErrorMessage('Please sign in to reveal your why.');
        setStage('error');
        return;
      }

      const res = await fetch('/api/why', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ answers }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(
          data?.message || 'We could not generate your reflection. Please try again.',
        );
        setStage('error');
        return;
      }

      setSummary(data.reflection.summary as WhySummary);
      setStage('result');
    } catch {
      setErrorMessage('Something went wrong. Please try again.');
      setStage('error');
    }
  }, [answers]);

  return (
    <div style={shellStyle}>
      <style>{whyCss}</style>

      {stage === 'intro' && <Intro onStart={start} />}

      {stage === 'reflect' && (
        <ReflectPanel
          index={currentIndex}
          total={total}
          prompt={question.prompt}
          subtext={question.subtext}
          value={answers[question.id] ?? ''}
          isLast={isLast}
          isLoggedIn={isLoggedIn}
          canGenerate={answeredCount >= 3}
          onChange={setAnswer}
          onBack={back}
          onNext={next}
          onGenerate={generate}
        />
      )}

      {stage === 'loading' && <LoadingPanel />}

      {stage === 'result' && summary && (
        <ResultPanel summary={summary} onRestart={start} />
      )}

      {stage === 'error' && (
        <ErrorPanel
          message={errorMessage}
          isLoggedIn={isLoggedIn}
          onRetry={generate}
          onBack={() => setStage('reflect')}
        />
      )}
    </div>
  );
}

/* ---------------- Intro ---------------- */

function Intro({ onStart }: { onStart: () => void }) {
  return (
    <section className="why-card why-fade" aria-labelledby="why-intro-title">
      <div className="eyebrow" style={{ color: 'var(--navy)', marginBottom: 12 }}>
        ● EIGHT QUESTIONS · A FEW MINUTES
      </div>
      <h2 id="why-intro-title" className="why-h2">
        Before the strategy, the why.
      </h2>
      <p className="why-lead">
        Budgets, portfolios, and plans fall apart without a clear reason
        underneath them. These eight questions surface yours — what actually
        drives your decisions, fears, and goals around money. Answer honestly;
        there are no wrong answers, and no one else sees them.
      </p>
      <p className="why-lead" style={{ marginTop: 14 }}>
        When you&rsquo;re done, we&rsquo;ll reflect it all back to you as a
        single, personal read on your relationship with money.
      </p>
      <button type="button" className="why-btn why-btn-primary" onClick={onStart}>
        Begin reflection
      </button>
    </section>
  );
}

/* ---------------- Reflect (stepper) ---------------- */

function ReflectPanel({
  index,
  total,
  prompt,
  subtext,
  value,
  isLast,
  isLoggedIn,
  canGenerate,
  onChange,
  onBack,
  onNext,
  onGenerate,
}: {
  index: number;
  total: number;
  prompt: string;
  subtext: string;
  value: string;
  isLast: boolean;
  isLoggedIn: boolean;
  canGenerate: boolean;
  onChange: (v: string) => void;
  onBack: () => void;
  onNext: () => void;
  onGenerate: () => void;
}) {
  const pct = Math.round(((index + 1) / total) * 100);
  return (
    <section className="why-card why-fade" aria-labelledby="why-q-title">
      <div className="why-progress-row">
        <span className="eyebrow" style={{ color: 'var(--text-tertiary)' }}>
          Question {index + 1} of {total}
        </span>
        <span className="why-progress-pct">{pct}%</span>
      </div>
      <div className="why-progress-track" aria-hidden="true">
        <div className="why-progress-fill" style={{ width: `${pct}%` }} />
      </div>

      <h2 id="why-q-title" className="why-q-prompt">
        {prompt}
      </h2>
      <p className="why-q-sub">{subtext}</p>

      <textarea
        className="why-textarea"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Take your time. Write as much or as little as feels true."
        rows={6}
        aria-label={prompt}
        autoFocus
      />

      <div className="why-actions">
        <button
          type="button"
          className="why-btn why-btn-ghost"
          onClick={onBack}
          disabled={index === 0}
        >
          Back
        </button>

        {!isLast ? (
          <button type="button" className="why-btn why-btn-primary" onClick={onNext}>
            Next
          </button>
        ) : isLoggedIn ? (
          <button
            type="button"
            className="why-btn why-btn-primary"
            onClick={onGenerate}
            disabled={!canGenerate}
            title={
              canGenerate
                ? undefined
                : 'Answer at least three questions to reveal your why.'
            }
          >
            Reveal your why
          </button>
        ) : (
          <Link href="/signup" className="why-btn why-btn-primary">
            Sign in to reveal your why
          </Link>
        )}
      </div>

      {isLast && !isLoggedIn && (
        <p className="why-signin-note">
          Your reflection is generated with a free account.{' '}
          <Link href="/login" className="why-inline-link">
            Already have one? Sign in
          </Link>
          .
        </p>
      )}
    </section>
  );
}

/* ---------------- Loading ---------------- */

function LoadingPanel() {
  return (
    <section className="why-card why-fade" aria-live="polite">
      <div className="why-pulse" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <h2 className="why-h2" style={{ fontSize: 'clamp(20px, 4vw, 26px)' }}>
        Reading between your lines&hellip;
      </h2>
      <p className="why-lead">
        We&rsquo;re reflecting on everything you shared to find the thread that
        connects it. This takes a moment.
      </p>
    </section>
  );
}

/* ---------------- Result ---------------- */

function ResultPanel({
  summary,
  onRestart,
}: {
  summary: WhySummary;
  onRestart: () => void;
}) {
  return (
    <section className="why-fade" aria-labelledby="why-result-title">
      <div className="why-result-hero">
        <div className="eyebrow" style={{ color: 'var(--navy)', marginBottom: 12 }}>
          YOUR WHY
        </div>
        <h2 id="why-result-title" className="why-headline">
          {summary.headline}
        </h2>
        <p className="why-mirror">{summary.mirror}</p>
      </div>

      {summary.themes?.length > 0 && (
        <div className="why-themes">
          {summary.themes.map((theme, i) => (
            <div key={i} className="why-theme-card">
              <div className="why-theme-title">{theme.title}</div>
              <p className="why-theme-insight">{theme.insight}</p>
            </div>
          ))}
        </div>
      )}

      <div className="why-tension-card">
        <div className="eyebrow" style={{ color: 'var(--navy)', marginBottom: 8 }}>
          THE TENSION
        </div>
        <p className="why-tension-text">{summary.tension}</p>
      </div>

      <div className="why-nudge-card">
        <div className="eyebrow" style={{ color: 'var(--orange)', marginBottom: 8 }}>
          ONE SMALL NUDGE
        </div>
        <p className="why-nudge-text">{summary.nudge}</p>
      </div>

      <div className="why-actions why-actions-result">
        <button type="button" className="why-btn why-btn-ghost" onClick={onRestart}>
          Reflect again
        </button>
        <Link href="/apps" className="why-btn why-btn-primary">
          Explore the tools
        </Link>
      </div>
    </section>
  );
}

/* ---------------- Error ---------------- */

function ErrorPanel({
  message,
  isLoggedIn,
  onRetry,
  onBack,
}: {
  message: string;
  isLoggedIn: boolean;
  onRetry: () => void;
  onBack: () => void;
}) {
  return (
    <section className="why-card why-fade" role="alert">
      <h2 className="why-h2" style={{ fontSize: 'clamp(20px, 4vw, 26px)' }}>
        Not quite yet.
      </h2>
      <p className="why-lead">{message}</p>
      <div className="why-actions">
        <button type="button" className="why-btn why-btn-ghost" onClick={onBack}>
          Back to my answers
        </button>
        {isLoggedIn ? (
          <button type="button" className="why-btn why-btn-primary" onClick={onRetry}>
            Try again
          </button>
        ) : (
          <Link href="/signup" className="why-btn why-btn-primary">
            Create free account
          </Link>
        )}
      </div>
    </section>
  );
}

/* ---------------- Styles ---------------- */

const shellStyle = {
  maxWidth: 720,
  margin: '0 auto',
} as const;

const whyCss = `
.why-card {
  background: var(--bg-glass, #fff);
  border: 1px solid var(--border-default, rgba(0,0,0,0.08));
  border-radius: var(--radius-xl, 20px);
  padding: clamp(24px, 5vw, 40px);
  box-shadow: var(--shadow-card, 0 1px 2px rgba(0,0,0,0.04));
}
.why-fade { animation: whyFade 0.35s ease both; }
@keyframes whyFade {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}
.why-h2 {
  font-size: clamp(24px, 5vw, 34px);
  font-weight: 700;
  letter-spacing: -0.025em;
  line-height: 1.15;
  color: var(--text-primary);
  margin: 0 0 14px;
}
.why-lead {
  font-size: clamp(15px, 2.4vw, 17px);
  color: var(--text-secondary);
  line-height: 1.6;
  margin: 0;
}
.why-progress-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}
.why-progress-pct {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-tertiary);
}
.why-progress-track {
  height: 4px;
  border-radius: 9999px;
  background: var(--border-subtle, rgba(0,0,0,0.08));
  overflow: hidden;
  margin-bottom: 28px;
}
.why-progress-fill {
  height: 100%;
  border-radius: 9999px;
  background: var(--navy, #0A4A73);
  transition: width 0.35s ease;
}
.why-q-prompt {
  font-size: clamp(20px, 3.6vw, 26px);
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.25;
  color: var(--text-primary);
  margin: 0 0 10px;
}
.why-q-sub {
  font-size: 14px;
  color: var(--text-tertiary);
  line-height: 1.55;
  margin: 0 0 20px;
}
.why-textarea {
  width: 100%;
  box-sizing: border-box;
  resize: vertical;
  font: inherit;
  font-size: 15px;
  line-height: 1.6;
  color: var(--text-primary);
  background: var(--bg-input, #fff);
  border: 1px solid var(--border-default, rgba(0,0,0,0.12));
  border-radius: var(--radius-md, 12px);
  padding: 14px 16px;
  outline: none;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}
.why-textarea:focus {
  border-color: var(--navy, #0A4A73);
  box-shadow: 0 0 0 3px rgba(10,74,115,0.12);
}
.why-textarea::placeholder { color: var(--text-muted); }
.why-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 24px;
}
.why-actions-result { justify-content: center; margin-top: 32px; }
.why-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 22px;
  border-radius: var(--radius-sm, 10px);
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  border: 1px solid transparent;
  transition: transform 0.1s ease, opacity 0.15s ease, background 0.15s ease;
}
.why-btn:active { transform: translateY(1px); }
.why-btn:disabled { opacity: 0.45; cursor: not-allowed; }
.why-btn-primary {
  background: var(--navy, #0A4A73);
  color: #fff;
}
.why-btn-ghost {
  background: transparent;
  color: var(--text-secondary);
  border-color: var(--border-default, rgba(0,0,0,0.14));
}
.why-signin-note {
  margin: 16px 0 0;
  font-size: 13px;
  color: var(--text-tertiary);
  line-height: 1.55;
}
.why-inline-link { color: var(--navy, #0A4A73); font-weight: 600; }
.why-pulse {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
}
.why-pulse span {
  width: 10px;
  height: 10px;
  border-radius: 9999px;
  background: var(--navy, #0A4A73);
  animation: whyPulse 1.1s ease-in-out infinite;
}
.why-pulse span:nth-child(2) { animation-delay: 0.18s; }
.why-pulse span:nth-child(3) { animation-delay: 0.36s; }
@keyframes whyPulse {
  0%, 100% { opacity: 0.25; transform: scale(0.85); }
  50% { opacity: 1; transform: scale(1); }
}
.why-result-hero {
  background: var(--bg-section, #F7F9FB);
  border: 1px solid var(--border-default, rgba(0,0,0,0.08));
  border-left: 3px solid var(--navy, #0A4A73);
  border-radius: var(--radius-xl, 20px);
  padding: clamp(24px, 5vw, 40px);
  margin-bottom: 20px;
}
.why-headline {
  font-size: clamp(24px, 5vw, 34px);
  font-weight: 700;
  letter-spacing: -0.025em;
  line-height: 1.18;
  color: var(--text-primary);
  margin: 0 0 16px;
}
.why-mirror {
  font-size: clamp(16px, 2.6vw, 18px);
  color: var(--text-secondary);
  line-height: 1.6;
  margin: 0;
}
.why-themes {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 14px;
  margin-bottom: 20px;
}
.why-theme-card {
  background: var(--bg-glass, #fff);
  border: 1px solid var(--border-default, rgba(0,0,0,0.08));
  border-radius: var(--radius-md, 12px);
  padding: 20px;
}
.why-theme-title {
  font-size: 15px;
  font-weight: 700;
  letter-spacing: -0.01em;
  color: var(--text-primary);
  margin-bottom: 8px;
}
.why-theme-insight {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.55;
  margin: 0;
}
.why-tension-card,
.why-nudge-card {
  border-radius: var(--radius-md, 12px);
  padding: 22px 24px;
  margin-bottom: 20px;
}
.why-tension-card {
  background: var(--bg-section, #F7F9FB);
  border: 1px solid var(--border-default, rgba(0,0,0,0.08));
}
.why-nudge-card {
  background: var(--orange-tint-soft, rgba(230,126,34,0.08));
  border: 1px solid var(--orange-border-soft, rgba(230,126,34,0.24));
}
.why-tension-text,
.why-nudge-text {
  font-size: 15px;
  color: var(--text-primary);
  line-height: 1.6;
  margin: 0;
}
`;
