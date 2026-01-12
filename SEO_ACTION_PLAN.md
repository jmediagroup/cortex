# Cortex.vip SEO Action Plan
**Date:** January 11, 2026
**Status:** Site NOT Currently Indexed
**Priority:** HIGH

---

## 🚨 CRITICAL FINDING

Your site **cortex.vip** is currently **NOT indexed** by Google. A `site:cortex.vip` search returns ZERO results.

**What this means:**
- Nobody can find your site through Google search
- You're getting ZERO organic traffic
- Your calculators are invisible to potential users

---

## ✅ FIXES ALREADY IMPLEMENTED

The following have been completed in your codebase:

### 1. Domain Configuration Fixed
- ✅ Updated `app/layout.tsx` metadataBase from `cortex.io` → `cortex.vip`
- ✅ Updated `app/sitemap.ts` baseUrl from `cortex.io` → `cortex.vip`
- ✅ Fixed OpenGraph URLs in main layout
- ✅ Updated all 10 calculator layout files with correct `cortex.vip` URLs

### 2. Robots.txt Created
- ✅ Created `app/robots.ts` with proper configuration
- ✅ Allows all pages except `/api/`, `/account`, `/dashboard`
- ✅ Points to sitemap at `https://cortex.vip/sitemap.xml`

### 3. Existing Metadata Reviewed
- ✅ All calculator pages have individual layout.tsx files with metadata
- ✅ Keywords are well-targeted
- ✅ OpenGraph and Twitter cards configured
- ✅ Canonical URLs set

---

## 🔴 CRITICAL ACTIONS REQUIRED (DO THESE FIRST)

### Action 1: Deploy Your Changes
**What:** Rebuild and redeploy your site to production
**Why:** The fixes above need to be live
**How:**
```bash
npm run build
# Then deploy to your hosting (Vercel/Netlify/etc.)
```

**Verification:**
- Visit https://cortex.vip/robots.txt - should show your robots file
- Visit https://cortex.vip/sitemap.xml - should show your sitemap

---

### Action 2: Decide on Authentication Strategy

**CRITICAL ISSUE:** Your calculator pages require login, which prevents Google from crawling them.

**Current Problem:**
```typescript
// All your app pages check authentication
const { data: { session } } = await supabase.auth.getSession();
if (!session) {
  router.push('/login');  // ← Blocks Google
  return;
}
```

**You have 2 options:**

#### Option A: Make Calculators Public (RECOMMENDED)
**Pros:**
- Google can crawl and index all calculator content
- Users can try before signing up
- Much better for SEO and user acquisition
- Increases conversions (let them use, then prompt to save)

**Cons:**
- Need to modify auth logic in each app

**Implementation:**
1. Remove auth requirement from calculator pages
2. Show calculators to everyone
3. Add "Sign up to save your results" CTA
4. Only require login for save/history features

**Code example:**
```typescript
export default function CompoundInterestPage() {
  const [session, setSession] = useState(null);

  // Don't redirect if no session
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
  }, []);

  return (
    <div>
      {!session && (
        <div className="banner">
          <a href="/login">Sign up to save your calculations →</a>
        </div>
      )}
      {/* Calculator works for everyone */}
      <CompoundInterest />
    </div>
  );
}
```

#### Option B: Create Static Landing Pages
**Pros:**
- Keep calculators behind auth
- Still get SEO benefits from landing pages

**Cons:**
- More work to create/maintain
- Less effective than Option A
- Users can't try the actual calculator

**Implementation:**
1. Create `/calculators/compound-interest` routes
2. Add descriptive content, screenshots, examples
3. Link to the auth-required app version

**Recommendation:** **Choose Option A.** Free calculator access drives more signups than gating does.

---

### Action 3: Submit to Google Search Console

**What:** Verify ownership and submit your sitemap
**When:** Within 24 hours of deploying fixes

**Step-by-Step:**

