'use client';

import Link from 'next/link';
import { Breadcrumb } from '@/components/ui';
import { ToolLayout } from '@/components/app/ToolLayout';
import { MarketingIcon } from '@/components/marketing/Icons';
import { DEFAULT_TOOLS, type MarketingTool } from '@/components/marketing/ToolGrid';

function IndexToolCard({ tool }: { tool: MarketingTool }) {
  const isFree = tool.tag === 'FREE';
  return (
    <Link
      href={tool.href}
      style={{
        position: 'relative',
        display: 'block',
        textDecoration: 'none',
        background: 'var(--bg-glass)',
        backdropFilter: 'var(--glass-blur)',
        WebkitBackdropFilter: 'var(--glass-blur)',
        border: '1px solid var(--glass-border)',
        borderRadius: 'var(--radius-xl)',
        padding: 24,
        boxShadow: 'var(--shadow-card), var(--shadow-inset-top)',
      }}
    >
      {tool.tag && (
        <div
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: isFree ? 'var(--emerald-500)' : 'var(--text-tertiary)',
            padding: '4px 10px',
            borderRadius: 9999,
            background: isFree ? 'var(--emerald-tint-soft)' : 'var(--bg-glass-strong)',
            border: `1px solid ${isFree ? 'var(--emerald-border-soft)' : 'var(--glass-border)'}`,
          }}
        >
          {tool.tag}
        </div>
      )}
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 'var(--radius-md)',
          background: 'var(--bg-glass-strong)',
          border: '1px solid var(--glass-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-secondary)',
          marginBottom: 20,
        }}
      >
        <MarketingIcon name={tool.icon} size={20} />
      </div>
      <h2
        style={{
          fontSize: 16,
          fontWeight: 600,
          color: 'var(--text-primary)',
          margin: '0 0 8px',
          letterSpacing: '-0.01em',
          paddingRight: tool.tag === 'PRO' ? 56 : 0,
        }}
      >
        {tool.title}
      </h2>
      <p
        style={{
          color: 'var(--text-tertiary)',
          fontSize: 13,
          lineHeight: 1.55,
          margin: '0 0 20px',
        }}
      >
        {tool.desc}
      </p>
      <span
        style={{
          color: 'var(--text-secondary)',
          fontWeight: 600,
          fontSize: 12,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        Open tool <MarketingIcon name="arrowRight" size={12} />
      </span>
    </Link>
  );
}

export default function AppsIndexPage() {
  return (
    <ToolLayout
      eyebrow="FINANCE · ALL TOOLS"
      title="Every Cortex tool."
      sub="Calculators and engines for personal and small-business finance — free tools to explore, Pro tools for precision."
      breadcrumb={<Breadcrumb toolName="All Tools" />}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 16,
        }}
      >
        {DEFAULT_TOOLS.map((tool) => (
          <IndexToolCard key={tool.href} tool={tool} />
        ))}
      </div>
    </ToolLayout>
  );
}
