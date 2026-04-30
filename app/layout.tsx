import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { cookies } from "next/headers";
import Script from "next/script";
import "./globals.css";
import WebVitals from "@/components/WebVitals";
import Analytics from "@/components/Analytics";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { ThemeScript } from "@/components/theme/ThemeScript";
import { THEME_COOKIE, THEME_DEFAULT, isTheme, type Theme } from "@/lib/theme";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600"],
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
  appleWebApp: {
    capable: true,
    title: 'Cortex',
    statusBarStyle: 'black-translucent',
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
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F7F7F3' },
    { media: '(prefers-color-scheme: dark)', color: '#0A0E14' },
  ],
};

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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const cookieTheme = cookieStore.get(THEME_COOKIE)?.value;
  const initialTheme: Theme | null = isTheme(cookieTheme) ? cookieTheme : null;

  return (
    <html lang="en" data-theme={initialTheme ?? undefined} suppressHydrationWarning>
      <head>
        <ThemeScript />
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
          title="Cortex — Articles RSS"
          href="https://cortex.vip/articles/rss.xml"
        />
        <link rel="sitemap" type="application/xml" href="/sitemap.xml" />
      </head>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}
      >
        <ThemeProvider initialTheme={initialTheme ?? THEME_DEFAULT}>
          <WebVitals />
          <Analytics />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