1. **Go to Google Search Console**
   - Visit: https://search.google.com/search-console
   - Click "Start Now" and sign in with Google

2. **Add Property**
   - Click "+ Add Property"
   - Choose "URL prefix" method
   - Enter: `https://cortex.vip`

3. **Verify Ownership (Choose ONE method)**

   **Method A: HTML File Upload (Easiest)**
   - Download the verification file Google provides
   - Place it in `/public/` folder
   - Deploy your site
   - Click "Verify" in Search Console

   **Method B: DNS TXT Record**
   - Add TXT record to your cortex.vip DNS
   - Wait 5-10 minutes
   - Click "Verify"

4. **Submit Sitemap**
   - After verification, go to "Sitemaps" in left menu
   - Enter: `sitemap.xml`
   - Click "Submit"

5. **Request Indexing for Key Pages**
   - Go to "URL Inspection" tool
   - Enter your homepage: `https://cortex.vip`
   - Click "Request Indexing"
   - Repeat for:
     - `/apps/compound-interest`
     - `/apps/budget`
     - `/apps/retirement-strategy`
     - `/apps/debt-paydown`
     - `/apps/net-worth`

---

### Action 4: Submit to Bing Webmaster Tools

**What:** Get indexed on Bing/Yahoo/DuckDuckGo
**When:** Same day as Google submission

**Step-by-Step:**

1. Visit: https://www.bing.com/webmasters
2. Click "Get Started"
3. Sign in with Microsoft account
4. Add your site: `https://cortex.vip`
5. Verify ownership (similar to Google)
6. Submit sitemap: `https://cortex.vip/sitemap.xml`

---

## 🟡 MEDIUM PRIORITY (WEEK 2-3)

### Action 5: Add Content to Calculator Pages

**Current Issue:** Your calculator pages have minimal text content. Google needs context.

**What to add to each calculator page:**

1. **H1 heading** with calculator name
2. **150-300 words** of descriptive text:
   - What the calculator does
   - Who it's for
   - Key features
   - How to use it
3. **Examples/Use Cases**
4. **FAQ section** (optional but helps)

**Example for Compound Interest:**

```jsx
<div className="max-w-4xl mx-auto px-6 py-8">
  <h1 className="text-4xl font-bold mb-4">Compound Interest Calculator</h1>
  <p className="text-lg text-slate-600 mb-4">
    Calculate how your investments grow over time with our free compound
    interest calculator. Whether you're planning for retirement, saving for
    a house, or building long-term wealth, understanding compound interest
    is crucial to reaching your financial goals.
  </p>
  <p className="text-slate-600 mb-8">
    Our calculator lets you see exactly how your money will grow with different
    interest rates, contribution amounts, and time periods. Visualize the power
    of compound growth with interactive charts and detailed projections.
  </p>

  {/* Your calculator component */}
  <CompoundInterest />

  <div className="mt-12">
    <h2 className="text-2xl font-bold mb-4">How to Use This Calculator</h2>
    <ol className="list-decimal list-inside space-y-2 text-slate-600">
      <li>Enter your initial investment amount</li>
      <li>Set your expected annual return rate</li>
      <li>Choose how often interest compounds (monthly, annually, etc.)</li>
      <li>Add regular contributions if you plan to invest more over time</li>
      <li>See your results in the interactive chart</li>
    </ol>
  </div>
</div>
```

**Do this for these calculators (in priority order):**
1. Compound Interest
2. Budget Planner
3. Debt Paydown
4. Retirement Strategy
5. Net Worth Tracker

---

### Action 6: Add Structured Data (Schema.org)

**What:** Help Google understand your content and show rich results
**Why:** Can get special calculator cards in search results

**Implementation for each calculator:**

Add this to the page component (inside the return statement):

```jsx
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "Compound Interest Calculator",
      "applicationCategory": "FinanceApplication",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      },
      "description": "Free online compound interest calculator with visual charts",
      "url": "https://cortex.vip/apps/compound-interest"
    })
  }}
/>
```

