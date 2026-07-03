import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Financial Personality Quiz — What Kind of Investor Are You? | Money Guy Mutants',
  description:
    'Discover your investor archetype in 10 questions. Money Guy Mutants maps your money instincts to one of six personality types — from patient Accumulator to high-conviction Visionary. Free, no email required.',
  keywords: [
    'financial personality quiz',
    'investor personality test',
    'investor archetype',
    'money personality',
    'investing style quiz',
    'financial psychology',
    'cortex quiz',
    'investor type',
    'risk tolerance quiz',
  ],
  openGraph: {
    title: 'Financial Personality Quiz — What Kind of Investor Are You?',
    description:
      'Map your money instincts to one of six investor archetypes. 10 questions, 2 minutes.',
    type: 'website',
    url: 'https://moneyguymutants.com/apps/personality-quiz',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Financial Personality Quiz',
    description:
      'Discover your investor archetype in 10 questions. Free, no email required.',
  },
  alternates: {
    canonical: 'https://moneyguymutants.com/apps/personality-quiz',
  },
};

export default function PersonalityQuizLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
