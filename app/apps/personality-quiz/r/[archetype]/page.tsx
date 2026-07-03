import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Breadcrumb } from '@/components/ui';
import { ToolLayout } from '@/components/app/ToolLayout';
import {
  ARCHETYPES,
  ARCHETYPE_ORDER,
  type ArchetypeId,
} from '@/lib/personality-quiz-data';
import { buildResultUrl } from '@/lib/personality-quiz-share';
import { SharedResultShareBar } from './SharedResultShareBar';

type PageParams = Promise<{ archetype: string }>;
type PageSearch = Promise<{ s?: string }>;

function isArchetype(value: string): value is ArchetypeId {
  return value in ARCHETYPES;
}

export async function generateStaticParams() {
  return ARCHETYPE_ORDER.map((id) => ({ archetype: id }));
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: PageParams;
  searchParams: PageSearch;
}): Promise<Metadata> {
  const { archetype } = await params;
  const { s } = await searchParams;
  if (!isArchetype(archetype)) return { title: 'Money Guy Mutants Financial Personality Quiz' };

  const a = ARCHETYPES[archetype];
  const secondary =
    s && isArchetype(s) && s !== archetype ? ARCHETYPES[s] : null;
  const url = buildResultUrl(archetype, secondary?.id);
  const title = `${a.name} — Money Guy Mutants Financial Personality Quiz`;
  const description = secondary
    ? `${a.tagline} (Secondary: ${secondary.name}.) Take the 10-question quiz to find your investor archetype.`
    : `${a.tagline} Take the 10-question Money Guy Mutants Financial Personality Quiz to find your investor archetype.`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function SharedResultPage({
  params,
  searchParams,
}: {
  params: PageParams;
  searchParams: PageSearch;
}) {
  const { archetype } = await params;
  const { s } = await searchParams;
  if (!isArchetype(archetype)) notFound();

  const primary = ARCHETYPES[archetype];
  const secondary =
    s && isArchetype(s) && s !== archetype ? ARCHETYPES[s] : null;

  return (
    <ToolLayout
      eyebrow="PSYCHOLOGY · SHARED RESULT"
      title={`${primary.name}.`}
      sub={`"${primary.tagline}" — one of six investor archetypes from the Money Guy Mutants Financial Personality Quiz.`}
      breadcrumb={<Breadcrumb toolName={`Quiz · ${primary.shortName}`} />}
      narration="The investors who win don’t fight their wiring — they build a system around it. Knowing your archetype is step one."
      disclaimer="Educational self-assessment · not personalized advice · results are descriptive, not predictive."
    >
      <article
        style={{
          maxWidth: 760,
          margin: '0 auto',
          background: 'var(--bg-glass)',
          border: '1px solid var(--glass-border)',
          borderRadius: 'var(--radius-xl)',
          padding: 'clamp(24px, 4vw, 40px)',
          backdropFilter: 'var(--glass-blur)',
          WebkitBackdropFilter: 'var(--glass-blur)',
          boxShadow: 'var(--shadow-card), var(--shadow-inset-top)',
        }}
      >
        <div
          className="eyebrow mono"
          style={{
            color: 'var(--emerald-500)',
            marginBottom: 12,
            letterSpacing: '0.18em',
          }}
        >
          ● FINANCIAL PERSONALITY REPORT
        </div>

        <h2
          style={{
            fontSize: 'clamp(32px, 6vw, 48px)',
            fontWeight: 700,
            letterSpacing: '-0.03em',
            margin: '0 0 6px',
            lineHeight: 1.05,
            color: 'var(--text-primary)',
          }}
        >
          {primary.name}
        </h2>
        <p
          style={{
            fontStyle: 'italic',
            color: 'var(--text-secondary)',
            fontSize: 16,
            margin: 0,
          }}
        >
          &ldquo;{primary.tagline}&rdquo;
        </p>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 10,
            margin: '20px 0 24px',
          }}
        >
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 12px',
              borderRadius: 9999,
              background: 'var(--emerald-tint)',
              border: '1px solid var(--emerald-500)',
              fontSize: 12,
            }}
          >
            <span
              className="mono"
              style={{
                fontSize: 10,
                color: 'var(--emerald-500)',
                letterSpacing: '0.16em',
              }}
            >
              PRIMARY
            </span>
            <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
              {primary.name}
            </span>
          </span>
          {secondary && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 12px',
                borderRadius: 9999,
                background: 'var(--bg-glass)',
                border: '1px solid var(--glass-border)',
                fontSize: 12,
              }}
            >
              <span
                className="mono"
                style={{
                  fontSize: 10,
                  color: 'var(--text-tertiary)',
                  letterSpacing: '0.16em',
                }}
              >
                SECONDARY
              </span>
              <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                {secondary.name}
              </span>
            </span>
          )}
        </div>

        <p
          style={{
            color: 'var(--text-secondary)',
            fontSize: 16,
            lineHeight: 1.65,
            margin: '0 0 24px',
          }}
        >
          {primary.summary}
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 18,
            marginBottom: 24,
          }}
        >
          <div
            style={{
              padding: 16,
              background: 'var(--bg-glass)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <div
              className="eyebrow"
              style={{ color: 'var(--emerald-500)', marginBottom: 10 }}
            >
              ▲ STRENGTHS
            </div>
            <ul
              style={{
                margin: 0,
                paddingLeft: 16,
                color: 'var(--text-secondary)',
                fontSize: 14,
                lineHeight: 1.55,
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}
            >
              {primary.strengths.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div
            style={{
              padding: 16,
              background: 'var(--bg-glass)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <div
              className="eyebrow"
              style={{ color: 'var(--color-warning)', marginBottom: 10 }}
            >
              ◆ WATCH OUT FOR
            </div>
            <ul
              style={{
                margin: 0,
                paddingLeft: 16,
                color: 'var(--text-secondary)',
                fontSize: 14,
                lineHeight: 1.55,
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}
            >
              {primary.watchOuts.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Big "find yours" CTA — the conversion target for visitors */}
        <div
          style={{
            position: 'relative',
            overflow: 'hidden',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--emerald-border)',
            padding: 'clamp(20px, 3vw, 28px)',
            background:
              'linear-gradient(135deg, var(--emerald-tint), transparent 70%), var(--bg-glass-strong)',
            display: 'flex',
            flexWrap: 'wrap',
            gap: 16,
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 24,
          }}
        >
          <div style={{ flex: '1 1 280px', minWidth: 0 }}>
            <div
              className="eyebrow"
              style={{ color: 'var(--emerald-500)', marginBottom: 6 }}
            >
              YOUR TURN
            </div>
            <div
              style={{
                fontSize: 'clamp(18px, 2.6vw, 22px)',
                fontWeight: 700,
                color: 'var(--text-primary)',
                letterSpacing: '-0.015em',
              }}
            >
              What kind of investor are you?
            </div>
            <div
              style={{
                fontSize: 14,
                color: 'var(--text-secondary)',
                marginTop: 4,
              }}
            >
              10 questions. 2 minutes. No email required.
            </div>
          </div>
          <Link
            href="/apps/personality-quiz"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '14px 24px',
              borderRadius: 12,
              background: 'var(--emerald-500)',
              color: 'var(--obsidian-900)',
              fontSize: 14,
              fontWeight: 700,
              textDecoration: 'none',
              boxShadow:
                '0 0 0 1px var(--cta-glow-ring), 0 0 28px var(--cta-glow-soft)',
            }}
          >
            Take the quiz →
          </Link>
        </div>

        {/* Money Guy Mutants tools */}
        <div style={{ marginBottom: 24 }}>
          <div
            className="eyebrow"
            style={{ color: 'var(--text-tertiary)', marginBottom: 10 }}
          >
            EXPLORE WITH MUTANTS
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {primary.tools.map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '10px 16px',
                  borderRadius: 9999,
                  border: '1px solid var(--emerald-border-soft)',
                  color: 'var(--emerald-500)',
                  textDecoration: 'none',
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                {tool.label} →
              </Link>
            ))}
          </div>
        </div>

        <SharedResultShareBar primary={primary.id} secondary={secondary?.id} />
      </article>
    </ToolLayout>
  );
}
