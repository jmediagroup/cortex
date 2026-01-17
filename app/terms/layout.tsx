import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service & Privacy Policy',
  description: 'Terms of Service and Privacy Policy for Cortex and J Media Group LLC. Learn how we collect, use, and protect your information.',
  keywords: ['terms of service', 'privacy policy', 'Cortex terms', 'J Media Group LLC', 'legal'],
  openGraph: {
    title: 'Terms of Service & Privacy Policy - Cortex',
    description: 'Terms of Service and Privacy Policy for Cortex and J Media Group LLC.',
    type: 'website',
    url: 'https://cortex.vip/terms',
  },
  alternates: {
    canonical: 'https://cortex.vip/terms',
  },
};

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
