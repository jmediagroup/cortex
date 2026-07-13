import { MetadataRoute } from 'next';

const PUBLIC_PATHS = [
  '/',
  '/pricing',
  '/articles',
  '/articles/',
  '/about',
  '/security',
  '/terms',
  '/changelog',
  '/roadmap',
  '/enterprise',
  '/thinking',
  '/guides',
  '/financial-mutants',
  '/apps',
  '/apps/compound-interest',
  '/apps/budget',
  '/apps/retirement-strategy',
  '/apps/index-fund-visualizer',
  '/apps/gambling-redirect',
  '/apps/car-affordability',
  '/apps/rent-vs-buy',
  '/apps/debt-paydown',
  '/apps/geographic-arbitrage',
  '/apps/net-worth',
  '/apps/coast-fire',
  '/apps/s-corp-optimizer',
  '/apps/s-corp-investment',
  '/apps/capital-gains-tax',
  '/apps/personality-quiz',
  '/apps/whats-your-why',
];

const PRIVATE_PATHS = [
  '/api/',
  '/account',
  '/dashboard',
  '/admin',
  '/login',
  '/signup',
  '/reset-password',
  '/design',
];

// AI search and answer engines we explicitly want to be visible to.
// These bots are also allowed by the wildcard rule below; naming them
// individually is a clear, durable signal of opt-in.
const AI_USER_AGENTS = [
  'GPTBot',           // OpenAI training crawler
  'OAI-SearchBot',    // OpenAI search index
  'ChatGPT-User',     // ChatGPT browsing on behalf of users
  'ClaudeBot',        // Anthropic Claude crawler
  'anthropic-ai',     // Legacy Anthropic UA
  'Claude-Web',       // Claude.ai browsing
  'PerplexityBot',    // Perplexity AI
  'Perplexity-User',  // Perplexity on-demand fetch
  'Google-Extended',  // Google AI training (Gemini, AI Overviews)
  'Applebot-Extended',// Apple Intelligence
  'Bytespider',       // ByteDance / Doubao
  'CCBot',            // Common Crawl (used by many AI training datasets)
  'Meta-ExternalAgent',
  'cohere-ai',
  'YouBot',
  'DuckAssistBot',
  'Amazonbot',
  'MistralAI-User',
];

export default function robots(): MetadataRoute.Robots {
  const aiRules = AI_USER_AGENTS.map((userAgent) => ({
    userAgent,
    allow: ['/', '/articles/', '/apps/', '/thinking/', '/guides/', '/llms.txt', '/llms-full.txt'],
    disallow: PRIVATE_PATHS,
  }));

  return {
    rules: [
      {
        userAgent: '*',
        allow: PUBLIC_PATHS,
        disallow: PRIVATE_PATHS,
      },
      ...aiRules,
    ],
    sitemap: [
      'https://moneyguymutants.com/sitemap.xml',
    ],
    host: 'https://moneyguymutants.com',
  };
}
