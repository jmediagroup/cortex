'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { X, ArrowRight, ArrowLeft, Sparkles, Check } from 'lucide-react';
import { createBrowserClient, type OnboardingAnswers } from '@/lib/supabase/client';
import { trackEvent } from '@/lib/analytics';
import { getTopRecommendedApp } from '@/lib/onboarding-recommendations';

interface QuizStep {
  key: keyof OnboardingAnswers;
  question: string;
  options: string[];
}

const STEPS: QuizStep[] = [
  {
    key: 'describes_you',
    question: 'What best describes you?',
    options: ['Business owner', 'Employee', 'Self-employed', 'Student', 'Retired'],
  },
  {
    key: 'financial_focus',
    question: 'What is your biggest financial focus?',
    options: [
      'Building wealth',
      'Getting out of debt',
      'Planning retirement',
      'Buying vs renting',
      'Optimizing taxes',
    ],
  },
  {
    key: 'investing_status',
    question: 'Are you investing yet?',
    options: ['Yes actively', 'Just starting', 'Not yet'],
  },
  {
    key: 'own_or_rent',
    question: 'Do you own or rent?',
    options: ['Own', 'Rent', 'Looking to buy'],
  },
  {
    key: 'tool_familiarity',
    question: 'How familiar are you with financial tools?',
    options: ['Total beginner', 'Some experience', 'Pretty savvy'],
  },
];

interface OnboardingQuizProps {
  userId: string;
  onComplete: (answers: OnboardingAnswers) => void;
  onSkip: () => void;
}