---

### Action 7: Internal Linking Strategy

**What:** Link between related calculators
**Why:** Helps Google crawl your site, improves user experience

**Examples:**
- Compound Interest page → link to Retirement Strategy
- Budget Planner → link to Net Worth Tracker
- Debt Paydown → link to Budget Planner

**Add these as "Related Tools" sections at the bottom of each calculator.**

---

## 🟢 LOW PRIORITY (MONTH 2-3)

### Action 8: Create OG Images

**What:** Social sharing images for each calculator
**Current:** You reference images that don't exist

**Specifications:**
- Size: 1200px × 630px
- Format: PNG or JPG
- Include: Calculator name, Cortex logo, simple visual

**Files needed:**
- `/public/og-image.png` (generic)
- `/public/og-compound-interest.png`
- `/public/og-budget.png`
- `/public/og-retirement.png`
- etc.

**Tools:** Canva, Figma, or hire on Fiverr ($5-20)

---

### Action 9: Performance Optimization

**Run Lighthouse audit:**
```bash
# In Chrome DevTools
1. Open DevTools (F12)
2. Go to "Lighthouse" tab
3. Click "Analyze page load"
```

**Target scores:**
- Performance: 90+
- SEO: 95+
- Accessibility: 90+

**Common fixes:**
- Optimize images (use Next.js Image component)
- Minimize JavaScript
- Enable compression
- Add lazy loading

---

### Action 10: Build Backlinks

**What:** Get other sites to link to your calculators
**Why:** Signals to Google that you're authoritative

**Strategies:**

1. **Submit to directories:**
   - Product Hunt
   - Hacker News (Show HN)
   - Reddit (r/personalfinance, r/financialindependence)
   - Finance forums

2. **Guest posting:**
   - Write articles for finance blogs
   - Include link to your calculators

3. **Partner with finance bloggers:**
   - Let them embed your calculators
   - They link back to you

4. **Create shareable content:**
   - "Best Free Financial Calculators 2026"
   - "10 Ways to Use a Budget Planner"
   - Link to your tools

---

## 📊 EXPECTED TIMELINE

| Week | Actions | Expected Results |
|------|---------|------------------|
| 1 | Deploy fixes, submit to Search Console, choose auth strategy | Site submitted to Google |
| 2-3 | Add content to pages, implement structured data | Google starts crawling |
| 4-6 | First pages get indexed | Start appearing in search results |
| 8-12 | Build backlinks, optimize content | Rankings improve, traffic grows |
| 3-6 months | Ongoing optimization | Steady organic traffic flow |

---

## 🎯 SUCCESS METRICS TO TRACK

**Set up Google Analytics:**
1. Create account at analytics.google.com
2. Add tracking code to your site
3. Monitor these metrics:

**Weekly:**
- Number of indexed pages (Search Console)
- Organic traffic (Analytics)
- Top landing pages
- Search queries driving traffic

**Monthly:**
- Ranking positions for target keywords
- Backlink growth (ahrefs.com or moz.com)
- Conversion rate (signups from organic traffic)

---

## 🎯 TARGET KEYWORDS BY PAGE

### Budget Planner
**Primary:** budget calculator, budget planner app, monthly budget tool
**Secondary:** zero based budget calculator, budget planning software

### Compound Interest Calculator
**Primary:** compound interest calculator, investment growth calculator
**Secondary:** compound interest formula, savings calculator, interest calculator

### Retirement Strategy
**Primary:** retirement calculator, retirement planning tool
**Secondary:** retirement savings calculator, when can i retire calculator

### Debt Paydown
**Primary:** debt payoff calculator, debt avalanche calculator
**Secondary:** debt snowball calculator, debt paydown planner

### Net Worth Tracker
**Primary:** net worth calculator, net worth tracker
**Secondary:** calculate net worth, track net worth

