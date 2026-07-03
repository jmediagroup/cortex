import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service & Privacy Policy',
  description: 'Terms of Service and Privacy Policy for Money Guy Mutants and J Media Group LLC. Learn how we collect, use, and protect your information.',
  keywords: ['terms of service', 'privacy policy', 'Money Guy Mutants terms', 'J Media Group LLC', 'legal'],
  openGraph: {
    title: 'Terms of Service & Privacy Policy - Money Guy Mutants',
    description: 'Terms of Service and Privacy Policy for Money Guy Mutants and J Media Group LLC.',
    type: 'website',
    url: 'https://moneyguymutants.com/terms',
  },
  alternates: {
    canonical: 'https://moneyguymutants.com/terms',
  },
};

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
