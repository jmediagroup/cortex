'use client';

import Link from 'next/link';
import { useState } from 'react';
import { SectionBadge } from '@/components/ui/SectionBadge';
import { MarketingIcon } from './Icons';

import { DEFAULT_TOOLS, type MarketingTool } from '@/lib/tools-registry';

export { DEFAULT_TOOLS, type MarketingTool };

function ToolCard({ tool }: { tool: MarketingTool }) {
  const [hover, setHover] = useState(false);
  const isFree = tool.tag === 'FREE';
  const isPro = tool.tag === 'PRO';
  return (
    <Link
      href={tool.href}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: 'relative',
        display: 'block',
        textDecoration: 'none',
        background: 'var(--white)',
        border: `1px solid ${tool.featured ? 'var(--sky)' : 'var(--border-default)'}`,
        borderRadius: 'var(--radius-md)',
        padding: 24,
        boxShadow: hover ? 'var(--shadow-card-hover)' : 'var(--shadow-card)',
        transform: hover ? 'translateY(-3px)' : 'none',
        transition: 'transform 320ms var(--ease-out-expo), box-shadow 320ms',
      }}
    >
      {tool.tag && (
        <div
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: '#fff',
            padding: '4px 10px',
            borderRadius: 'var(--radius-full)',
            background: isFree ? 'var(--teal-green)' : 'var(--sky-pill)',
          }}
        >
          {tool.tag}
        </div>
      )}

      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 'var(--radius-circle)',
          background: tool.featured ? 'var(--sky)' : 'var(--mint)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--navy)',
          marginBottom: 20,
        }}
      >
        <MarketingIcon name={tool.icon} size={20} />
      </div>

      <h3
        style={{
          fontSize: 16,
          fontWeight: 700,
          color: 'var(--navy)',
          margin: '0 0 8px',
          letterSpacing: '-0.01em',
          lineHeight: 1.2,
          paddingRight: isPro ? 56 : 0,
        }}
      >
        {tool.title}
      </h3>
      <p
        style={{
          color: 'var(--text-secondary)',
          fontSize: 13,
          lineHeight: 1.55,
          margin: '0 0 20px',
        }}
      >
        {tool.desc}
      </p>

      <span
        style={{
          color: 'var(--orange)',
          fontWeight: 700,
          fontSize: 12,
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          display: 'inline-flex',
          alignItems: 'center',
          gap: hover ? 8 : 6,
          transition: 'gap 160ms',
        }}
      >
        Open tool <MarketingIcon name="arrowRight" size={12} />
      </span>
    </Link>
  );
}

export function MarketingToolGrid({ tools = DEFAULT_TOOLS }: { tools?: MarketingTool[] } = {}) {
  return (
    <section
      id="tools"
      style={{
        position: 'relative',
        padding: '120px 24px',
        background: 'var(--bg-page)',
        borderTop: '1px solid var(--border-default)',
        scrollMarginTop: 64,
      }}
    >
      <div style={{ maxWidth: 1280, margin: '0 auto', position: 'relative' }}>
        <div style={{ maxWidth: 640, marginBottom: 64 }}>
          <div className="mgm-eyebrow" style={{ marginBottom: 16 }}>
            MUTANT FINANCE — AVAILABLE NOW
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
            <h2
              style={{
                fontSize: 'clamp(32px,4.5vw,52px)',
                fontWeight: 700,
                color: 'var(--navy)',
                letterSpacing: '-0.025em',
                margin: 0,
                lineHeight: 1.1,
              }}
            >
              Fifteen tools.
              <br />
              One mental model.
            </h2>
            <SectionBadge glyph="spark" tone="sky" />
          </div>
          <p
            style={{
              fontSize: 17,
              color: 'var(--text-secondary)',
              fontWeight: 400,
              lineHeight: 1.55,
              margin: 0,
              maxWidth: 560,
            }}
          >
            Our first suite focuses on personal and small-business finance — where small decisions compound dramatically over time.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 16,
          }}
        >
          {tools.map((t) => (
            <ToolCard key={t.href} tool={t} />
          ))}
        </div>
      </div>
    </section>
  );
}
