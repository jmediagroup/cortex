'use client';

interface PromoItem {
  id: string;
  text: string;
  cta: string;
  bgClass: string;
}

const promos: PromoItem[] = [
  {
    id: 'promo-1',
    text: 'Discover how to maximize your savings with tax-advantaged accounts.',
    cta: 'SEE HOW',
    bgClass: 'from-[var(--primary-400)] to-[var(--primary-600)]',
  },
  {
    id: 'promo-2',
    text: 'Set up automatic investments and grow your portfolio on autopilot.',
    cta: 'GET STARTED',
    bgClass: 'from-[var(--primary-500)] to-[var(--primary-800)]',
  },
  {
    id: 'promo-3',
    text: 'Compare index funds and find the best fit for your risk tolerance.',
    cta: 'EXPLORE',
    bgClass: 'from-[var(--chart-blue)] to-[var(--primary-600)]',
  },
];

export default function PromoBanners() {
  return (
    <div className="flex gap-4 overflow-x-auto pb-1 scrollbar-none">
      {promos.map((promo) => (
        <div
          key={promo.id}
          className={`flex min-w-[260px] flex-shrink-0 flex-col justify-between rounded-[var(--radius-xl)] bg-gradient-to-br ${promo.bgClass} p-5 text-white md:min-w-[300px]`}
          style={{ boxShadow: 'var(--shadow-card)' }}
        >
          <p className="mb-4 text-sm font-medium leading-relaxed opacity-90">
            {promo.text}
          </p>
          <button className="w-fit rounded-[var(--radius-md)] bg-white/20 px-4 py-2 text-xs font-bold uppercase tracking-wide backdrop-blur-sm transition-colors hover:bg-white/30">
            {promo.cta}
          </button>
        </div>
      ))}
    </div>
  );
}
