import { memo } from 'react'
import clsx from 'clsx'
import { ArrowUpRight, ArrowDownRight } from 'lucide-react'

const TREND_COLOR = {
  positive: 'text-positive-600 bg-positive-50',
  negative: 'text-negative-600 bg-negative-50',
  neutral: 'text-fg-muted bg-fg/5',
}

/**
 * label: string — e.g. "Total Revenue"
 * value: string — pre-formatted, e.g. "₹12,45,000"
 * trend: { direction: 'up' | 'down', value: '8.2%', tone: 'positive' | 'negative' | 'neutral' }
 * icon: lucide icon component
 * subtext: optional small caption below the value
 */
function KpiCard({ label, value, trend, icon: Icon, subtext }) {
  return (
    <div className="rounded-xl border border-border-subtle bg-surface-raised p-5">
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-fg-muted">{label}</p>
        {Icon && (
          <div className="rounded-lg bg-accent-500/10 p-2">
            <Icon className="h-4 w-4 text-accent-600" />
          </div>
        )}
      </div>

      <p className="mt-3 text-2xl font-semibold tracking-tight text-fg">{value}</p>

      <div className="mt-2 flex items-center gap-2">
        {trend && (
          <span
            className={clsx(
              'inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-xs font-medium',
              TREND_COLOR[trend.tone ?? 'neutral']
            )}
          >
            {trend.direction === 'up' ? (
              <ArrowUpRight className="h-3 w-3" />
            ) : (
              <ArrowDownRight className="h-3 w-3" />
            )}
            {trend.value}
          </span>
        )}
        {subtext && <span className="text-xs text-fg-subtle">{subtext}</span>}
      </div>
    </div>
  )
}

export default memo(KpiCard)