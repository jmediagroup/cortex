'use client';

import Link from 'next/link';
import { useState } from 'react';
import { MarketingIcon } from './Icons';

type Tier = {
  name: string;
  price: string;
  cadence: string;
  sub: string;
  features: string[];
  cta: string;
  href: string;
  featured?: boolean;
};

const TIERS: Tier[] = [
  {
    name: 'Free',
    price: '$0',
    cadence: '/ forever',
    sub: 'For exploration and curiosity.',
    features: [
      'Access to core calculators',
      'Limited scenarios',
      'Ideal for learning the models',
    ],
    cta: 'Start free',
    href: '/signup',
  },
  {
    name: 'Finance Pro',
    price: '$9',
    cadence: '/ month',
    sub: 'For people who want precision.',
    features: [
      'Full access to all Finance tools',
      'Advanced multi-scenario modeling',
      'Deeper projections & tax logic',
      'Strategy modeling with live data',
    ],
    cta: 'Get Pro',
    href: '/signup?plan=finance_pro&billing=monthly',
    featured: true,
  },
];

export function MarketingPricingPreview() {
  return (
    <section
      id="pricing"
      style={{ padding: '120px 24px', background: 'var(--bg-page)', scrollMarginTop: 64 }}
    >
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', maxWidth: 560, margin: '0 auto 64px' }}>
          <div
            className="eyebrow"
            style={{ marginBottom: 16, color: 'var(--text-tertiary)' }}
          >
            PRICING
          </div>
          <h2
            style={{
              fontSize: 'clamp(32px,4.5vw,52px)',
              fontWeight: 700,
              color: 'var(--text-primary)',
              letterSpacing: '-0.025em',
              margin: '0 0 16px',
              lineHeight: 1.1,
            }}
          >
            Simple, honest pricing.
          </h2>
          <p style={{ fontSize: 17, color: 'var(--text-secondary)', margin: 0 }}>
            Choose the plan that matches where you are today.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))',
            gap: 20,
            maxWidth: 820,
            margin: '0 auto',
          }}
        >
          {TIERS.map((tier) => (
            <PricingCard key={tier.name} tier={tier} />
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: 32 }}>
          <Link
            href="/pricing"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              color: 'var(--emerald-500)',
              fontWeight: 600,
              fontSize: 14,
              textDecoration: 'none',
            }}
          >
            View full pricing details <MarketingIcon name="arrowRight" size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
}

function PricingCard({ tier }: { tier: Tier }) {
  const [hover, setHover] = useState(false);
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: 'relative',
        background: tier.featured ? 'var(--bg-glass-strong)' : 'var(--bg-glass)',
        backdropFilter: 'var(--glass-blur)',
        WebkitBackdropFilter: 'var(--glass-blur)',
        border: `1px solid ${tier.featured ? 'var(--emerald-border)' : 'var(--glass-border)'}`,
        borderRadius: 'var(--radius-2xl)',
        padding: 32,
        boxShadow: tier.featured
          ? '0 0 0 1px var(--featured-halo), 0 20px 60px var(--featured-halo), var(--shadow-inset-top)'
          : 'var(--shadow-card), var(--shadow-inset-top)',
        display: 'flex',
        flexDirection: 'column',
        transform: hover ? 'translateY(-3px)' : 'none',
        transition: 'transform 320ms var(--ease-out-expo)',
      }}
    >
      {tier.featured && (
        <div
          style={{
            position: 'absolute',
            top: -12,
            left: 24,
            background: 'var(--emerald-500)',
            color: 'var(--text-inverse)',
            padding: '5px 12px',
            borderRadius: 9999,
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            boxShadow: '0 0 20px var(--cta-glow-ring)',
          }}
        >
          Most popular
        </div>
      )}

      <h3
        style={{
          fontSize: 18,
          fontWeight: 600,
          color: 'var(--text-primary)',
          margin: 0,
          letterSpacing: '-0.01em',
        }}
      >
        {tier.name}
      </h3>
      <p style={{ color: 'var(--text-tertiary)', fontSize: 13, margin: '6px 0 28px' }}>
        {tier.sub}
      </p>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 32 }}>
        <span
          style={{
            fontSize: 48,
            fontWeight: 700,
            color: 'var(--text-primary)',
            letterSpacing: '-0.035em',
            fontFamily: 'var(--font-sans)',
          }}
        >
          {tier.price}
        </span>
        <span
          style={{
            color: 'var(--text-tertiary)',
            fontSize: 14,
            fontFamily: 'var(--font-mono)',
          }}
        >
          {tier.cadence}
        </span>
      </div>

      <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 36px', flex: 1 }}>
        {tier.features.map((feature) => (
          <li
            key={feature}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 10,
              fontSize: 14,
              color: 'var(--text-secondary)',
              marginBottom: 14,
            }}
          >
            <span
              aria-hidden="true"
              style={{
                flexShrink: 0,
                width: 18,
                height: 18,
                borderRadius: '50%',
                background: tier.featured ? 'var(--emerald-tint)' : 'var(--bg-glass-strong)',
                border: `1px solid ${tier.featured ? 'var(--emerald-border)' : 'var(--glass-border)'}`,
                color: tier.featured ? 'var(--emerald-500)' : 'var(--text-tertiary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: 1,
              }}
            >
              <MarketingIcon name="check" size={10} stroke={2.5} />
            </span>
            {feature}
          </li>
        ))}
      </ul>

      <Link
        href={tier.href}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          background: tier.featured ? 'var(--emerald-500)' : 'var(--bg-glass-strong)',
          color: tier.featured ? 'var(--text-inverse)' : 'var(--text-primary)',
          border: tier.featured ? 'none' : '1px solid var(--glass-border-strong)',
          padding: '14px 24px',
          borderRadius: 12,
          fontWeight: 600,
          fontSize: 14,
          textDecoration: 'none',
          boxShadow: tier.featured ? '0 0 24px var(--cta-glow-soft)' : 'none',
          transition: 'all 160ms',
        }}
      >
        {tier.cta} <MarketingIcon name="arrowRight" size={14} />
      </Link>
    </div>
  );
}
