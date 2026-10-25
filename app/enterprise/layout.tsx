import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Enterprise & Teams: Financial Tools for Advisors, Employers and Creators',
  description:
    'Bring Money Guy Mutants calculators to your clients, employees or audience. Early access. Tell us what you need and we will say whether we can build it.',
  alternates: { canonical: 'https://moneyguymutants.com/enterprise' },
  openGraph: {
    type: 'website',
    url: 'https://moneyguymutants.com/enterprise',
    title: 'Enterprise & Teams | Money Guy Mutants',
    description: 'Financial decision tools for advisors, employers and creators.',
    siteName: 'Money Guy Mutants',
  },
};

export default function EnterpriseLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
