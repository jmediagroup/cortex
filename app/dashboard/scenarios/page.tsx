'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Bookmark, ArrowLeft, Trash2, Play, Loader2, Calendar, Wrench } from 'lucide-react';
import { createBrowserClient } from '@/lib/supabase/client';
import type { Scenario } from '@/lib/useScenarios';

type SessionUser = { id: string; email: string | null };

const TOOL_PATHS: Record<string, string> = {
  budget: '/apps/budget',
  'car-affordability': '/apps/car-affordability',
  'coast-fire': '/apps/coast-fire',
  'compound-interest': '/apps/compound-interest',
  'debt-paydown': '/apps/debt-paydown',
  'geographic-arbitrage': '/apps/geographic-arbitrage',
  'index-fund-visualizer': '/apps/index-fund-visualizer',
  'net-worth': '/apps/net-worth',
  'rent-vs-buy': '/apps/rent-vs-buy',
  'retirement-strategy': '/apps/retirement-strategy',
  's-corp-investment': '/apps/s-corp-investment',
  's-corp-optimizer': '/apps/s-corp-optimizer',
};

export default function ScenariosPage() {
  const router = useRouter();
  const supabase = createBrowserClient();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<SessionUser | null>(null);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }
      setUser({ id: session.user.id, email: session.user.email ?? null });

      const res = await fetch('/api/scenarios', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setScenarios(data.scenarios);
      }
      setLoading(false);
    })();
  }, [router, supabase]);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) return;

    const res = await fetch(`/api/scenarios?id=${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${session.access_token}` },
    });

    if (res.ok) setScenarios((prev) => prev.filter((s) => s.id !== id));
    setDeletingId(null);
  };

  const handleLoad = (scenario: Scenario) => {
    const path = TOOL_PATHS[scenario.tool_id];
    if (!path) return;
    sessionStorage.setItem(`scenario_load_${scenario.tool_id}`, JSON.stringify(scenario.inputs));
    router.push(path);
  };

  if (loading || !user) {
    return (
      <div
        style={{
          minHeight: 'calc(100vh - 120px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-tertiary)',
        }}
      >
        <Loader2 className="animate-spin" size={24} />
      </div>
    );
  }

  const grouped = scenarios.reduce<Record<string, Scenario[]>>((acc, s) => {
    (acc[s.tool_name] ||= []).push(s);
    return acc;
  }, {});

  return (
    <div
      style={{
        maxWidth: 900,
        margin: '0 auto',
        padding:
          'clamp(20px, 4vw, 32px) clamp(16px, 4vw, 24px) clamp(48px, 8vw, 96px)',
      }}
    >
      <Link
        href="/dashboard"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          fontSize: 13,
          fontWeight: 500,
          color: 'var(--text-tertiary)',
          textDecoration: 'none',
          marginBottom: 20,
        }}
      >
        <ArrowLeft size={14} /> Back to apps
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: 'var(--sky)',
            border: '1px solid var(--sky)',
            color: 'var(--navy)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Bookmark size={20} />
        </div>
        <div>
          <h1
            style={{
              fontSize: 24,
              fontWeight: 700,
              color: 'var(--text-primary)',
              letterSpacing: '-0.02em',
              margin: 0,
            }}
          >
            My scenarios.
          </h1>
          <p
            style={{
              fontSize: 13,
              color: 'var(--text-tertiary)',
              margin: '4px 0 0',
              fontFamily: 'var(--font-mono)',
            }}
          >
            {scenarios.length} saved · {Object.keys(grouped).length} tool{Object.keys(grouped).length === 1 ? '' : 's'}
          </p>
        </div>
      </div>

      {scenarios.length === 0 ? (
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-xl)',
            padding: '48px 32px',
            textAlign: 'center',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <div
            style={{
              margin: '0 auto 16px',
              width: 56,
              height: 56,
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-section)',
              border: '1px solid var(--border-default)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-tertiary)',
            }}
          >
            <Bookmark size={24} />
          </div>
          <h2
            style={{
              fontSize: 18,
              fontWeight: 600,
              color: 'var(--text-primary)',
              margin: '0 0 8px',
            }}
          >
            No saved scenarios yet.
          </h2>
          <p
            style={{
              fontSize: 14,
              color: 'var(--text-tertiary)',
              margin: '0 auto 24px',
              maxWidth: 420,
              lineHeight: 1.55,
            }}
          >
            Use &ldquo;Save scenario&rdquo; on any tool to save your current inputs and results for later.
          </p>
          <Link
            href="/dashboard"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: 'var(--orange)',
              color: 'var(--text-inverse)',
              padding: '11px 20px',
              borderRadius: 'var(--radius-sm)',
              fontWeight: 700,
              fontSize: 13,
              textDecoration: 'none',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <Wrench size={14} /> Browse tools
          </Link>
        </div>
      ) : (
        Object.entries(grouped).map(([toolName, toolScenarios]) => (
          <div key={toolName} style={{ marginBottom: 32 }}>
            <div
              className="eyebrow"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: 12,
                color: 'var(--text-tertiary)',
              }}
            >
              <Wrench size={12} /> {toolName.toUpperCase()}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {toolScenarios.map((scenario) => (
                <div
                  key={scenario.id}
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-default)',
                    borderRadius: 'var(--radius-md)',
                    padding: '14px 18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 16,
                    boxShadow: 'var(--shadow-card)',
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <p
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: 'var(--text-primary)',
                        margin: 0,
                      }}
                    >
                      {scenario.key_result || 'Saved scenario'}
                    </p>
                    <p
                      style={{
                        fontSize: 11,
                        color: 'var(--text-tertiary)',
                        margin: '4px 0 0',
                        fontFamily: 'var(--font-mono)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                      }}
                    >
                      <Calendar size={11} />
                      {new Date(scenario.created_at).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                    <button
                      type="button"
                      onClick={() => handleLoad(scenario)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        background: 'var(--sky)',
                        color: 'var(--navy)',
                        padding: '8px 14px',
                        borderRadius: 'var(--radius-sm)',
                        border: 0,
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        boxShadow: 'none',
                      }}
                    >
                      <Play size={12} /> Load
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(scenario.id)}
                      disabled={deletingId === scenario.id}
                      aria-label="Delete scenario"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 32,
                        height: 32,
                        background: 'transparent',
                        color: 'var(--text-tertiary)',
                        border: '1px solid var(--border-default)',
                        borderRadius: 'var(--radius-sm)',
                        cursor: deletingId === scenario.id ? 'not-allowed' : 'pointer',
                        fontFamily: 'inherit',
                      }}
                    >
                      {deletingId === scenario.id ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Trash2 size={14} />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