export default function OnboardingQuiz({ userId, onComplete, onSkip }: OnboardingQuizProps) {
  const router = useRouter();
  const supabase = createBrowserClient();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<OnboardingAnswers>>({});
  const [saving, setSaving] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const totalSteps = STEPS.length;
  const isLastStep = currentStep === totalSteps - 1;
  const currentAnswer = answers[STEPS[currentStep]?.key];

  const selectOption = useCallback(
    (option: string) => {
      const step = STEPS[currentStep];
      setAnswers((prev) => ({ ...prev, [step.key]: option }));

      trackEvent('onboarding_step_completed', {
        step_number: String(currentStep + 1),
        step_key: step.key,
        answer: option,
      });
    },
    [currentStep]
  );

  const goNext = useCallback(() => {
    if (isLastStep) {
      handleComplete();
    } else {
      setCurrentStep((s) => s + 1);
    }
  }, [isLastStep, answers]);

  const goBack = useCallback(() => {
    setCurrentStep((s) => Math.max(0, s - 1));
  }, []);

  const handleComplete = async () => {
    const finalAnswers = answers as OnboardingAnswers;
    setSaving(true);

    try {
      await (supabase
        .from('users')
        .update as any)({
          has_completed_onboarding: true,
          onboarding_answers: finalAnswers,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      trackEvent('onboarding_completed', {
        describes_you: finalAnswers.describes_you,
        financial_focus: finalAnswers.financial_focus,
        investing_status: finalAnswers.investing_status,
        own_or_rent: finalAnswers.own_or_rent,
        tool_familiarity: finalAnswers.tool_familiarity,
      }, true);

      setShowResult(true);
    } catch {
      // Still show result even if save fails — we'll retry on next load
      setShowResult(true);
    } finally {
      setSaving(false);
    }
  };

  const handleSkip = async () => {
    await (supabase
      .from('users')
      .update as any)({
        has_completed_onboarding: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    trackEvent('onboarding_skipped', {}, true);
    onSkip();
  };

  const handleStartRecommended = () => {
    const finalAnswers = answers as OnboardingAnswers;
    const recommended = getTopRecommendedApp(finalAnswers);
    onComplete(finalAnswers);
    router.push(`/apps/${recommended.id}`);
  };

  const handleGoToDashboard = () => {
    onComplete(answers as OnboardingAnswers);
  };

  // Result screen after completing quiz
  if (showResult) {
    const finalAnswers = answers as OnboardingAnswers;
    const recommended = getTopRecommendedApp(finalAnswers);

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        <div className="relative w-full max-w-lg rounded-[var(--radius-2xl)] bg-[var(--surface-primary)] p-8 shadow-xl md:p-10">
          {/* Success icon */}
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-positive-light)]">
            <Check size={32} className="text-[var(--color-positive)]" />
          </div>

          <h2 className="mb-2 text-center text-2xl font-bold tracking-tight text-[var(--text-primary)]">
            You&apos;re all set!
          </h2>
          <p className="mb-8 text-center text-sm text-[var(--text-secondary)]">
            We&apos;ve personalized your dashboard based on your answers. Your top tools are front and center.
          </p>

          {/* CTA */}
          <button
            onClick={handleStartRecommended}
            className="mb-3 flex w-full items-center justify-center gap-2 rounded-[var(--radius-lg)] bg-[var(--color-accent)] px-6 py-3.5 text-sm font-bold text-white transition-all hover:opacity-90 active:scale-[0.98]"
          >
            <Sparkles size={16} />
            Start with {recommended.name}
          </button>
          <button
            onClick={handleGoToDashboard}
            className="w-full rounded-[var(--radius-lg)] px-6 py-3 text-sm font-semibold text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-tertiary)] hover:text-[var(--text-primary)]"
          >
            Go to dashboard
          </button>
        </div>
      </div>
    );
  }

  const step = STEPS[currentStep];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative w-full max-w-lg rounded-[var(--radius-2xl)] bg-[var(--surface-primary)] shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border-primary)] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-accent-light)]">
              <Sparkles size={16} className="text-[var(--color-accent)]" />
            </div>
            <span className="text-sm font-semibold text-[var(--text-primary)]">Welcome to Cortex</span>
          </div>
          <button
            onClick={handleSkip}
            className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--text-tertiary)] transition-colors hover:bg-[var(--surface-tertiary)] hover:text-[var(--text-primary)]"
            aria-label="Skip onboarding"
          >
            <X size={18} />
          </button>
        </div>

        {/* Progress bar */}
        <div className="px-6 pt-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-[var(--text-tertiary)]">
              Step {currentStep + 1} of {totalSteps}
            </span>
            <span className="text-xs font-medium text-[var(--text-tertiary)]">
              {Math.round(((currentStep + 1) / totalSteps) * 100)}%
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--surface-tertiary)]">
            <div
              className="h-full rounded-full bg-[var(--color-accent)] transition-all duration-500 ease-out"
              style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="px-6 pt-6 pb-2">
          <h2 className="text-xl font-bold tracking-tight text-[var(--text-primary)] md:text-2xl">
            {step.question}
          </h2>
        </div>

        {/* Options */}
        <div className="flex flex-col gap-2.5 px-6 py-4">
          {step.options.map((option) => {
            const isSelected = currentAnswer === option;
            return (
              <button
                key={option}
                onClick={() => selectOption(option)}
                className={`flex w-full items-center rounded-[var(--radius-lg)] border-2 px-4 py-3.5 text-left text-sm font-medium transition-all ${
                  isSelected
                    ? 'border-[var(--color-accent)] bg-[var(--color-accent-light)] text-[var(--color-accent)]'
                    : 'border-[var(--border-primary)] bg-[var(--surface-primary)] text-[var(--text-primary)] hover:border-[var(--color-accent)]/40 hover:bg-[var(--surface-secondary)]'
                }`}
              >
                <span
                  className={`mr-3 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                    isSelected
                      ? 'border-[var(--color-accent)] bg-[var(--color-accent)]'
                      : 'border-[var(--border-primary)]'
                  }`}
                >
                  {isSelected && <Check size={12} className="text-white" />}
                </span>
                {option}
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-[var(--border-primary)] px-6 py-4">
          <button
            onClick={currentStep === 0 ? handleSkip : goBack}
            className="flex items-center gap-1.5 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
          >
            {currentStep === 0 ? (
              'Skip'
            ) : (
              <>
                <ArrowLeft size={14} />
                Back
              </>
            )}
          </button>
          <button
            onClick={goNext}
            disabled={!currentAnswer || saving}
            className="flex items-center gap-1.5 rounded-[var(--radius-lg)] bg-[var(--color-accent)] px-5 py-2.5 text-sm font-bold text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {saving ? (
              'Saving...'
            ) : isLastStep ? (
              'Finish'
            ) : (
              <>
                Next
                <ArrowRight size={14} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
