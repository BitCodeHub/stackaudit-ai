import clsx from 'clsx'

// Base Skeleton element with shimmer animation
export function Skeleton({ className, ...props }) {
  return (
    <div
      className={clsx(
        'animate-pulse rounded bg-neutral-200',
        className
      )}
      {...props}
    />
  )
}

// Skeleton for stat cards on dashboard
export function SkeletonStatCard({ className }) {
  return (
    <div className={clsx(
      'rounded-xl bg-white border border-neutral-200/80 p-5',
      className
    )}>
      <div className="animate-pulse">
        <div className="flex items-start justify-between">
          <div className="w-10 h-10 rounded-lg bg-neutral-200" />
          <div className="w-16 h-5 rounded-full bg-neutral-100" />
        </div>
        <div className="mt-4 space-y-2">
          <div className="h-7 bg-neutral-200 rounded w-24" />
          <div className="h-4 bg-neutral-100 rounded w-20" />
        </div>
      </div>
    </div>
  )
}

// Skeleton for the spend chart area
export function SkeletonChart({ className, height = 300 }) {
  return (
    <div className={clsx('rounded-xl bg-white border border-neutral-200/80 p-6', className)}>
      <div className="animate-pulse">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-2">
            <div className="h-5 bg-neutral-200 rounded w-40" />
            <div className="h-3 bg-neutral-100 rounded w-64" />
          </div>
          <div className="flex gap-2">
            <div className="w-8 h-6 rounded bg-neutral-100" />
            <div className="w-8 h-6 rounded bg-neutral-100" />
            <div className="w-8 h-6 rounded bg-neutral-100" />
          </div>
        </div>
        {/* Chart area */}
        <div 
          className="relative bg-neutral-50 rounded-lg overflow-hidden"
          style={{ height }}
        >
          {/* Fake bars */}
          <div className="absolute bottom-0 left-0 right-0 flex items-end justify-around px-4 gap-2 h-full pt-8">
            {[65, 80, 45, 90, 70, 85].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col gap-1 justify-end">
                <div 
                  className="bg-neutral-200 rounded-t"
                  style={{ height: `${h}%` }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// Skeleton for quick action cards
export function SkeletonActionCard({ className }) {
  return (
    <div className={clsx('rounded-xl bg-white border border-neutral-200/80 p-5', className)}>
      <div className="animate-pulse">
        <div className="h-4 bg-neutral-200 rounded w-24 mb-4" />
        <div className="space-y-2">
          {[1, 2].map((i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-neutral-50">
              <div className="w-9 h-9 bg-neutral-200 rounded-lg" />
              <div className="flex-1 space-y-1.5">
                <div className="h-4 bg-neutral-200 rounded w-28" />
                <div className="h-3 bg-neutral-100 rounded w-20" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Skeleton for the audits table
export function SkeletonAuditsTable({ rows = 4, className }) {
  return (
    <div className={clsx('rounded-xl bg-white border border-neutral-200/80 overflow-hidden', className)}>
      <div className="animate-pulse">
        {/* Table header */}
        <div className="p-5 border-b border-neutral-100">
          <div className="flex items-center justify-between">
            <div className="h-5 bg-neutral-200 rounded w-28" />
            <div className="h-4 bg-neutral-100 rounded w-16" />
          </div>
        </div>
        
        {/* Table head */}
        <div className="flex gap-4 py-3 px-5 bg-neutral-50/80 border-b border-neutral-100">
          <div className="h-3 bg-neutral-200 rounded flex-[2]" />
          <div className="h-3 bg-neutral-200 rounded flex-1" />
          <div className="h-3 bg-neutral-200 rounded flex-1" />
          <div className="h-3 bg-neutral-200 rounded flex-1" />
          <div className="h-3 bg-neutral-200 rounded flex-1" />
          <div className="h-3 bg-neutral-200 rounded flex-1" />
        </div>
        
        {/* Table rows */}
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 py-4 px-5 border-b border-neutral-100 last:border-0">
            <div className="h-4 bg-neutral-200 rounded flex-[2]" />
            <div className="h-4 bg-neutral-100 rounded flex-1" />
            <div className="h-4 bg-neutral-100 rounded flex-1" />
            <div className="h-4 bg-neutral-200 rounded flex-1" />
            <div className="h-4 bg-neutral-100 rounded flex-1" />
            <div className="h-5 bg-neutral-200 rounded-full w-20" />
          </div>
        ))}
      </div>
    </div>
  )
}

// Skeleton for opportunity card
export function SkeletonOpportunityCard({ className }) {
  return (
    <div className={clsx('rounded-xl bg-white border border-neutral-200/80 p-5', className)}>
      <div className="animate-pulse flex items-start gap-3">
        <div className="w-9 h-9 bg-neutral-200 rounded-lg shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="w-24 h-4 bg-neutral-200 rounded-full mb-2" />
          <div className="h-5 bg-neutral-200 rounded w-40 mb-2" />
          <div className="space-y-1 mb-3">
            <div className="h-3 bg-neutral-100 rounded w-full" />
            <div className="h-3 bg-neutral-100 rounded w-3/4" />
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
            <div className="h-6 bg-neutral-200 rounded w-20" />
            <div className="h-5 bg-neutral-100 rounded w-24" />
          </div>
        </div>
      </div>
    </div>
  )
}

// Full Dashboard Loading Skeleton
export function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <div className="h-4 bg-neutral-200 rounded w-24 animate-pulse" />
          <div className="h-7 bg-neutral-200 rounded w-44 animate-pulse" />
        </div>
        <div className="h-10 bg-neutral-200 rounded-lg w-28 animate-pulse" />
      </div>

      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <SkeletonStatCard key={i} />
        ))}
      </div>

      {/* Main Content Grid Skeleton */}
      <div className="grid lg:grid-cols-3 gap-6">
        <SkeletonChart className="lg:col-span-2" height={280} />
        <div className="space-y-6">
          <SkeletonActionCard />
          <SkeletonOpportunityCard />
        </div>
      </div>

      {/* Recent Audits Skeleton */}
      <SkeletonAuditsTable rows={3} />
    </div>
  )
}

export default Skeleton
