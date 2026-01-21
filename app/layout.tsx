import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import WebVitals from "@/components/WebVitals";
import Analytics from "@/components/Analytics";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://cortex.vip'),
  title: {
    default: "Cortex - Financial Decision Tools & Budget Planning Software",
    template: "%s | Cortex"
  },
  description: "Free online financial calculators and budget planning tools. Retirement planning, compound interest calculator, budget optimizer, net worth tracker, and more. Make smarter money decisions with Cortex.",
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
    url: 'https://cortex.vip',
    siteName: 'Cortex - Tools for Long-Term Thinking',
    title: 'Cortex - Financial Decision Tools & Budget Planning Software',
    description: 'Free online financial calculators and budget planning tools. Make smarter money decisions with Cortex.',
    images: [{
      url: '/og-image.png',
      width: 1200,
      height: 630,
      alt: 'Cortex Financial Tools',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cortex - Financial Decision Tools',
    description: 'Free online financial calculators and budget planning tools.',
    images: ['/og-image.png'],
    creator: '@cortextools',
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
};

// JSON-LD structured data for Organization and WebSite
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': 'https://cortex.vip/#organization',
      name: 'Cortex Technologies',
      url: 'https://cortex.vip',
      logo: {
        '@type': 'ImageObject',
        url: 'https://cortex.vip/icon',
        width: 512,
        height: 512,
      },
      sameAs: [
        'https://twitter.com/cortextools',
      ],
      description: 'Cortex builds interactive decision-support tools for life\'s biggest choices, starting with personal finance.',
    },
    {
      '@type': 'WebSite',
      '@id': 'https://cortex.vip/#website',
      url: 'https://cortex.vip',
      name: 'Cortex',
      description: 'Tools for thinking clearly about life\'s biggest decisions.',
      publisher: {
        '@id': 'https://cortex.vip/#organization',
      },
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: 'https://cortex.vip/dashboard?search={search_term_string}',
        },
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@type': 'SoftwareApplication',
      '@id': 'https://cortex.vip/#application',
      name: 'Cortex Financial Tools',
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
    <html lang="en">
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
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <WebVitals />
        <Analytics />
        {children}
      </body>
    </html>
  );
}
