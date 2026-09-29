'use client';

import { useCallback, useEffect, useRef, type MouseEvent, type ReactNode } from 'react';
import { captureSessionAttribution, isSignedIn, trackEvent } from '@/lib/analytics';
import { COMPLETION_SETTLE_MS, timeAfterResultBucket } from '@/lib/tool-funnel';

type Options = {
  /** The calculator started from a saved or shared scenario. */
  fromScenario?: boolean;
};

/**
 * Funnel tracking for one tool on the page (docs/monetization/HANDOFF.md §6):
 *
 * - `tool_viewed` once when the tool mounts, with the session's source.
 * - `tool_calculation_completed` once: after `noteInteraction()` calls stop
 *   for COMPLETION_SETTLE_MS (calculators recompute live, so the new result is
 *   already on screen), or straight away from `markCompleted()` for tools with
 *   an explicit result step (the quiz, What's Your Why).
 * - `result_exit_intent` once, if the visitor leaves after completing.
 *
 * Payloads carry the tool id, booleans and buckets only — never the inputs.
 */
export function useToolFunnel(toolId: string, { fromScenario = false }: Options = {}) {
  const viewed = useRef(false);
  const completedAt = useRef<number | null>(null);
  const exitSent = useRef(false);
  const settleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scenario = useRef(fromScenario);

  useEffect(() => {
    scenario.current = fromScenario;
  }, [fromScenario]);

  const markCompleted = useCallback(() => {
    if (completedAt.current !== null) return;
    completedAt.current = Date.now();
    void trackEvent('tool_calculation_completed', {
      tool_id: toolId,
      is_logged_in: isSignedIn(),
      from_scenario: scenario.current,
    });
  }, [toolId]);

  const noteInteraction = useCallback(() => {
    if (completedAt.current !== null) return;
    if (settleTimer.current) clearTimeout(settleTimer.current);
    settleTimer.current = setTimeout(markCompleted, COMPLETION_SETTLE_MS);
  }, [markCompleted]);

  useEffect(() => {
    if (!viewed.current) {
      viewed.current = true;
      void trackEvent('tool_viewed', {
        tool_id: toolId,
        is_landing_page: window.location.pathname.startsWith('/calculators/'),
        ...captureSessionAttribution(),
      });
    }

    const sendExit = () => {
      if (completedAt.current === null || exitSent.current) return;
      exitSent.current = true;
      // Sent immediately: the page may be going away.
      void trackEvent(
        'result_exit_intent',
        { tool_id: toolId, time_after_result: timeAfterResultBucket(Date.now() - completedAt.current) },
        true,
      );
    };

    window.addEventListener('pagehide', sendExit);
    return () => {
      window.removeEventListener('pagehide', sendExit);
      // Leaving before the inputs settled (e.g. an "Upgrade" click that
      // navigates away) is not a completion.
      if (settleTimer.current) clearTimeout(settleTimer.current);
      sendExit();
    };
  }, [toolId]);

  return { noteInteraction, markCompleted };
}

type Props = Options & {
  toolId: string;
  children: ReactNode;
};

/**
 * Wraps a live calculator and treats any edit inside it — typing, a slider, a
 * select, a checkbox, an option button — as an interaction. Buttons inside a
 * `[data-funnel-ignore]` element don't count. Renders no box of its own
 * (`display: contents`), so layout is unchanged.
 */
export function ToolFunnel({ toolId, fromScenario, children }: Props) {
  const { noteInteraction } = useToolFunnel(toolId, { fromScenario });

  const onClick = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      const button = (event.target as Element | null)?.closest?.('button');
      if (button && !button.disabled && !button.closest('[data-funnel-ignore]')) noteInteraction();
    },
    [noteInteraction],
  );

  return (
    <div style={{ display: 'contents' }} onInput={noteInteraction} onChange={noteInteraction} onClick={onClick}>
      {children}
    </div>
  );
}
