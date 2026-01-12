import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Debt Payoff Calculator - Avalanche vs Snowball Method',
  description: 'Compare debt paydown strategies: avalanche, snowball, and hybrid methods. Calculate payoff timelines with psychological weighting and opportunity cost.',
  keywords: ['debt payoff calculator', 'debt snowball calculator', 'debt avalanche calculator', 'debt paydown calculator', 'debt elimination calculator', 'debt reduction calculator', 'pay off debt calculator', 'debt strategy calculator', 'debt free calculator'],
  openGraph: {
    title: 'Debt Payoff Calculator - Avalanche vs Snowball Method',
    description: 'Compare debt paydown strategies with psychological weighting and opportunity cost analysis.',
    type: 'website',
    url: 'https://cortex.vip/apps/debt-paydown',
    images: [{
      url: '/og-debt.png',
      width: 1200,
      height: 630,
      alt: 'Cortex Debt Payoff Calculator',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Debt Payoff Calculator',
    description: 'Compare debt paydown strategies: avalanche vs snowball methods.',
    images: ['/og-debt.png'],
  },
  alternates: {
    canonical: 'https://cortex.vip/apps/debt-paydown',
  },
};

export default function DebtPaydownLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
