'use client';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded-[var(--radius-md)] bg-[var(--surface-tertiary)] ${className}`}
    />
  );
}

export function SkeletonCard({ className = '' }: SkeletonProps) {
  return (
    <div
      className={`rounded-[var(--radius-xl)] border border-[var(--border-primary)] bg-[var(--surface-primary)] p-5 ${className}`}
      style={{ boxShadow: 'var(--shadow-card)' }}
    >
      <div className="flex items-center gap-3 mb-4">
        <Skeleton className="h-10 w-10 rounded-[var(--radius-md)]" />
        <Skeleton className="h-4 w-24" />
      </div>
      <Skeleton className="h-7 w-32 mb-2" />
      <Skeleton className="h-4 w-20" />
    </div>
  );
}

export function SkeletonChart({ className = '' }: SkeletonProps) {
  return (
    <div
      className={`rounded-[var(--radius-xl)] border border-[var(--border-primary)] bg-[var(--surface-primary)] p-5 ${className}`}
      style={{ boxShadow: 'var(--shadow-card)' }}
    >
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-5 w-36" />
        <Skeleton className="h-8 w-24 rounded-[var(--radius-md)]" />
      </div>
      <Skeleton className="h-56 w-full rounded-[var(--radius-lg)]" />
    </div>
  );
}

export function SkeletonTransaction({ className = '' }: SkeletonProps) {
  return (
    <div className={`flex items-center gap-3 py-3 ${className}`}>
      <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
      <div className="flex-1">
        <Skeleton className="h-4 w-40 mb-1.5" />
        <Skeleton className="h-3 w-16" />
      </div>
      <Skeleton className="h-4 w-16" />
    </div>
  );
}

export function SkeletonDashboard() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 md:px-6 lg:px-8">
      <div className="flex flex-col gap-6 lg:flex-row">
        <main className="min-w-0 flex-1">
          <div className="flex flex-col gap-6">
            {/* KPI row */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
            {/* Chart */}
            <SkeletonChart />
            {/* Transactions */}
            <div
              className="rounded-[var(--radius-xl)] border border-[var(--border-primary)] bg-[var(--surface-primary)] p-5"
              style={{ boxShadow: 'var(--shadow-card)' }}
            >
              <Skeleton className="h-5 w-32 mb-4" />
              <SkeletonTransaction />
              <SkeletonTransaction />
              <SkeletonTransaction />
            </div>
          </div>
        </main>
        <aside className="w-full shrink-0 lg:w-80 xl:w-96">
          <div className="flex flex-col gap-6">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </aside>
      </div>
    </div>
  );
}
