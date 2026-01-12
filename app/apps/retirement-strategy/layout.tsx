import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Retirement Planning Calculator - Withdrawal Strategy Optimizer',
  description: 'Advanced retirement calculator with RMD calculations, Roth conversion planning, and sequence risk analysis. Plan your retirement withdrawal strategy with tax optimization.',
  keywords: ['retirement calculator', 'retirement planning', 'RMD calculator', 'Roth conversion calculator', 'retirement withdrawal strategy', 'retirement income calculator', '401k calculator', 'IRA calculator', 'retirement planning tool', 'tax-efficient retirement', 'sequence risk', 'retirement strategy'],
  openGraph: {
    title: 'Retirement Planning Calculator - Withdrawal Strategy Optimizer',
    description: 'Advanced retirement calculator with RMD calculations and Roth conversion planning.',
    type: 'website',
    url: 'https://cortex.vip/apps/retirement-strategy',
    images: [{
      url: '/og-retirement.png',
      width: 1200,
      height: 630,
      alt: 'Cortex Retirement Planning Calculator',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Retirement Planning Calculator',
    description: 'Advanced retirement calculator with RMD calculations and Roth conversion planning.',
    images: ['/og-retirement.png'],
  },
  alternates: {
    canonical: 'https://cortex.vip/apps/retirement-strategy',
  },
};

export default function RetirementStrategyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
