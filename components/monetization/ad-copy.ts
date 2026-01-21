/**
 * Ad Copy Variations
 *
 * Framework: "Calculated Logic" - Avoid hype; use numbers and specific benefits.
 * Tone: Professional, minimalist, and direct.
 * Constraint: Never use "click here." Use action-oriented CTAs.
 */

export interface AdCopy {
  headline: string;
  body?: string;
  bodyLine2?: string;
  cta: string;
}

export interface AdCopySet {
  // 300x250 Medium Rectangle - Sidebar
  mediumRectangle: AdCopy[];
  // 728x90 Leaderboard - Header
  leaderboard: AdCopy[];
  // 320x100 Large Mobile Banner
  mobileBanner: AdCopy[];
  // 336x280 Below Results
  largeRectangle: AdCopy[];
}

/**
 * Ad copy organized by affiliate ID
 */
export const affiliateAdCopy: Record<string, AdCopySet> = {
  'rocket-money': {
    mediumRectangle: [
      {
        headline: 'Your Subscriptions Cost $237/mo',
        body: 'The average user finds 3+ forgotten',
        bodyLine2: 'subscriptions. What are you missing?',
        cta: 'Audit My Spending',
      },
      {
        headline: 'Stop Overpaying for Services',
        body: 'Rocket Money has saved users $500M+',
        bodyLine2: 'in canceled subscriptions.',
        cta: 'Find My Savings',
      },
      {
        headline: '74% of Users Cut a Subscription',
        body: 'Your budget deserves the same',
        bodyLine2: 'optimization as your portfolio.',
        cta: 'Optimize My Spend',
      },
    ],
    leaderboard: [
      {
        headline: 'Your calculator shows the goal. Rocket Money shows the leaks.',
        cta: 'Find Hidden Costs',
      },
      {
        headline: 'Average user saves $512/year by canceling forgotten subscriptions.',
        cta: 'Audit My Spending',
      },
      {
        headline: '3+ subscriptions you forgot about are billing you right now.',
        cta: 'Find My Savings',
      },
    ],
    mobileBanner: [
      {
        headline: 'Find $200+ in Forgotten Subs',
        cta: 'Audit Now',
      },
      {
        headline: 'Your Budget Has Leaks',
        cta: 'Find Savings',
      },
      {
        headline: 'Stop Overpaying Monthly',
        cta: 'Get Started',
      },
    ],
    largeRectangle: [
      {
        headline: 'Now Optimize Your Cash Flow',
        body: 'You just calculated your numbers.',
        bodyLine2: 'Rocket Money finds the $200+ monthly in subscriptions you forgot.',
        cta: 'Audit My Subscriptions',
      },
      {
        headline: 'Your Next Step: Reduce Expenses',
        body: 'The average Rocket Money user finds',
        bodyLine2: '3+ forgotten subscriptions draining their accounts.',
        cta: 'Find My Savings',
      },
      {
        headline: 'Turn This Number Into Action',
        body: 'Great calculation. Now automate your',
        bodyLine2: 'savings with subscription tracking.',
        cta: 'Optimize My Budget',
      },
    ],
  },

  'sofi': {
    mediumRectangle: [
      {
        headline: 'Your Savings Earn 0.01% APY?',
        body: 'SoFi members earn up to 4.00% APY',
        bodyLine2: 'with no account fees.',
        cta: 'Claim Your $325 Bonus',
      },
      {
        headline: 'Make Your Cash Work Harder',
        body: 'Direct deposit unlocks up to $325',
        bodyLine2: 'in bonus cash + premium APY.',
        cta: 'Open Free Account',
      },
      {
        headline: 'High-Yield + $325 Bonus',
        body: 'Your emergency fund deserves',
        bodyLine2: 'better than 0.01% APY.',
        cta: 'Upgrade Your Savings',
      },
    ],
    leaderboard: [
      {
        headline: 'Your calculation assumes growth. SoFi delivers 4.00% APY + $325 bonus.',
        cta: 'Claim Bonus',
      },
      {
        headline: 'Earning 0.01% APY? SoFi members earn up to 4.00% with no fees.',
        cta: 'Upgrade Your Rate',
      },
      {
        headline: '$325 cash bonus when you set up direct deposit. No minimum balance.',
        cta: 'Open Free Account',
      },
    ],
    mobileBanner: [
      {
        headline: 'Get $325 + 4.00% APY',
        cta: 'Claim Bonus',
      },
      {
        headline: 'Stop Earning 0.01%',
        cta: 'Upgrade Now',
      },
      {
        headline: '$325 Cash Bonus',
        cta: 'Get Started',
      },
    ],
    largeRectangle: [
      {
        headline: 'Your Numbers Need a Better Home',
        body: 'You just ran the calculation. Now put',
        bodyLine2: 'your cash in SoFi and earn 4.00% APY + $325 bonus.',
        cta: 'Claim Your $325',
      },
      {
        headline: 'Next Step: Optimize Your Rate',
        body: 'Your savings deserve better than',
        bodyLine2: '0.01% APY. SoFi offers 4.00% + $325 bonus.',
        cta: 'Open Free Account',
      },
      {
        headline: 'Make This Number Grow Faster',
        body: 'High-yield savings at 4.00% APY',
        bodyLine2: 'with no account fees or minimums.',
        cta: 'Upgrade Your Savings',
      },
    ],
  },

  'cash-app': {
    mediumRectangle: [
      {
        headline: 'Get $5 Free to Start',
        body: 'Send $5 to anyone and you both',
        bodyLine2: 'get $5. Use code: XWZVQ7P',
        cta: 'Claim Your $5',
      },
      {
        headline: 'Your First Investment: $5 Free',
        body: 'Cash App gives you $5 when you',
        bodyLine2: 'send your first $5.',
        cta: 'Get Started Free',
      },
      {
        headline: 'Start With $5 on Us',
        body: 'No catches. Send $5, get $5.',
        bodyLine2: 'Code: XWZVQ7P',
        cta: 'Download Cash App',
      },
    ],
    leaderboard: [
      {
        headline: 'Get $5 free when you send your first $5. Code: XWZVQ7P',
        cta: 'Claim $5',
      },
      {
        headline: 'Your next calculation: free money. Get $5 to start.',
        cta: 'Get $5 Free',
      },
      {
        headline: 'Small start, big returns. $5 free with code XWZVQ7P',
        cta: 'Download Free',
      },
    ],
    mobileBanner: [
      {
        headline: '$5 Free With Code XWZVQ7P',
        cta: 'Claim Now',
      },
      {
        headline: 'Send $5, Get $5 Free',
        cta: 'Download',
      },
      {
        headline: 'Get $5 to Start',
        cta: 'Claim Free',
      },
    ],
    largeRectangle: [
      {
        headline: 'Start Your Next Move With $5',
        body: 'You just calculated your plan.',
        bodyLine2: 'Cash App gives you $5 free when you send $5.',
        cta: 'Claim Your $5',
      },
      {
        headline: 'Every Dollar Counts',
        body: 'Get $5 free to add to your plan.',
        bodyLine2: 'Code: XWZVQ7P',
        cta: 'Download Cash App',
      },
      {
        headline: 'Your Free $5 Awaits',
        body: 'Send your first $5, get $5 back.',
        bodyLine2: 'No strings attached.',
        cta: 'Get Started',
      },
    ],
  },

  'rakuten': {
    mediumRectangle: [
      {
        headline: 'You Already Shop Online',
        body: 'Get 3-15% cash back at 3,500+',
        bodyLine2: 'stores you already use.',
        cta: 'Calculate My Rewards',
      },
      {
        headline: 'Stop Leaving Money Behind',
        body: 'Average member earns $143/year',
        bodyLine2: 'in cash back on normal purchases.',
        cta: 'Start Earning Cash',
      },
      {
        headline: 'Cash Back on Autopilot',
        body: 'Shop like normal. Rakuten handles',
        bodyLine2: 'the rest. No coupons required.',
        cta: 'Activate Cash Back',
      },
    ],
    leaderboard: [
      {
        headline: 'Your purchases already qualify for cash back. Average member earns $143/year.',
        cta: 'Start Earning',
      },
      {
        headline: '3,500+ stores give you 3-15% cash back. You just have to activate it.',
        cta: 'Calculate My Rewards',
      },
      {
        headline: 'Amazon, Target, Nike—all offer cash back. Are you collecting it?',
        cta: 'Activate Cash Back',
      },
    ],
    mobileBanner: [
      {
        headline: 'Earn Cash on Purchases',
        cta: 'Activate Now',
      },
      {
        headline: '3-15% Back at 3,500+ Stores',
        cta: 'Start Earning',
      },
      {
        headline: '$143/yr Average Earnings',
        cta: 'Get Cash Back',
      },
    ],
    largeRectangle: [
      {
        headline: 'Now Reduce Your Spending',
        body: 'Great calculation. Now get 3-15%',
        bodyLine2: 'cash back on purchases you already make.',
        cta: 'Activate Cash Back',
      },
      {
        headline: 'Your Next Optimization',
        body: 'Average Rakuten member earns',
        bodyLine2: '$143/year. Your shopping qualifies.',
        cta: 'Calculate My Rewards',
      },
      {
        headline: 'Free Money on Your Purchases',
        body: '3,500+ stores. No coupons needed.',
        bodyLine2: 'Just shop and earn.',
        cta: 'Start Earning Cash',
      },
    ],
  },

  'ibotta': {
    mediumRectangle: [
      {
        headline: 'Your Groceries Cost Too Much',
        body: 'Ibotta users save $150+/year at',
        bodyLine2: '500,000+ stores and restaurants.',
        cta: 'Download Free',
      },
      {
        headline: 'Stop Paying Full Price',
        body: 'Scan receipts. Get cash back.',
        bodyLine2: 'It takes 30 seconds.',
        cta: 'Start Saving Now',
      },
      {
        headline: 'Cash Back on Groceries',
        body: '500,000+ locations pay you back.',
        bodyLine2: 'No coupons to clip.',
        cta: 'Get Ibotta Free',
      },
    ],
    leaderboard: [
      {
        headline: 'Your grocery bill just got smaller. Ibotta gives cash back at 500,000+ locations.',
        cta: 'Download Free',
      },
      {
        headline: 'Scan your receipt. Get cash. Users save $150+/year on groceries.',
        cta: 'Start Saving',
      },
      {
        headline: 'Why pay full price? Cash back on things you already buy.',
        cta: 'Get Ibotta',
      },
    ],
    mobileBanner: [
      {
        headline: 'Save $150+/yr on Groceries',
        cta: 'Download Free',
      },
      {
        headline: 'Cash Back at 500K+ Stores',
        cta: 'Start Saving',
      },
      {
        headline: 'Stop Paying Full Price',
        cta: 'Get Ibotta',
      },
    ],
    largeRectangle: [
      {
        headline: 'Reduce Your Monthly Costs',
        body: 'You calculated your budget.',
        bodyLine2: 'Now reduce it with cash back on groceries.',
        cta: 'Download Ibotta Free',
      },
      {
        headline: 'Your Grocery Bill: Optimized',
        body: 'Ibotta users save $150+/year.',
        bodyLine2: 'Scan receipts. Get cash.',
        cta: 'Start Saving Now',
      },
      {
        headline: 'Next Step: Lower Expenses',
        body: '500,000+ locations give cash back.',
        bodyLine2: 'No coupons required.',
        cta: 'Get Ibotta Free',
      },
    ],
  },

  'nordvpn': {
    mediumRectangle: [
      {
        headline: 'Your Financial Data Is Exposed',
        body: '14M+ users protect their banking',
        bodyLine2: 'and investments with NordVPN.',
        cta: 'Secure Your Data',
      },
      {
        headline: 'Public WiFi = Financial Risk',
        body: 'Every login on open WiFi exposes',
        bodyLine2: 'your accounts. Encrypt everything.',
        cta: 'Protect My Accounts',
      },
      {
        headline: 'Your Wealth Needs Protection',
        body: 'Building assets? Protect access',
        bodyLine2: 'to them with military-grade encryption.',
        cta: 'Secure My Finances',
      },
    ],
    leaderboard: [
      {
        headline: 'You protect your money. NordVPN protects access to it. 14M+ users trust us.',
        cta: 'Secure Your Data',
      },
      {
        headline: 'Every bank login on public WiFi is a risk. Encrypt your connection.',
        cta: 'Protect My Accounts',
      },
      {
        headline: 'Building wealth? Protect access to your accounts with NordVPN.',
        cta: 'Get Protected',
      },
    ],
    mobileBanner: [
      {
        headline: 'Protect Your Bank Logins',
        cta: 'Get NordVPN',
      },
      {
        headline: 'Encrypt Your Finances',
        cta: 'Secure Now',
      },
      {
        headline: '14M+ Users Trust NordVPN',
        cta: 'Get Protected',
      },
    ],
    largeRectangle: [
      {
        headline: 'Protect What You Just Calculated',
        body: 'Your financial data is valuable.',
        bodyLine2: 'NordVPN encrypts every login and transaction.',
        cta: 'Secure Your Data',
      },
      {
        headline: 'Your Wealth Needs Security',
        body: '14M+ users protect their financial',
        bodyLine2: 'accounts with NordVPN encryption.',
        cta: 'Protect My Accounts',
      },
      {
        headline: 'Financial Security Starts Here',
        body: 'Public WiFi exposes your logins.',
        bodyLine2: 'Encrypt everything with NordVPN.',
        cta: 'Get Protected Now',
      },
    ],
  },

  'weward': {
    mediumRectangle: [
      {
        headline: 'Your Steps = Cash',
        body: 'Average user earns $75/year just',
        bodyLine2: 'by walking. You already walk.',
        cta: 'Get Paid to Walk',
      },
      {
        headline: 'The Easiest Side Income',
        body: 'No work required. Just walk and',
        bodyLine2: 'WeWard converts steps to rewards.',
        cta: 'Start Earning Now',
      },
      {
        headline: 'Monetize Your Movement',
        body: 'You walk 5,000+ steps daily.',
        bodyLine2: 'Why not get paid for it?',
        cta: 'Download WeWard',
      },
    ],
    leaderboard: [
      {
        headline: 'You already walk. WeWard pays you for it. Average user earns $75/year.',
        cta: 'Get Paid to Walk',
      },
      {
        headline: 'Your daily steps are worth money. Convert them to rewards with WeWard.',
        cta: 'Start Earning',
      },
      {
        headline: '5,000 steps/day = free money. No extra effort required.',
        cta: 'Download Free',
      },
    ],
    mobileBanner: [
      {
        headline: 'Earn $75/yr Walking',
        cta: 'Download Free',
      },
      {
        headline: 'Your Steps = Money',
        cta: 'Start Earning',
      },
      {
        headline: 'Get Paid to Walk',
        cta: 'Try WeWard',
      },
    ],
    largeRectangle: [
      {
        headline: 'Add Passive Income to Your Plan',
        body: 'You already walk every day.',
        bodyLine2: 'WeWard converts those steps into cash rewards.',
        cta: 'Get Paid to Walk',
      },
      {
        headline: 'The Zero-Effort Side Hustle',
        body: 'Average user earns $75/year.',
        bodyLine2: 'Just walk and earn.',
        cta: 'Start Earning Now',
      },
      {
        headline: 'Your Steps Are Worth Money',
        body: 'Download WeWard. Walk like normal.',
        bodyLine2: 'Get paid.',
        cta: 'Download Free',
      },
    ],
  },

  'chase-freedom': {
    mediumRectangle: [
      {
        headline: '$200 Bonus + Unlimited Cash',
        body: '$0 annual fee. 5% on rotating',
        bodyLine2: 'categories. 1% on everything else.',
        cta: 'Apply Now',
      },
      {
        headline: 'The Math-Friendly Card',
        body: '$200 bonus. No annual fee.',
        bodyLine2: 'Unlimited 1.5% cash back.',
        cta: 'Claim $200 Bonus',
      },
      {
        headline: 'Zero Cost. Real Rewards.',
        body: '$0 annual fee means your rewards',
        bodyLine2: 'are pure profit.',
        cta: 'Start Earning Cash',
      },
    ],
    leaderboard: [
      {
        headline: '$200 bonus + unlimited cash back. $0 annual fee. Pure profit.',
        cta: 'Apply Now',
      },
      {
        headline: 'No annual fee means every dollar of cash back is yours. Get $200 to start.',
        cta: 'Claim Bonus',
      },
      {
        headline: '5% rotating categories + 1% everything = optimized rewards. $0 fee.',
        cta: 'Start Earning',
      },
    ],
    mobileBanner: [
      {
        headline: '$200 Bonus. $0 Fee.',
        cta: 'Apply Now',
      },
      {
        headline: 'Unlimited Cash Back',
        cta: 'Claim $200',
      },
      {
        headline: '5% + 1% Cash Back',
        cta: 'Get Started',
      },
    ],
    largeRectangle: [
      {
        headline: 'Earn on Every Purchase',
        body: 'You just calculated your spending.',
        bodyLine2: 'Now earn $200 bonus + unlimited cash back. $0 fee.',
        cta: 'Apply Now',
      },
      {
        headline: 'Optimize Your Card Rewards',
        body: '$200 sign-up bonus. 5% rotating',
        bodyLine2: 'categories. 1% on everything. $0 annual fee.',
        cta: 'Claim $200 Bonus',
      },
      {
        headline: 'Your Spending Should Pay You',
        body: 'Chase Freedom: $0 annual fee',
        bodyLine2: 'means pure profit on every purchase.',
        cta: 'Start Earning Cash',
      },
    ],
  },

  'capital-one-venture-x': {
    mediumRectangle: [
      {
        headline: '2X Miles on Everything',
        body: 'Every dollar = 2 miles. Plus $300',
        bodyLine2: 'annual travel credit covers the fee.',
        cta: 'Start Your Journey',
      },
      {
        headline: 'Your Goals Need a Destination',
        body: 'Earn unlimited 2X miles. Use them',
        bodyLine2: 'to reward yourself for hitting targets.',
        cta: 'Apply Now',
      },
      {
        headline: 'Premium Rewards. Net-Zero Fee.',
        body: '$300 travel credit + 10K anniversary',
        bodyLine2: 'miles offset the $395 annual fee.',
        cta: 'Calculate Your Rewards',
      },
    ],
    leaderboard: [
      {
        headline: 'Unlimited 2X miles on every purchase. $300 credit offsets the fee.',
        cta: 'Apply Now',
      },
      {
        headline: 'Your financial goals deserve a reward. Earn 2X miles on everything.',
        cta: 'Start Earning Miles',
      },
      {
        headline: '$300 travel credit + 10K annual miles = net-positive premium card.',
        cta: 'Calculate Your Rewards',
      },
    ],
    mobileBanner: [
      {
        headline: '2X Miles + $300 Credit',
        cta: 'Apply Now',
      },
      {
        headline: 'Unlimited Travel Rewards',
        cta: 'Get Started',
      },
      {
        headline: 'Earn on Every Purchase',
        cta: 'Learn More',
      },
    ],
    largeRectangle: [
      {
        headline: 'Reward Your Financial Progress',
        body: 'You just planned your numbers.',
        bodyLine2: 'Now earn 2X miles on every dollar you spend.',
        cta: 'Start Your Journey',
      },
      {
        headline: 'Your Goals Deserve a Destination',
        body: 'Unlimited 2X miles. $300 travel credit.',
        bodyLine2: '10K anniversary miles. Premium benefits.',
        cta: 'Apply Now',
      },
      {
        headline: 'Make Every Purchase Count',
        body: 'Capital One Venture X: 2X miles',
        bodyLine2: 'on everything, everywhere.',
        cta: 'Calculate Your Rewards',
      },
    ],
  },

  'discover-card': {
    mediumRectangle: [
      {
        headline: 'Get $100 for Your First Purchase',
        body: 'We both get $100 when you apply.',
        bodyLine2: 'No annual fee. Ever.',
        cta: 'Claim My Bonus',
      },
      {
        headline: '$100 Bonus. $0 Fee. Simple.',
        body: '5% cash back on rotating categories.',
        bodyLine2: '1% on everything else.',
        cta: 'Apply Now',
      },
      {
        headline: 'No Annual Fee. Period.',
        body: '$100 bonus + matched cash back',
        bodyLine2: 'your first year doubles your rewards.',
        cta: 'Get $100 Free',
      },
    ],
    leaderboard: [
      {
        headline: '$100 bonus on your first purchase. $0 annual fee. We both win.',
        cta: 'Claim $100',
      },
      {
        headline: 'First year cash back match doubles your rewards. Plus $100 bonus.',
        cta: 'Apply Now',
      },
      {
        headline: '5% rotating + 1% everything + $100 bonus + $0 fee = smart math.',
        cta: 'Get Started',
      },
    ],
    mobileBanner: [
      {
        headline: 'Get $100 on 1st Purchase',
        cta: 'Claim Bonus',
      },
      {
        headline: '$0 Fee. $100 Bonus.',
        cta: 'Apply Now',
      },
      {
        headline: 'Double Cash Back Year 1',
        cta: 'Get Started',
      },
    ],
    largeRectangle: [
      {
        headline: 'Start Earning Immediately',
        body: '$100 bonus on your first purchase.',
        bodyLine2: '$0 annual fee. Cash back match doubles year one.',
        cta: 'Claim My $100',
      },
      {
        headline: 'The No-Nonsense Rewards Card',
        body: 'You calculated the numbers.',
        bodyLine2: 'Discover gives you $100 + no annual fee. Simple.',
        cta: 'Apply Now',
      },
      {
        headline: 'Smart Money Deserves Smart Rewards',
        body: '5% rotating categories. 1% everything.',
        bodyLine2: '$100 bonus. $0 fee.',
        cta: 'Get $100 Free',
      },
    ],
  },

  'amazon-prime-card': {
    mediumRectangle: [
      {
        headline: '$150 Amazon Gift Card Instantly',
        body: 'Approved? $150 hits your account',
        bodyLine2: 'immediately. No waiting.',
        cta: 'Claim Your $150',
      },
      {
        headline: '5% Back on Amazon. Always.',
        body: 'Prime members earn 5% on every',
        bodyLine2: 'Amazon purchase. No limits.',
        cta: 'Get $150 Instantly',
      },
      {
        headline: 'Instant $150 + 5% Back',
        body: 'If you shop Amazon, this card',
        bodyLine2: 'pays for itself immediately.',
        cta: 'Apply Now',
      },
    ],
    leaderboard: [
      {
        headline: '$150 Amazon gift card instantly upon approval. 5% back on all Amazon purchases.',
        cta: 'Claim $150',
      },
      {
        headline: 'If you spend on Amazon, you should be earning 5% back. Plus $150 instant.',
        cta: 'Apply Now',
      },
      {
        headline: 'No waiting. $150 gift card the moment you are approved. 5% back ongoing.',
        cta: 'Get $150 Instantly',
      },
    ],
    mobileBanner: [
      {
        headline: '$150 Instantly on Approval',
        cta: 'Claim Now',
      },
      {
        headline: '5% Back on Amazon',
        cta: 'Apply Now',
      },
      {
        headline: 'Instant $150 Gift Card',
        cta: 'Get Started',
      },
    ],
    largeRectangle: [
      {
        headline: 'Add $150 to Your Budget Now',
        body: 'Approved? $150 Amazon gift card',
        bodyLine2: 'hits your account instantly. No waiting.',
        cta: 'Claim Your $150',
      },
      {
        headline: 'Your Amazon Spending Should Pay',
        body: '5% back on every Amazon purchase.',
        bodyLine2: 'Plus $150 instant sign-up bonus.',
        cta: 'Apply Now',
      },
      {
        headline: 'Instant Reward. Ongoing Returns.',
        body: 'Get $150 immediately. Then earn',
        bodyLine2: '5% on every Amazon order forever.',
        cta: 'Get $150 Instantly',
      },
    ],
  },
};

/**
 * Get ad copy for a specific affiliate and size
 */
export function getAdCopy(
  affiliateId: string,
  size: keyof AdCopySet,
  variationIndex?: number
): AdCopy | null {
  const copySets = affiliateAdCopy[affiliateId];
  if (!copySets) return null;

  const copies = copySets[size];
  if (!copies || copies.length === 0) return null;

  const index = variationIndex !== undefined
    ? variationIndex % copies.length
    : Math.floor(Math.random() * copies.length);

  return copies[index];
}

/**
 * Get a random variation index for an affiliate
 */
export function getRandomVariation(affiliateId: string, size: keyof AdCopySet): number {
  const copySets = affiliateAdCopy[affiliateId];
  if (!copySets) return 0;

  const copies = copySets[size];
  if (!copies) return 0;

  return Math.floor(Math.random() * copies.length);
}
