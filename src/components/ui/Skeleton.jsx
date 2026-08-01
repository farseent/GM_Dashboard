import clsx from 'clsx'

function Pulse({ className }) {
  return <div className={clsx('animate-pulse rounded-md bg-brand-800/8', className)} />
}

export function KpiCardSkeleton() {
  return (
    <div className="rounded-xl border border-border-subtle bg-surface-raised p-5">
      <div className="flex items-start justify-between">
        <Pulse className="h-4 w-24" />
        <Pulse className="h-8 w-8 rounded-lg" />
      </div>
      <Pulse className="mt-4 h-7 w-32" />
      <Pulse className="mt-3 h-5 w-20" />
    </div>
  )
}

export function ChartSkeleton({ height = 280 }) {
  return (
    <div className="rounded-xl border border-border-subtle bg-surface-raised p-5">
      <Pulse className="mb-1 h-4 w-40" />
      <Pulse className="mb-4 h-3 w-24" />
      <Pulse style={{ height }} className="w-full" />
    </div>
  )
}

export function TableSkeleton({ rows = 6 }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border-subtle bg-surface-raised">
      <div className="border-b border-border-subtle bg-surface p-3">
        <Pulse className="h-9 w-full max-w-sm" />
      </div>
      <div className="divide-y divide-border-subtle">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3.5">
            <Pulse className="h-4 w-1/4" />
            <Pulse className="h-4 w-1/6" />
            <Pulse className="h-4 w-1/6" />
            <Pulse className="ml-auto h-4 w-1/6" />
          </div>
        ))}
      </div>
    </div>
  )
}