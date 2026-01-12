import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free Household Budget Calculator & AI Budget Optimizer',
  description: 'Smart budget calculator with AI-powered optimization. Track monthly expenses, allocate resources efficiently, and optimize your household budget. Free budget planning tool with tension metrics and flexibility analysis.',
  keywords: ['budget calculator', 'household budget planner', 'budget optimizer', 'AI budget tool', 'monthly budget calculator', 'expense tracker', 'budget allocation tool', 'family budget planner', 'budget management software', 'smart budgeting app', 'budget planning calculator', 'resource allocation', 'budget tension analysis', 'flexible budget tool'],
  openGraph: {
    title: 'Free Household Budget Calculator & AI Budget Optimizer',
    description: 'Smart budget calculator with AI-powered optimization. Track monthly expenses and optimize your household budget.',
    type: 'website',
    url: 'https://cortex.vip/apps/budget',
    images: [{
      url: '/og-budget.png',
      width: 1200,
      height: 630,
      alt: 'Cortex Budget Calculator',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Household Budget Calculator & AI Budget Optimizer',
    description: 'Smart budget calculator with AI-powered optimization.',
    images: ['/og-budget.png'],
  },
  alternates: {
    canonical: 'https://cortex.vip/apps/budget',
  },
};

export default function BudgetLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
