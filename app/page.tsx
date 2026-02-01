import {
  Zap,
  ArrowRight,
  Brain,
  Calculator,
  Building2,
  TrendingUp,
  Car,
  Scale,
  Leaf,
  GraduationCap,
  Compass,
  Check,
  Lock,
  Sparkles,
  Landmark,
  TrendingDown,
  MapPin,
  Wallet,
  BarChart3,
  Dices,
  BookOpen
} from 'lucide-react';
import LatestArticles from '@/components/home/LatestArticles';
import MobileNav from '@/components/navigation/MobileNav';

/**
 * LANDING PAGE (Root Route: /)
 * Comprehensive platform landing page for Cortex Technologies
 * Positions Cortex as a decision-support platform for life's biggest decisions
 */
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 scroll-smooth">

      {/* NAVIGATION */}
      <nav className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-6 flex items-center justify-between">
        <a href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="bg-indigo-600 p-1.5 rounded-lg text-white">
            <Brain size={20} />
          </div>
          <span className="font-black text-2xl tracking-tight">Cortex</span>
        </a>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          <a href="/articles" className="text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors flex items-center gap-1.5">
            <BookOpen size={16} />
            Articles
          </a>
          <a href="/login" className="text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors">
            Sign In
          </a>
          <a
            href="/login"
            className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-md active:scale-95"
          >
            Get Started
          </a>
        </div>

        {/* Mobile Navigation */}
        <MobileNav />
      </nav>

      {/* HERO SECTION */}
      <main className="max-w-7xl mx-auto px-6 pt-20 pb-32 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-6 border border-indigo-100">
            <Brain size={14} />
            Cortex Technologies
          </div>
          <h1 className="text-5xl lg:text-7xl font-black text-slate-900 leading-[1.1] tracking-tight mb-8">
            Tools for thinking clearly about life's biggest decisions.
          </h1>
          <p className="text-xl text-slate-500 font-medium mb-10 leading-relaxed max-w-2xl mx-auto">
            Interactive applications that turn complexity into clarity—starting with finance, expanding into health, education, and long-term life planning.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-4 justify-center">
            <a
              href="#tools"
              className="w-full sm:w-auto bg-indigo-600 text-white px-10 py-5 rounded-2xl font-black text-lg hover:bg-indigo-700 transition-all shadow-xl hover:shadow-indigo-200 flex items-center justify-center gap-2 group"
            >
              Explore the Tools
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </a>
            <a
              href="/login"
              className="w-full sm:w-auto bg-white text-slate-600 border border-slate-200 px-10 py-5 rounded-2xl font-black text-lg hover:bg-slate-50 transition-all"
            >
              Start Free
            </a>
          </div>
          <p className="text-sm text-slate-400 font-medium mt-6">
            Upgrade when the math matters
          </p>
        </div>
      </main>

      {/* WHAT IS CORTEX */}
      <section className="bg-slate-50 py-32 border-y border-slate-200">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-slate-900 mb-6 tracking-tight">What Is Cortex?</h2>
            <p className="text-xl text-slate-600 font-medium leading-relaxed max-w-3xl mx-auto">
              Cortex is a decision-support platform.
            </p>
          </div>

          <div className="bg-white p-10 lg:p-16 rounded-[3rem] border border-slate-200 shadow-sm space-y-8">
            <p className="text-lg text-slate-600 font-medium leading-relaxed">
              Life decisions don't fail because people are careless.<br />
              They fail because the math is invisible, the timelines are long, and the consequences arrive quietly.
            </p>
            <p className="text-lg text-slate-600 font-medium leading-relaxed">
              Cortex builds interactive models that let you see outcomes before you live them.
            </p>

            <div className="grid md:grid-cols-2 gap-6 pt-8">
              {[
                "Real-world financial logic",
                "Clean, explorable interfaces",
                "Forward-looking scenarios",
                "Human-centered design"
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="bg-indigo-100 text-indigo-600 p-1.5 rounded-lg mt-0.5">
                    <Check size={16} strokeWidth={3} />
                  </div>
                  <p className="text-slate-700 font-semibold">{item}</p>
                </div>
              ))}
            </div>

            <div className="pt-8 border-t border-slate-100">
              <p className="text-lg text-slate-900 font-black">
                The goal isn't prediction. The goal is better judgment.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CURRENT TOOLS - CORTEX FINANCE */}
      <section id="tools" className="py-32 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-4 border border-emerald-100">
              <Sparkles size={14} />
              Available Now
            </div>
            <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Cortex Finance</h2>
            <p className="text-xl text-slate-500 font-medium max-w-3xl mx-auto">
              Our first suite focuses on personal and small-business finance—areas where small decisions compound dramatically over time.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {[
              {
                icon: <Calculator />,
                title: "Compound Interest Calculator",
                description: "See how your money grows over time with different contribution strategies and rates.",
                isFree: true,
                link: "/apps/compound-interest"
              },
              {
                icon: <BarChart3 />,
                title: "Index Fund Growth Visualizer",
                description: "Simulate historical returns and volatility for popular index ETFs like VOO, VTI, VT, and QQQM.",
                isFree: true,
                link: "/apps/index-fund-visualizer"
              },
              {
                icon: <Wallet />,
                title: "Household Budgeting System",
                description: "Allocate resources under constraints with AI-powered optimization, tension metrics, and flexibility analysis.",
                isFree: true,
                link: "/apps/budget"
              },
              {
                icon: <Dices />,
                title: "Gambling Spend Redirect",
                description: "See the wealth gap between playing the odds and owning the market. Redirect gambling spend toward building real wealth.",
                isFree: true,
                link: "/apps/gambling-redirect"
              },
              {
                icon: <TrendingUp />,
                title: "Retirement Strategy Engine",
                description: "Advanced decumulation planning with Roth conversions, tax optimization, and sequence risk analysis.",
                isFree: true,
                link: "/apps/retirement-strategy"
              },
              {
                icon: <Building2 />,
                title: "S-Corp Investment Optimizer",
                description: "Maximize retirement contributions while optimizing your S-Corp owner compensation.",
                isFree: false
              },
              {
                icon: <Car />,
                title: "Car Affordability Calculator",
                description: "Understand the true cost of vehicle ownership including depreciation and opportunity cost.",
                isFree: false
              },
              {
                icon: <Scale />,
                title: "S-Corp Optimizer",
                description: "Calculate self-employment tax savings and find your ideal salary/distribution split.",
                isFree: false
              },
              {
                icon: <Landmark />,
                title: "Rent vs Buy Reality Engine",
                description: "Compare renting vs buying with opportunity cost, maintenance drag, mobility risk, and tax treatment.",
                isFree: false
              },
              {
                icon: <TrendingDown />,
                title: "Debt Paydown Strategy Optimizer",
                description: "Compare avalanche vs snowball strategies with psychological weighting and opportunity cost analysis.",
                isFree: false
              },
              {
                icon: <MapPin />,
                title: "Geographic Arbitrage Calculator",
                description: "Calculate wealth-building potential by comparing income, taxes, and cost of living across all 50 U.S. states.",
                isFree: false
              },
              {
                icon: <Compass />,
                title: "Net Worth Engine",
                description: "Track assets and liabilities, analyze liquidity and momentum, and visualize your financial trajectory.",
                isFree: false
              }
            ].map((tool, i) => (
              <div
                key={i}
                className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm hover:-translate-y-2 hover:shadow-xl transition-all duration-300 group relative"
              >
                {tool.isFree && (
                  <div className="absolute -top-3 -right-3 bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider shadow-lg">
                    Free
                  </div>
                )}
                <div className="bg-indigo-50 text-indigo-600 p-4 rounded-2xl w-fit mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  {tool.icon}
                </div>
                <div>
                  <h4 className="text-lg font-black text-slate-800 mb-2">{tool.title}</h4>
                  <p className="text-slate-500 font-medium leading-relaxed text-sm mb-4">
                    {tool.description}
                  </p>
                  {tool.isFree && tool.link && (
                    <a
                      href={tool.link}
                      className="inline-flex items-center gap-1.5 text-indigo-600 font-bold text-sm hover:gap-2 transition-all"
                    >
                      Try for Free
                      <ArrowRight size={14} />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mb-12">
            <a
              href="/login"
              className="inline-flex items-center gap-2 bg-indigo-600 text-white px-10 py-5 rounded-2xl font-black text-lg hover:bg-indigo-700 transition-all shadow-xl hover:shadow-indigo-200 group"
            >
              Try it free
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </a>
          </div>

          <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-200 text-center">
            <p className="text-slate-600 font-medium mb-6 text-lg">
              Each tool is built to answer one question clearly:
            </p>
            <p className="text-2xl font-black text-slate-900">
              "If I choose this path, what actually happens?"
            </p>
            <div className="flex flex-wrap items-center justify-center gap-6 mt-8 text-sm text-slate-500 font-semibold">
              <span className="flex items-center gap-2">
                <Check size={16} className="text-emerald-500" strokeWidth={3} />
                No jargon
              </span>
              <span className="flex items-center gap-2">
                <Check size={16} className="text-emerald-500" strokeWidth={3} />
                No spreadsheets from 2009
              </span>
              <span className="flex items-center gap-2">
                <Check size={16} className="text-emerald-500" strokeWidth={3} />
                No financial theater
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* FUTURE VISION */}
      <section className="bg-slate-50 py-32 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-purple-50 text-purple-700 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-4 border border-purple-100">
              <Compass size={14} />
              Coming Soon
            </div>
            <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">What We're Building Next</h2>
            <p className="text-xl text-slate-500 font-medium max-w-3xl mx-auto">
              Cortex is expanding into additional life domains where decisions are frequent, emotional, and long-term.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Leaf />,
                title: "Health",
                description: "Behavior tradeoffs, habit impact modeling, and longevity planning tools."
              },
              {
                icon: <GraduationCap />,
                title: "Education",
                description: "ROI of learning paths, certifications, degrees, and skill stack optimization."
              },
              {
                icon: <Compass />,
                title: "Life Planning",
                description: "Time allocation analysis, career pivots, lifestyle tradeoffs, and optionality preservation."
              }
            ].map((sector, i) => (
              <div key={i} className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm">
                <div className="bg-purple-50 text-purple-600 p-4 rounded-2xl w-fit mb-6">
                  {sector.icon}
                </div>
                <h4 className="text-xl font-black mb-3 text-slate-800">{sector.title}</h4>
                <p className="text-slate-500 font-medium leading-relaxed">{sector.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-lg text-slate-600 font-medium">
              Each sector follows the same principle:
            </p>
            <p className="text-2xl font-black text-slate-900 mt-3">
              Make invisible consequences visible—early enough to matter.
            </p>
          </div>
        </div>
      </section>

      {/* WHY CORTEX */}
      <section className="py-32">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Why Cortex Exists</h2>
          </div>

          <div className="space-y-6">
            {[
              { left: "Most tools give answers.", right: "Cortex gives context." },
              { left: "Most platforms optimize for engagement.", right: "Cortex optimizes for clarity." },
              { left: "Most advice is static.", right: "Cortex is interactive, scenario-based, and personal." }
            ].map((item, i) => (
              <div
                key={i}
                className="bg-white p-8 lg:p-10 rounded-[2.5rem] border border-slate-200 shadow-sm grid md:grid-cols-2 gap-6 items-center"
              >
                <p className="text-lg text-slate-400 font-medium">{item.left}</p>
                <p className="text-lg text-slate-900 font-black">{item.right}</p>
              </div>
            ))}
          </div>

          <div className="bg-indigo-600 p-10 lg:p-16 rounded-[3rem] shadow-xl mt-12 text-center">
            <p className="text-xl text-indigo-100 font-medium mb-4">
              You don't need another opinion.
            </p>
            <p className="text-3xl lg:text-4xl text-white font-black">
              You need to understand the system you're operating inside.
            </p>
          </div>
        </div>
      </section>

      {/* LATEST ARTICLES */}
      <LatestArticles />

      {/* PRICING PREVIEW */}
      <section className="bg-slate-50 py-32 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Simple, Honest Pricing</h2>
            <p className="text-xl text-slate-500 font-medium">
              Choose the plan that matches where you are today.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* FREE */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
              <div className="mb-8">
                <h3 className="text-2xl font-black text-slate-900 mb-2">Free</h3>
                <p className="text-slate-500 font-medium text-sm mb-6">For exploration and curiosity.</p>
                <div className="mb-6">
                  <span className="text-5xl font-black text-slate-900">$0</span>
                  <span className="text-slate-500 font-medium">/forever</span>
                </div>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  "Access to core calculators",
                  "Limited scenarios",
                  "Ideal for learning"
                ].map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm">
                    <Check size={16} className="text-emerald-500 mt-0.5" strokeWidth={3} />
                    <span className="text-slate-600 font-medium">{feature}</span>
                  </li>
                ))}
              </ul>
              <a
                href="/login"
                className="block w-full bg-slate-100 text-slate-900 px-6 py-3.5 rounded-xl font-bold text-center hover:bg-slate-200 transition-all"
              >
                Start Free
              </a>
            </div>

            {/* FINANCE PRO */}
            <div className="bg-white p-8 rounded-[2.5rem] border-2 border-indigo-600 shadow-xl relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="bg-indigo-600 text-white px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">
                  Most Popular
                </span>
              </div>
              <div className="mb-8">
                <h3 className="text-2xl font-black text-slate-900 mb-2">Finance Pro</h3>
                <p className="text-slate-500 font-medium text-sm mb-6">For people who want precision around money.</p>
                <div className="mb-6">
                  <span className="text-5xl font-black text-slate-900">$9</span>
                  <span className="text-slate-500 font-medium">/month</span>
                </div>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  "Full access to all Finance tools",
                  "Advanced scenarios",
                  "Deeper projections",
                  "Strategy modeling"
                ].map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm">
                    <Check size={16} className="text-indigo-600 mt-0.5" strokeWidth={3} />
                    <span className="text-slate-600 font-medium">{feature}</span>
                  </li>
                ))}
              </ul>
              <a
                href="/pricing"
                className="block w-full bg-indigo-600 text-white px-6 py-3.5 rounded-xl font-bold text-center hover:bg-indigo-700 transition-all shadow-md"
              >
                Get Finance Pro
              </a>
            </div>

            {/* ELITE */}
            <div className="bg-gradient-to-br from-purple-600 to-indigo-600 p-8 rounded-[2.5rem] shadow-xl text-white">
              <div className="mb-8">
                <h3 className="text-2xl font-black mb-2">Elite</h3>
                <p className="text-purple-100 font-medium text-sm mb-6">For people who want a thinking system.</p>
                <div className="mb-6">
                  <span className="text-5xl font-black">$29</span>
                  <span className="text-purple-100 font-medium">/month</span>
                </div>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  "All current & future apps",
                  "Finance, Health, Education",
                  "Life planning tools",
                  "New sectors as they launch"
                ].map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm">
                    <Check size={16} className="text-white mt-0.5" strokeWidth={3} />
                    <span className="text-purple-50 font-medium">{feature}</span>
                  </li>
                ))}
              </ul>
              <a
                href="/pricing"
                className="block w-full bg-white text-purple-600 px-6 py-3.5 rounded-xl font-bold text-center hover:bg-purple-50 transition-all shadow-md"
              >
                Get Elite
              </a>
              <p className="text-sm text-purple-100 font-medium mt-6 text-center">
                Clarity compounds.
              </p>
            </div>
          </div>

          <div className="text-center mt-12">
            <a
              href="/pricing"
              className="inline-flex items-center gap-2 text-indigo-600 font-bold hover:gap-3 transition-all"
            >
              View full pricing details
              <ArrowRight size={16} />
            </a>
          </div>
        </div>
      </section>

      {/* HOW CORTEX IS DIFFERENT */}
      <section className="py-32">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">How Cortex Is Different</h2>
          </div>

          <div className="bg-white p-10 lg:p-16 rounded-[3rem] border border-slate-200 shadow-sm">
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              {[
                { label: "Not advice", icon: <span className="text-3xl">📋</span> },
                { label: "Not a course", icon: <span className="text-3xl">🎓</span> },
                { label: "Not a spreadsheet farm", icon: <span className="text-3xl">📊</span> }
              ].map((item, i) => (
                <div key={i} className="text-center">
                  <div className="text-4xl mb-3">{item.icon}</div>
                  <p className="text-slate-400 font-semibold line-through">{item.label}</p>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-100 pt-12 space-y-6 text-center">
              <p className="text-xl text-slate-600 font-medium">
                It's a <span className="text-slate-900 font-black">cognitive assistant</span>—a place where logic, time, and consequence meet.
              </p>
              <p className="text-lg text-slate-600 font-medium">
                We design for the part of your brain that plans, weighs outcomes, and resists impulse.
              </p>
              <div className="pt-6">
                <p className="text-slate-500 font-medium mb-2">In other words:</p>
                <div className="inline-flex items-center gap-3 bg-indigo-50 text-indigo-900 px-6 py-3 rounded-2xl border border-indigo-100">
                  <Brain size={24} className="text-indigo-600" />
                  <span className="text-2xl font-black">the cortex.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST BUILDER / CLOSING */}
      <section className="bg-slate-900 text-white py-32">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="mb-12">
            <h2 className="text-4xl font-black mb-6 tracking-tight">Built on principles, not dark patterns.</h2>
            <p className="text-xl text-slate-300 font-medium leading-relaxed mb-8">
              Cortex is built by humans who care about rational decision-making, personal agency, and designing tools that respect intelligence.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-16">
            {[
              { icon: <Lock />, text: "No dark patterns" },
              { icon: <Brain />, text: "No urgency traps" },
              { icon: <Check />, text: "No pretending life is simple" }
            ].map((item, i) => (
              <div key={i} className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
                <div className="text-indigo-400 mb-3 flex justify-center">
                  {item.icon}
                </div>
                <p className="text-slate-200 font-semibold">{item.text}</p>
              </div>
            ))}
          </div>

          <div className="mb-12">
            <p className="text-2xl font-black text-white mb-8">
              Just clearer thinking—one decision at a time.
            </p>
          </div>

          <a
            href="/login"
            className="inline-flex items-center gap-2 bg-white text-slate-900 px-10 py-5 rounded-2xl font-black text-lg hover:bg-slate-100 transition-all shadow-xl group"
          >
            Start thinking clearly
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </a>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-950 py-12 text-center text-slate-400 font-medium text-sm border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="bg-indigo-600 p-1 rounded text-white">
              <Zap size={14} fill="currentColor" />
            </div>
            <span className="font-black text-slate-300">Cortex</span>
          </div>
          <p className="text-slate-500 mb-4">
            &copy; {new Date().getFullYear()} Cortex Technologies. Tools for Long-Term Thinking.
          </p>
          <div className="flex items-center justify-center gap-4 text-xs">
            <a href="/articles" className="text-slate-500 hover:text-slate-300 transition-colors">
              Articles
            </a>
            <span className="text-slate-700">|</span>
            <a href="/terms" className="text-slate-500 hover:text-slate-300 transition-colors">
              Terms & Privacy
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
