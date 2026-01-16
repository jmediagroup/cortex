import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Index Fund Growth Visualizer - ETF Investment Simulator',
  description: 'Simulate and visualize long-term growth for popular index funds like VOO, VTI, VT, and QQQM. See historical returns, volatility impact, and compound growth projections for your investment strategy.',
  keywords: ['index fund calculator', 'ETF growth simulator', 'VOO calculator', 'VTI simulator', 'S&P 500 returns', 'index fund comparison', 'investment growth visualizer', 'compound growth calculator', 'portfolio simulator', 'retirement investment calculator'],
  openGraph: {
    title: 'Index Fund Growth Visualizer - ETF Investment Simulator',
    description: 'Simulate long-term growth for popular index funds with historical returns and volatility modeling.',
    type: 'website',
    url: 'https://cortex.vip/apps/index-fund-visualizer',
    images: [{
      url: '/og-index-fund-visualizer.png',
      width: 1200,
      height: 630,
      alt: 'Cortex Index Fund Growth Visualizer',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Index Fund Growth Visualizer',
    description: 'Simulate long-term growth for popular index funds with historical returns and volatility modeling.',
    images: ['/og-index-fund-visualizer.png'],
  },
  alternates: {
    canonical: 'https://cortex.vip/apps/index-fund-visualizer',
  },
};

export default function IndexFundVisualizerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
