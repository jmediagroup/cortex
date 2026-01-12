import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Net Worth Calculator & Wealth Tracker - Free Financial Tool',
  description: 'Track your net worth, assets, and liabilities with our free calculator. Analyze liquidity, momentum, and visualize your financial trajectory. Comprehensive wealth tracking for personal finance.',
  keywords: ['net worth calculator', 'wealth tracker', 'asset tracker', 'liability calculator', 'financial health tracker', 'net worth analysis', 'wealth management tool', 'personal finance tracker', 'net worth growth', 'financial trajectory', 'liquidity analysis', 'wealth building calculator'],
  openGraph: {
    title: 'Net Worth Calculator & Wealth Tracker - Free Financial Tool',
    description: 'Track your net worth, assets, and liabilities. Analyze liquidity and visualize your financial trajectory.',
    type: 'website',
    url: 'https://cortex.vip/apps/net-worth',
    images: [{
      url: '/og-net-worth.png',
      width: 1200,
      height: 630,
      alt: 'Cortex Net Worth Calculator',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Net Worth Calculator & Wealth Tracker',
    description: 'Track your net worth, assets, and liabilities with our free calculator.',
    images: ['/og-net-worth.png'],
  },
  alternates: {
    canonical: 'https://cortex.vip/apps/net-worth',
  },
};

export default function NetWorthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
