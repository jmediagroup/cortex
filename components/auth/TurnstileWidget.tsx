'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Cloudflare Turnstile widget for the auth forms.
 *
 * Renders nothing at all when `NEXT_PUBLIC_TURNSTILE_SITE_KEY` is unset, so
 * the forms behave exactly as before until Turnstile is provisioned. Once the
 * key is set the widget mounts, solves invisibly for most visitors, and hands
 * the resulting token up via `onToken` for the form to send to Supabase as
 * `options.captchaToken`.
 */

declare global {
  interface Window {
    turnstile?: {
      render: (
        el: HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          'error-callback'?: () => void;
          'expired-callback'?: () => void;
          theme?: 'light' | 'dark' | 'auto';
          appearance?: 'always' | 'execute' | 'interaction-only';
        },
      ) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId?: string) => void;
    };
  }
}

const SCRIPT_SRC =
  'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
const SCRIPT_ID = 'cf-turnstile-script';

export function turnstileSiteKey(): string {
  return process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '';
}

/** True when Turnstile is provisioned and the forms should expect a token. */
export function isTurnstileEnabled(): boolean {
  return Boolean(turnstileSiteKey());
}

/** Loads the Turnstile script once per page, shared across mounts. */
function loadTurnstileScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (window.turnstile) return Promise.resolve();

  const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
  if (existing) {
    return new Promise((resolve, reject) => {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('turnstile script failed')));
    });
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.src = SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('turnstile script failed'));
    document.head.appendChild(script);
  });
}

interface Props {
  /** Called with a fresh token, or `null` when the token expires or errors. */
  onToken: (token: string | null) => void;
  /**
   * Bumping this resets the widget. Turnstile tokens are single-use, so a form
   * that failed and is about to retry needs a new one.
   */
  resetSignal?: number;
}

export function TurnstileWidget({ onToken, resetSignal = 0 }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | null>(null);
  const onTokenRef = useRef(onToken);
  const [failed, setFailed] = useState(false);
  const siteKey = turnstileSiteKey();

  // Keep the latest callback without re-rendering the widget on every keystroke.
  useEffect(() => {
    onTokenRef.current = onToken;
  }, [onToken]);

  const emit = useCallback((token: string | null) => {
    onTokenRef.current(token);
  }, []);

  useEffect(() => {
    if (!siteKey || !containerRef.current) return;
    let cancelled = false;

    loadTurnstileScript()
      .then(() => {
        if (cancelled || !containerRef.current || !window.turnstile) return;
        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          callback: (token: string) => emit(token),
          'error-callback': () => {
            setFailed(true);
            emit(null);
          },
          'expired-callback': () => emit(null),
          theme: 'light',
        });
      })
      .catch(() => {
        if (!cancelled) {
          setFailed(true);
          emit(null);
        }
      });

    return () => {
      cancelled = true;
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [siteKey, emit]);

  // Single-use tokens: reset the widget whenever the form asks for a new one.
  useEffect(() => {
    if (resetSignal === 0) return;
    if (widgetIdRef.current && window.turnstile) {
      window.turnstile.reset(widgetIdRef.current);
      emit(null);
    }
  }, [resetSignal, emit]);

  if (!siteKey) return null;

  return (
    <div>
      <div ref={containerRef} />
      {failed && (
        <p style={{ fontSize: 12, color: 'var(--gray-500)', margin: '8px 0 0' }}>
          Couldn&apos;t load the security check. Disable any ad blocker for this page
          and refresh.
        </p>
      )}
    </div>
  );
}
