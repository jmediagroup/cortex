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
  BookOpen,
  Star,
  Shield,
  ChevronRight
} from 'lucide-react';
import LatestArticles from '@/components/home/LatestArticles';
import MobileNav from '@/components/navigation/MobileNav';

/**
 * LANDING PAGE (Root Route: /)
 * Comprehensive platform landing page for Cortex Technologies
 * Positions Cortex as a decision-support platform for life's biggest decisions
 */
export default function LandingPage() {
  const tools = [
    {
      icon: <Calculator size={22} />,
      title: "Compound Interest Calculator",
      description: "See how your money grows over time with different contribution strategies and rates.",
      isFree: true,
      link: "/apps/compound-interest"
    },
    {
      icon: <BarChart3 size={22} />,
      title: "Index Fund Growth Visualizer",
      description: "Simulate historical returns and volatility for popular index ETFs like VOO, VTI, VT, and QQQM.",
      isFree: true,
      link: "/apps/index-fund-visualizer"
    },
    {
      icon: <Wallet size={22} />,
      title: "Household Budgeting System",
      description: "Allocate resources under constraints with AI-powered optimization and flexibility analysis.",
      isFree: true,
      link: "/apps/budget"
    },
    {
      icon: <Dices size={22} />,
      title: "Gambling Spend Redirect",
      description: "See the wealth gap between playing the odds and owning the market. Redirect toward building real wealth.",
      isFree: true,
      link: "/apps/gambling-redirect"
    },
    {
      icon: <TrendingUp size={22} />,
      title: "Retirement Strategy Engine",
      description: "Advanced decumulation planning with Roth conversions, tax optimization, and sequence risk analysis.",
      isFree: true,
      link: "/apps/retirement-strategy"
    },
    {
      icon: <Building2 size={22} />,
      title: "S-Corp Investment Optimizer",
      description: "Maximize retirement contributions while optimizing your S-Corp owner compensation.",
      isFree: false
    },
    {
      icon: <Car size={22} />,
      title: "Car Affordability Calculator",
      description: "Understand the true cost of vehicle ownership including depreciation and opportunity cost.",
      isFree: false
    },
    {
      icon: <Scale size={22} />,
      title: "S-Corp Optimizer",
      description: "Calculate self-employment tax savings and find your ideal salary/distribution split.",
      isFree: false
    },
    {
      icon: <Landmark size={22} />,
      title: "Rent vs Buy Reality Engine",
      description: "Compare renting vs buying with opportunity cost, maintenance drag, and tax treatment.",
      isFree: false
    },
    {
      icon: <TrendingDown size={22} />,
      title: "Debt Paydown Strategy Optimizer",
      description: "Compare avalanche vs snowball strategies with psychological weighting and opportunity cost.",
      isFree: false
    },
    {
      icon: <MapPin size={22} />,
      title: "Geographic Arbitrage Calculator",
      description: "Calculate wealth-building potential by comparing income, taxes, and cost of living across all 50 states.",
      isFree: false
    },
    {
      icon: <Compass size={22} />,
      title: "Net Worth Engine",
      description: "Track assets and liabilities, analyze liquidity and momentum, and visualize your financial trajectory.",
      isFree: false
    }
  ];

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">

      {/* ─── NAVIGATION ─── */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 md:py-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-1.5 rounded-xl text-white shadow-md shadow-indigo-200">
              <Brain size={20} />
            </div>
            <span className="font-black text-xl tracking-tight">Cortex</span>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            <a href="/articles" className="text-sm font-semibold text-slate-500 hover:text-slate-900 px-4 py-2 rounded-full hover:bg-slate-50 transition-all flex items-center gap-1.5">
              <BookOpen size={15} />
              Articles
            </a>
            <a href="/login" className="text-sm font-semibold text-slate-500 hover:text-slate-900 px-4 py-2 rounded-full hover:bg-slate-50 transition-all">
              Sign In
            </a>
            <a
              href="/login"
              className="bg-slate-900 text-white px-5 py-2.5 rounded-full font-bold text-sm hover:bg-slate-800 transition-all shadow-sm ml-1"
            >
              Get Started
            </a>
          </div>

          {/* Mobile Navigation */}
          <MobileNav />
        </div>
      </nav>

      {/* ─── HERO SECTION ─── */}
      <section className="hero-gradient grid-bg relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 pt-24 md:pt-32 pb-20 md:pb-28 text-center relative">
          {/* Floating accent elements */}
          <div className="absolute top-16 left-[10%] w-72 h-72 bg-indigo-400/10 rounded-full blur-3xl animate-float pointer-events-none" />
          <div className="absolute bottom-8 right-[10%] w-64 h-64 bg-purple-400/10 rounded-full blur-3xl animate-float-delayed pointer-events-none" />

          <div className="max-w-4xl mx-auto relative">
            <div className="inline-flex items-center gap-2 bg-white/70 backdrop-blur text-indigo-700 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest mb-8 border border-indigo-100/60 shadow-sm">
              <Sparkles size={14} className="text-indigo-500" />
              Decision-Support Platform
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black leading-[1.08] tracking-tight mb-8 gradient-text">
              Think clearly about life&apos;s biggest decisions.
            </h1>
            <p className="text-lg md:text-xl text-slate-500 font-medium mb-12 leading-relaxed max-w-2xl mx-auto">
              Interactive models that turn complexity into clarity—starting with finance, expanding into health, education, and long-term planning.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center">
              <a
                href="#tools"
                className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-8 py-4 rounded-2xl font-bold text-base hover:from-indigo-700 hover:to-indigo-800 transition-all shadow-lg shadow-indigo-200/50 flex items-center justify-center gap-2 group"
              >
                Explore the Tools
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </a>
              <a
                href="/login"
                className="w-full sm:w-auto bg-white text-slate-700 border border-slate-200 px-8 py-4 rounded-2xl font-bold text-base hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
              >
                Start Free
              </a>
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="border-t border-slate-100 bg-white/60 backdrop-blur-sm">
          <div className="max-w-5xl mx-auto px-6 py-6 flex flex-wrap items-center justify-center gap-8 md:gap-16">
            {[
              { value: "12", label: "Interactive Tools" },
              { value: "5", label: "Free to Use" },
              { value: "50", label: "States Covered" },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-2xl md:text-3xl font-black text-slate-900">{stat.value}+</div>
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── WHAT IS CORTEX ─── */}
      <section className="py-24 md:py-32">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4 tracking-tight">What Is Cortex?</h2>
            <p className="text-lg text-slate-500 font-medium max-w-2xl mx-auto">
              A decision-support platform that makes invisible consequences visible.
            </p>
          </div>

          <div className="bg-gradient-to-br from-slate-50 to-white p-8 lg:p-14 rounded-3xl border border-slate-200/80 shadow-sm">
            <div className="space-y-5 mb-10">
              <p className="text-lg text-slate-600 font-medium leading-relaxed">
                Life decisions don&apos;t fail because people are careless. They fail because the math is invisible, the timelines are long, and the consequences arrive quietly.
              </p>
              <p className="text-lg text-slate-600 font-medium leading-relaxed">
                Cortex builds interactive models that let you <span className="text-slate-900 font-bold">see outcomes before you live them.</span>
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { icon: <BarChart3 size={16} />, text: "Real-world financial logic" },
                { icon: <Sparkles size={16} />, text: "Clean, explorable interfaces" },
                { icon: <TrendingUp size={16} />, text: "Forward-looking scenarios" },
                { icon: <Brain size={16} />, text: "Human-centered design" }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 bg-white rounded-xl px-4 py-3.5 border border-slate-100 shadow-sm">
                  <div className="bg-indigo-50 text-indigo-600 p-2 rounded-lg flex-shrink-0">
                    {item.icon}
                  </div>
                  <p className="text-slate-700 font-semibold text-sm">{item.text}</p>
                </div>
              ))}
            </div>

            <div className="mt-10 pt-8 border-t border-slate-100 text-center">
              <p className="text-lg text-slate-900 font-black">
                The goal isn&apos;t prediction. The goal is better judgment.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CURRENT TOOLS - CORTEX FINANCE ─── */}
      <section id="tools" className="py-24 md:py-32 bg-slate-50/50 border-y border-slate-100 scroll-mt-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest mb-5 border border-emerald-100">
              <Sparkles size={14} />
              Available Now
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4 tracking-tight">Cortex Finance</h2>
            <p className="text-lg text-slate-500 font-medium max-w-2xl mx-auto">
              Our first suite focuses on personal and small-business finance—where small decisions compound dramatically over time.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 mb-14">
            {tools.map((tool, i) => (
              <div
                key={i}
                className="card-glow bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:-translate-y-1 hover:shadow-lg transition-all duration-300 group relative"
              >
                {tool.isFree && (
                  <div className="absolute -top-2.5 -right-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-md">
                    Free
                  </div>
                )}
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 text-indigo-600 p-3 rounded-xl w-fit mb-4 group-hover:from-indigo-600 group-hover:to-purple-600 group-hover:text-white transition-all duration-300">
                  {tool.icon}
                </div>
                <h4 className="text-base font-black text-slate-800 mb-2">{tool.title}</h4>
                <p className="text-slate-500 font-medium leading-relaxed text-sm mb-4">
                  {tool.description}
                </p>
                {tool.isFree && tool.link && (
                  <a
                    href={tool.link}
                    className="inline-flex items-center gap-1.5 text-indigo-600 font-bold text-sm group-hover:gap-2.5 transition-all"
                  >
                    Try for Free
                    <ArrowRight size={14} />
                  </a>
                )}
              </div>
            ))}
          </div>

          <div className="text-center mb-14">
            <a
              href="/login"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-8 py-4 rounded-2xl font-bold text-base hover:from-indigo-700 hover:to-indigo-800 transition-all shadow-lg shadow-indigo-200/50 group"
            >
              Try it free
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </a>
          </div>

          <div className="bg-white p-8 md:p-10 rounded-2xl border border-slate-200/80 shadow-sm text-center">
            <p className="text-slate-500 font-medium mb-4 text-base">
              Each tool is built to answer one question clearly:
            </p>
            <p className="text-xl md:text-2xl font-black text-slate-900">
              &ldquo;If I choose this path, what actually happens?&rdquo;
            </p>
            <div className="flex flex-wrap items-center justify-center gap-6 mt-8 text-sm text-slate-500 font-semibold">
              {["No jargon", "No spreadsheets from 2009", "No financial theater"].map((text, i) => (
                <span key={i} className="flex items-center gap-2">
                  <Check size={16} className="text-emerald-500" strokeWidth={3} />
                  {text}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── FUTURE VISION ─── */}
      <section className="py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-purple-50 text-purple-700 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest mb-5 border border-purple-100">
              <Compass size={14} />
              Coming Soon
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4 tracking-tight">What We&apos;re Building Next</h2>
            <p className="text-lg text-slate-500 font-medium max-w-2xl mx-auto">
              Expanding into life domains where decisions are frequent, emotional, and long-term.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: <Leaf size={24} />,
                title: "Health",
                description: "Behavior tradeoffs, habit impact modeling, and longevity planning tools.",
                gradient: "from-emerald-50 to-teal-50",
                iconColor: "text-emerald-600",
                iconBg: "from-emerald-100 to-teal-100"
              },
              {
                icon: <GraduationCap size={24} />,
                title: "Education",
                description: "ROI of learning paths, certifications, degrees, and skill stack optimization.",
                gradient: "from-blue-50 to-indigo-50",
                iconColor: "text-blue-600",
                iconBg: "from-blue-100 to-indigo-100"
              },
              {
                icon: <Compass size={24} />,
                title: "Life Planning",
                description: "Time allocation analysis, career pivots, lifestyle tradeoffs, and optionality preservation.",
                gradient: "from-purple-50 to-pink-50",
                iconColor: "text-purple-600",
                iconBg: "from-purple-100 to-pink-100"
              }
            ].map((sector, i) => (
              <div key={i} className={`bg-gradient-to-br ${sector.gradient} p-8 rounded-2xl border border-slate-200/60 shadow-sm`}>
                <div className={`bg-gradient-to-br ${sector.iconBg} ${sector.iconColor} p-3.5 rounded-xl w-fit mb-5`}>
                  {sector.icon}
                </div>
                <h4 className="text-xl font-black mb-2 text-slate-800">{sector.title}</h4>
                <p className="text-slate-500 font-medium leading-relaxed text-sm">{sector.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-lg text-slate-500 font-medium">Each sector follows the same principle:</p>
            <p className="text-xl md:text-2xl font-black text-slate-900 mt-2">
              Make invisible consequences visible—early enough to matter.
            </p>
          </div>
        </div>
      </section>

      {/* ─── WHY CORTEX ─── */}
      <section className="py-24 md:py-32 bg-slate-50/50 border-y border-slate-100">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4 tracking-tight">Why Cortex Exists</h2>
          </div>

          <div className="space-y-4">
            {[
              { left: "Most tools give answers.", right: "Cortex gives context." },
              { left: "Most platforms optimize for engagement.", right: "Cortex optimizes for clarity." },
              { left: "Most advice is static.", right: "Cortex is interactive, scenario-based, and personal." }
            ].map((item, i) => (
              <div
                key={i}
                className="bg-white p-6 lg:p-8 rounded-2xl border border-slate-200/80 shadow-sm grid md:grid-cols-2 gap-4 items-center"
              >
                <p className="text-base text-slate-400 font-medium line-through decoration-slate-200">{item.left}</p>
                <p className="text-base text-slate-900 font-black flex items-center gap-2">
                  <ChevronRight size={16} className="text-indigo-500 flex-shrink-0 hidden md:block" />
                  {item.right}
                </p>
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 p-10 lg:p-14 rounded-3xl shadow-xl mt-10 text-center relative overflow-hidden">
            {/* Subtle pattern overlay */}
            <div className="absolute inset-0 opacity-5 grid-bg" />
            <div className="relative">
              <p className="text-lg text-indigo-200 font-medium mb-3">
                You don&apos;t need another opinion.
              </p>
              <p className="text-2xl lg:text-3xl text-white font-black leading-tight">
                You need to understand the system you&apos;re operating inside.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── LATEST ARTICLES ─── */}
      <LatestArticles />

      {/* ─── PRICING PREVIEW ─── */}
      <section className="py-24 md:py-32 bg-slate-50/50 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4 tracking-tight">Simple, Honest Pricing</h2>
            <p className="text-lg text-slate-500 font-medium">
              Choose the plan that matches where you are today.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* FREE */}
            <div className="bg-white p-7 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col">
              <div className="mb-6">
                <h3 className="text-xl font-black text-slate-900 mb-1">Free</h3>
                <p className="text-slate-400 font-medium text-sm mb-5">For exploration and curiosity.</p>
                <div>
                  <span className="text-4xl font-black text-slate-900">$0</span>
                  <span className="text-slate-400 font-medium text-sm">/forever</span>
                </div>
              </div>
              <ul className="space-y-3 mb-8 flex-grow">
                {[
                  "Access to core calculators",
                  "Limited scenarios",
                  "Ideal for learning"
                ].map((feature, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm">
                    <Check size={15} className="text-emerald-500 mt-0.5 flex-shrink-0" strokeWidth={3} />
                    <span className="text-slate-600 font-medium">{feature}</span>
                  </li>
                ))}
              </ul>
              <a
                href="/login"
                className="block w-full bg-slate-100 text-slate-700 px-6 py-3 rounded-xl font-bold text-sm text-center hover:bg-slate-200 transition-all"
              >
                Start Free
              </a>
            </div>

            {/* FINANCE PRO */}
            <div className="bg-white p-7 rounded-2xl border-2 border-indigo-200 shadow-lg shadow-indigo-50 relative flex flex-col">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-md">
                  Most Popular
                </span>
              </div>
              <div className="mb-6">
                <h3 className="text-xl font-black text-slate-900 mb-1">Finance Pro</h3>
                <p className="text-slate-400 font-medium text-sm mb-5">For people who want precision.</p>
                <div>
                  <span className="text-4xl font-black text-slate-900">$9</span>
                  <span className="text-slate-400 font-medium text-sm">/month</span>
                </div>
              </div>
              <ul className="space-y-3 mb-8 flex-grow">
                {[
                  "Full access to all Finance tools",
                  "Advanced scenarios",
                  "Deeper projections",
                  "Strategy modeling"
                ].map((feature, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm">
                    <Check size={15} className="text-indigo-600 mt-0.5 flex-shrink-0" strokeWidth={3} />
                    <span className="text-slate-600 font-medium">{feature}</span>
                  </li>
                ))}
              </ul>
              <a
                href="/pricing"
                className="block w-full bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-6 py-3 rounded-xl font-bold text-sm text-center hover:from-indigo-700 hover:to-indigo-800 transition-all shadow-md"
              >
                Get Finance Pro
              </a>
            </div>

            {/* ELITE */}
            <div className="bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 p-7 rounded-2xl shadow-xl text-white relative overflow-hidden flex flex-col">
              <div className="absolute inset-0 opacity-10 grid-bg" />
              <div className="relative flex flex-col flex-grow">
                <div className="mb-6">
                  <h3 className="text-xl font-black mb-1">Elite</h3>
                  <p className="text-slate-300 font-medium text-sm mb-5">For people who want a thinking system.</p>
                  <div>
                    <span className="text-4xl font-black">$29</span>
                    <span className="text-slate-300 font-medium text-sm">/month</span>
                  </div>
                </div>
                <ul className="space-y-3 mb-8 flex-grow">
                  {[
                    "All current & future apps",
                    "Finance, Health, Education",
                    "Life planning tools",
                    "New sectors as they launch"
                  ].map((feature, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm">
                      <Check size={15} className="text-purple-300 mt-0.5 flex-shrink-0" strokeWidth={3} />
                      <span className="text-slate-200 font-medium">{feature}</span>
                    </li>
                  ))}
                </ul>
                <a
                  href="/pricing"
                  className="block w-full bg-white text-slate-900 px-6 py-3 rounded-xl font-bold text-sm text-center hover:bg-slate-100 transition-all shadow-md"
                >
                  Get Elite
                </a>
              </div>
            </div>
          </div>

          <div className="text-center mt-10">
            <a
              href="/pricing"
              className="inline-flex items-center gap-2 text-indigo-600 font-bold text-sm hover:gap-3 transition-all"
            >
              View full pricing details
              <ArrowRight size={14} />
            </a>
          </div>
        </div>
      </section>

      {/* ─── HOW CORTEX IS DIFFERENT ─── */}
      <section className="py-24 md:py-32">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4 tracking-tight">How Cortex Is Different</h2>
          </div>

          <div className="bg-gradient-to-br from-slate-50 to-white p-8 lg:p-14 rounded-3xl border border-slate-200/80 shadow-sm">
            <div className="grid md:grid-cols-3 gap-6 mb-10">
              {[
                { label: "Not advice", emoji: "📋" },
                { label: "Not a course", emoji: "🎓" },
                { label: "Not a spreadsheet farm", emoji: "📊" }
              ].map((item, i) => (
                <div key={i} className="text-center bg-white rounded-xl p-5 border border-slate-100">
                  <div className="text-3xl mb-2">{item.emoji}</div>
                  <p className="text-slate-400 font-semibold text-sm line-through">{item.label}</p>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-100 pt-10 space-y-4 text-center">
              <p className="text-lg text-slate-600 font-medium">
                It&apos;s a <span className="text-slate-900 font-black">cognitive assistant</span>—a place where logic, time, and consequence meet.
              </p>
              <p className="text-base text-slate-500 font-medium">
                We design for the part of your brain that plans, weighs outcomes, and resists impulse.
              </p>
              <div className="pt-6">
                <div className="inline-flex items-center gap-3 bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-900 px-6 py-3 rounded-2xl border border-indigo-100/60">
                  <Brain size={22} className="text-indigo-600" />
                  <span className="text-xl font-black">the cortex.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── TRUST & CLOSING CTA ─── */}
      <section className="relative overflow-hidden">
        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 text-white py-24 md:py-32 relative">
          {/* Accent glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-4xl mx-auto px-6 text-center relative">
            <div className="mb-12">
              <h2 className="text-3xl md:text-4xl font-black mb-5 tracking-tight">Built on principles, not dark patterns.</h2>
              <p className="text-lg text-slate-400 font-medium leading-relaxed max-w-2xl mx-auto">
                Cortex is built by humans who care about rational decision-making, personal agency, and designing tools that respect intelligence.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-4 mb-14">
              {[
                { icon: <Lock size={20} />, text: "No dark patterns" },
                { icon: <Shield size={20} />, text: "No urgency traps" },
                { icon: <Star size={20} />, text: "No pretending life is simple" }
              ].map((item, i) => (
                <div key={i} className="bg-white/5 backdrop-blur-sm p-5 rounded-xl border border-white/10">
                  <div className="text-indigo-400 mb-2.5 flex justify-center">
                    {item.icon}
                  </div>
                  <p className="text-slate-300 font-semibold text-sm">{item.text}</p>
                </div>
              ))}
            </div>

            <p className="text-xl md:text-2xl font-black text-white mb-10">
              Just clearer thinking—one decision at a time.
            </p>

            <a
              href="/login"
              className="inline-flex items-center gap-2 bg-white text-slate-900 px-8 py-4 rounded-2xl font-bold text-base hover:bg-slate-100 transition-all shadow-xl group"
            >
              Start thinking clearly
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="bg-slate-950 py-10 text-center border-t border-slate-800/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-1 rounded-lg text-white">
              <Zap size={14} fill="currentColor" />
            </div>
            <span className="font-black text-slate-300 text-sm">Cortex</span>
          </div>
          <p className="text-slate-500 text-xs mb-3">
            &copy; {new Date().getFullYear()} Cortex Technologies. Tools for Long-Term Thinking.
          </p>
          <div className="flex items-center justify-center gap-4 text-xs">
            <a href="/articles" className="text-slate-500 hover:text-slate-300 transition-colors">
              Articles
            </a>
            <span className="text-slate-700">|</span>
            <a href="/pricing" className="text-slate-500 hover:text-slate-300 transition-colors">
              Pricing
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
