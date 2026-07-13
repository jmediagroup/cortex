import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "What's Your Why — Find Your Real Money Motivation | Money Guy Mutants",
  description:
    'A reflective, eight-question diagnostic that surfaces what actually drives your financial decisions, fears, and goals — then reflects it back as a personal, AI-synthesized read on your relationship with money. Free.',
  keywords: [
    'whats your why',
    'money motivation',
    'financial why',
    'money psychology',
    'financial reflection',
    'why do i want money',
    'financial goals exercise',
    'money mindset',
    'financial self-assessment',
    'purpose and money',
  ],
  openGraph: {
    title: "What's Your Why — Find Your Real Money Motivation",
    description:
      'Eight questions that surface what actually drives your financial decisions — reflected back as a personal read on your relationship with money.',
    type: 'website',
    url: 'https://moneyguymutants.com/apps/whats-your-why',
  },
  twitter: {
    card: 'summary_large_image',
    title: "What's Your Why",
    description:
      'Surface what actually drives your money decisions in eight reflective questions.',
  },
  alternates: {
    canonical: 'https://moneyguymutants.com/apps/whats-your-why',
  },
};

export default function WhatsYourWhyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
