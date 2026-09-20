import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Enterprise & Teams — Financial Tools for Advisors, Employers and Creators',
  description:
    'Bring Money Guy Mutants calculators to your clients, employees or audience. White-label tools, team access and priority support. Tell us about your use case.',
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
