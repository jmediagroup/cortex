'use client';

import { useMemo } from 'react';
import AppLibrary from '@/components/dashboard/AppLibrary';
import type { Tier } from '@/lib/access-control';

type Props = {
  userName?: string;
  userTier?: Tier;
  appOrder?: string[] | null;
};

export default function DashboardHome({ userName, userTier = 'free', appOrder }: Props) {
  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 5) return 'Good evening';
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  }, []);

  return (
    <div
      style={{
        maxWidth: 1200,
        margin: '0 auto',
        padding:
          'clamp(20px, 4vw, 32px) clamp(16px, 4vw, 24px) clamp(32px, 6vw, 48px)',
      }}
    >
      {/* Greeting */}
      <header style={{ marginBottom: 28 }}>
        <div
          className="eyebrow"
          style={{ color: 'var(--text-tertiary)', marginBottom: 8 }}
        >
          {greeting.toUpperCase()}
        </div>
        <h1
          style={{
            fontSize: 'clamp(24px, 6vw, 28px)',
            fontWeight: 700,
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em',
            margin: 0,
            lineHeight: 1.15,
          }}
        >
          {userName ? `Welcome back, ${userName}.` : 'Welcome back.'}
        </h1>
      </header>

      {/* App library */}
      <section>
        <div style={{ marginBottom: 16 }}>
          <div
            className="eyebrow"
            style={{ color: 'var(--gray-500)', marginBottom: 6 }}
          >
            MUTANT TOOLKIT
          </div>
          <h2
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: 'var(--navy)',
              margin: 0,
              letterSpacing: '-0.01em',
            }}
          >
            Open a tool.
          </h2>
        </div>
        <AppLibrary userTier={userTier} appOrder={appOrder ?? null} />
      </section>
    </div>
  );
}
