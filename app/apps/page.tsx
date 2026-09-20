import type { Metadata } from 'next';
import { AppsIndex } from '@/components/app/AppsIndex';
import { DEFAULT_TOOLS } from '@/lib/tools-registry';

const BASE_URL = 'https://moneyguymutants.com';

export const metadata: Metadata = {
  title: 'All Financial Tools & Calculators',
  description:
    'Every Money Guy Mutants tool in one place: compound interest, Coast FIRE, retirement strategy, debt paydown, rent vs buy, car affordability, net worth, S-Corp tax, capital gains, budgeting and more. Free to use.',
  keywords: [
    'financial calculators',
    'free financial tools',
    'money guy mutants tools',
    'retirement calculator',
    'compound interest calculator',
    'debt payoff calculator',
  ],
  alternates: { canonical: `${BASE_URL}/apps` },
  openGraph: {
    type: 'website',
    url: `${BASE_URL}/apps`,
    title: 'All Financial Tools & Calculators | Money Guy Mutants',
    description: 'Every Money Guy Mutants calculator and decision engine in one place. Free to use.',
    siteName: 'Money Guy Mutants',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'All Financial Tools & Calculators',
    description: 'Every Money Guy Mutants calculator and decision engine in one place. Free to use.',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'CollectionPage',
      '@id': `${BASE_URL}/apps#webpage`,
      url: `${BASE_URL}/apps`,
      name: 'All financial tools and calculators',
      isPartOf: { '@id': `${BASE_URL}/#website` },
      about: { '@id': `${BASE_URL}/#application` },
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
        { '@type': 'ListItem', position: 2, name: 'Financial Tools', item: `${BASE_URL}/apps` },
      ],
    },
    {
      '@type': 'ItemList',
      name: 'Money Guy Mutants tools',
      itemListElement: DEFAULT_TOOLS.map((t, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: t.title,
        description: t.desc,
        url: `${BASE_URL}${t.href}`,
      })),
    },
  ],
};

export default function AppsIndexPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <AppsIndex />
    </>
  );
}