### Geographic Arbitrage
**Primary:** cost of living calculator, city comparison calculator
**Secondary:** geographic arbitrage calculator, move calculator

---

## 🚀 IMMEDIATE CHECKLIST

Print this and check off as you complete:

- [ ] Deploy all code changes to production
- [ ] Verify robots.txt is accessible at cortex.vip/robots.txt
- [ ] Verify sitemap is accessible at cortex.vip/sitemap.xml
- [ ] **DECIDE:** Public calculators or gated?
- [ ] Implement chosen auth strategy
- [ ] Sign up for Google Search Console
- [ ] Verify ownership of cortex.vip
- [ ] Submit sitemap to Google Search Console
- [ ] Request indexing for homepage + top 5 calculators
- [ ] Sign up for Bing Webmaster Tools
- [ ] Submit sitemap to Bing
- [ ] Set up Google Analytics
- [ ] Add content to Compound Interest calculator (200+ words)
- [ ] Add content to Budget Planner (200+ words)
- [ ] Add content to Debt Paydown calculator (200+ words)
- [ ] Create structured data for top 3 calculators
- [ ] Add internal links between related calculators
- [ ] Run Lighthouse audit and fix critical issues

---

## 🆘 TROUBLESHOOTING

### "My site still doesn't show up in Google after 2 weeks"

**Check:**
1. Is your site actually deployed and accessible?
2. Did you submit sitemap in Search Console?
3. Are calculators accessible without login?
4. Check "Coverage" report in Search Console for errors
5. Use URL Inspection tool to see what Google sees

**Common issues:**
- Pages still require authentication
- JavaScript errors blocking content
- Robots.txt blocking pages
- Sitemap has wrong URLs

### "Google is crawling but not indexing"

**Likely causes:**
1. Thin content (add more text!)
2. Duplicate content issues
3. No-index tags accidentally set
4. Server errors (check Status Codes in Search Console)

**Fix:**
- Add unique content to each page
- Check for no-index meta tags
- Verify sitemap URLs match actual pages

### "I'm indexed but not ranking"

**This is normal for new sites. To improve:**
1. Build more backlinks
2. Add more content
3. Optimize for specific keywords
4. Improve page speed
5. Get user engagement signals (shares, time on page)

---

## 📚 RESOURCES

**SEO Tools (Free):**
- Google Search Console: https://search.google.com/search-console
- Google Analytics: https://analytics.google.com
- Bing Webmaster: https://www.bing.com/webmasters
- PageSpeed Insights: https://pagespeed.web.dev/

**Learning Resources:**
- Google SEO Starter Guide: https://developers.google.com/search/docs/fundamentals/seo-starter-guide
- Schema.org Markup: https://schema.org/SoftwareApplication
- Next.js Metadata: https://nextjs.org/docs/app/building-your-application/optimizing/metadata

**Keyword Research:**
- Google Keyword Planner (free with Google Ads account)
- Answer the Public: https://answerthepublic.com/
- Google Trends: https://trends.google.com/

---

## 💡 FINAL NOTES

**Most Important:**
The #1 thing blocking your SEO right now is the authentication requirement. **Make your calculators public** and you'll see indexing happen within 1-2 weeks.

**Quick Wins:**
1. Deploy the fixes already made
2. Make calculators public
3. Submit to Search Console
4. Add 200 words of text to each calculator page

Do these 4 things and you'll be indexed within a month.

**Long-term Strategy:**
SEO is a marathon, not a sprint. You won't rank #1 overnight. But with consistent effort:
- Month 1-2: Get indexed
- Month 3-4: Start appearing on page 2-5 of results
- Month 6-12: Climb to page 1 for long-tail keywords
- Year 2+: Rank for competitive terms like "budget calculator"

**Questions?**
If you get stuck or need clarification on any step, you know where to find me!

---

**Document Version:** 1.0
**Last Updated:** January 11, 2026
**Next Review:** After first month of implementation
