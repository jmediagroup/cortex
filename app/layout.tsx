import type { Metadata, Viewport } from "next";
import { Hanken_Grotesk, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import WebVitals from "@/components/WebVitals";
import Analytics from "@/components/Analytics";

const hanken = Hanken_Grotesk({
  variable: "--font-hanken",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://moneyguymutants.com'),
  title: {
    default: "Money Guy Mutants - Financial Decision Tools & Budget Planning Software",
    template: "%s | Money Guy Mutants"
  },
  description: "Free online financial calculators and budget planning tools. Retirement planning, compound interest calculator, budget optimizer, net worth tracker, and more. Make smarter money decisions with Money Guy Mutants.",
  keywords: ['financial calculator', 'budget planner', 'retirement calculator', 'compound interest calculator', 'net worth tracker', 'budget optimizer', 'financial planning tool', 'money management app', 'investment calculator', 'debt payoff calculator', 'financial decision making', 'personal finance software'],
  authors: [{ name: 'Cortex Technologies' }],
  creator: 'Cortex Technologies',
  publisher: 'Cortex Technologies',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://moneyguymutants.com',
    siteName: 'Money Guy Mutants',
    title: 'Money Guy Mutants - Financial Decision Tools & Budget Planning Software',
    description: 'Free online financial calculators and budget planning tools. Make smarter money decisions with Money Guy Mutants.',
    images: [{
      url: '/opengraph-image',
      width: 1200,
      height: 630,
      alt: 'Money Guy Mutants Financial Tools',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Money Guy Mutants - Financial Decision Tools',
    description: 'Free online financial calculators and budget planning tools.',
    images: ['/opengraph-image'],
  },
  icons: {
    icon: [
      { url: '/icon', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-icon', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    title: 'Money Guy Mutants',
    statusBarStyle: 'default',
  },
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
  themeColor: '#FFFFFF',
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': 'https://moneyguymutants.com/#organization',
      name: 'Cortex Technologies',
      url: 'https://moneyguymutants.com',
      logo: {
        '@type': 'ImageObject',
        url: 'https://moneyguymutants.com/icon',
        width: 512,
        height: 512,
      },
      description: 'Money Guy Mutants builds interactive decision-support tools for life\'s biggest choices, starting with personal finance.',
    },
    {
      '@type': 'WebSite',
      '@id': 'https://moneyguymutants.com/#website',
      url: 'https://moneyguymutants.com',
      name: 'Money Guy Mutants',
      description: 'Tools for thinking clearly about life\'s biggest decisions.',
      publisher: {
        '@id': 'https://moneyguymutants.com/#organization',
      },
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: 'https://moneyguymutants.com/dashboard?search={search_term_string}',
        },
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@type': 'SoftwareApplication',
      '@id': 'https://moneyguymutants.com/#application',
      name: 'Money Guy Mutants Financial Tools',
      applicationCategory: 'FinanceApplication',
      operatingSystem: 'Web',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.8',
        ratingCount: '150',
        bestRating: '5',
        worstRating: '1',
      },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="light">
      <head>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-0PQ1RZVNTS"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-0PQ1RZVNTS');
          `}
        </Script>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {/* Auto-discovery for AI search engines and feed readers. */}
        <link
          rel="alternate"
          type="application/rss+xml"
          title="Money Guy Mutants — Articles RSS"
          href="https://moneyguymutants.com/articles/rss.xml"
        />
        <link
          rel="alternate"
          type="application/rss+xml"
          title="Money Guy Mutants Research — Daily & Weekly Investment Outlook RSS"
          href="https://moneyguymutants.com/thinking/rss.xml"
        />
        <link rel="sitemap" type="application/xml" href="/sitemap.xml" />
      </head>
      <body
        className={`${hanken.variable} ${jetbrainsMono.variable} antialiased`}
      >
        <WebVitals />
        <Analytics />
        {children}
      </body>
    </html>
  );
}
