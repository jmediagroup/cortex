'use client';

import { useState } from 'react';

type Status = 'idle' | 'submitting' | 'success' | 'error';

export function OutlookSubscribeForm({ source = 'thinking' }: { source?: string }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus('submitting');
    setMessage(null);

    try {
      const res = await fetch('/api/outlook/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), source }),
      });
      const json = (await res.json().catch(() => ({}))) as {
        error?: string;
        message?: string;
        success?: boolean;
      };
      if (!res.ok || json.success === false) {
        setStatus('error');
        setMessage(json.error || 'Could not subscribe. Please try again.');
        return;
      }
      setStatus('success');
      setMessage(json.message || 'Check your inbox to confirm your subscription.');
      setEmail('');
    } catch {
      setStatus('error');
      setMessage('Network error. Please check your connection and try again.');
    }
  }

  // Label + copy use currentColor so the form reads correctly both on the
  // white sidebar card (navy ink) and inside the navy email band (white text).
  if (status === 'success') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <span
          className="mgm-eyebrow"
          style={{ color: 'currentColor', opacity: 0.7 }}
        >
          DAILY OUTLOOK BY EMAIL
        </span>
        <p
          role="status"
          aria-live="polite"
          style={{
            margin: 0,
            fontSize: 13,
            lineHeight: 1.5,
            color: 'currentColor',
          }}
        >
          {message}
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
    >
      <label
        className="mgm-eyebrow"
        style={{ color: 'currentColor', opacity: 0.7 }}
        htmlFor="outlook-email"
      >
        DAILY OUTLOOK BY EMAIL
      </label>
      <p
        style={{
          margin: 0,
          fontSize: 12,
          lineHeight: 1.5,
          color: 'currentColor',
          opacity: 0.7,
        }}
      >
        Free. Weekday mornings + a Sunday recap. Unsubscribe in one click.
      </p>
      <input
        id="outlook-email"
        type="email"
        required
        autoComplete="email"
        placeholder="you@domain.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={status === 'submitting'}
        style={{
          padding: '10px 12px',
          border: '1px solid var(--gray-300)',
          borderRadius: 'var(--radius-sm)',
          background: 'var(--white)',
          color: 'var(--text-primary)',
          fontSize: 13,
          fontFamily: 'inherit',
          outline: 'none',
        }}
      />
      <button
        type="submit"
        className="mgm-btn mgm-btn--primary mgm-btn--md"
        disabled={status === 'submitting'}
        style={{ width: '100%', cursor: status === 'submitting' ? 'wait' : 'pointer' }}
      >
        {status === 'submitting' ? 'Sending…' : 'Subscribe'}
      </button>
      {message && (
        <p
          role={status === 'error' ? 'alert' : 'status'}
          style={{
            margin: 0,
            fontSize: 12,
            color: status === 'error' ? 'var(--alert-red)' : 'currentColor',
          }}
        >
          {message}
        </p>
      )}
    </form>
  );
}
