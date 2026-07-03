'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Tag } from '@/components/ui/Tag';
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
          <div className="mgm-eyebrow" style={{ marginBottom: 16 }}>
            PRICING
          </div>
          <h2
            style={{
              fontSize: 'clamp(32px,4.5vw,52px)',
              fontWeight: 700,
              color: 'var(--navy)',
              letterSpacing: '-0.025em',
              margin: '0 0 16px',
              lineHeight: 1.1,
            }}
          >
            Simple, honest pricing.
          </h2>
          <p style={{ fontSize: 17, color: 'var(--text-secondary)', margin: 0 }}>
            Pick the plan that matches where you are today. No countdowns, no traps.
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

        <div style={{ textAlign: 'center', marginTop: 40 }}>
          <Button variant="secondary" tone="orange" size="sm" href="/pricing">
            View full pricing <MarketingIcon name="arrowRight" size={14} />
          </Button>
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
        background: 'var(--white)',
        border: tier.featured ? '2px solid var(--sky)' : '1px solid var(--border-default)',
        borderRadius: 'var(--radius-md)',
        padding: 32,
        boxShadow: tier.featured
          ? '0 14px 30px rgba(78,201,245,0.18)'
          : hover
            ? 'var(--shadow-card-hover)'
            : 'var(--shadow-card)',
        display: 'flex',
        flexDirection: 'column',
        transform: hover ? 'translateY(-3px)' : 'none',
        transition: 'transform 320ms var(--ease-out-expo), box-shadow 320ms',
      }}
    >
      {tier.featured && (
        <div style={{ position: 'absolute', top: -14, left: 24 }}>
          <Tag tone="sky" style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '5px 12px' }}>
            Most popular
          </Tag>
        </div>
      )}

      <h3
        style={{
          fontSize: 18,
          fontWeight: 700,
          color: 'var(--navy)',
          margin: 0,
          letterSpacing: '-0.01em',
        }}
      >
        {tier.name}
      </h3>
      <p style={{ color: 'var(--text-muted)', fontSize: 13, margin: '6px 0 28px' }}>
        {tier.sub}
      </p>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 32 }}>
        <span
          style={{
            fontSize: 48,
            fontWeight: 700,
            color: 'var(--navy)',
            letterSpacing: '-0.035em',
            fontFamily: 'var(--font-sans)',
          }}
        >
          {tier.price}
        </span>
        <span
          style={{
            color: 'var(--text-muted)',
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
                background: 'var(--emerald-tint)',
                color: 'var(--teal-green)',
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

      <Button
        variant={tier.featured ? 'primary' : 'secondary'}
        tone="navy"
        href={tier.href}
        style={{ width: '100%' }}
      >
        {tier.cta} <MarketingIcon name="arrowRight" size={14} />
      </Button>
    </div>
  );
}
