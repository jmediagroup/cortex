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
        body: JSON.stringify({ email, source }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus('error');
        setMessage(json.error || 'Could not subscribe. Please try again.');
        return;
      }
      setStatus('success');
      setMessage(json.message || 'Check your inbox to confirm your subscription.');
      setEmail('');
    } catch {
      setStatus('error');
      setMessage('Network error. Please try again.');
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
    >
      <label
        className="eyebrow"
        style={{ color: 'var(--text-tertiary)', fontSize: 11 }}
        htmlFor="outlook-email"
      >
        DAILY OUTLOOK BY EMAIL
      </label>
      <p
        style={{
          margin: 0,
          fontSize: 12,
          lineHeight: 1.5,
          color: 'var(--text-tertiary)',
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
          border: '1px solid var(--border-default)',
          borderRadius: 10,
          background: 'var(--bg-glass-strong)',
          color: 'var(--text-primary)',
          fontSize: 13,
          fontFamily: 'inherit',
          outline: 'none',
        }}
      />
      <button
        type="submit"
        disabled={status === 'submitting'}
        style={{
          padding: '10px 14px',
          background: 'var(--emerald-500)',
          color: 'var(--text-inverse)',
          border: 'none',
          borderRadius: 10,
          fontWeight: 700,
          fontSize: 13,
          cursor: status === 'submitting' ? 'wait' : 'pointer',
          boxShadow: '0 0 0 1px var(--cta-glow-ring), 0 0 16px var(--cta-glow-soft)',
        }}
      >
        {status === 'submitting' ? 'Sending…' : 'Subscribe'}
      </button>
      {message && (
        <p
          role={status === 'error' ? 'alert' : 'status'}
          style={{
            margin: 0,
            fontSize: 12,
            color: status === 'error' ? '#f87171' : 'var(--emerald-500)',
          }}
        >
          {message}
        </p>
      )}
    </form>
  );
}
