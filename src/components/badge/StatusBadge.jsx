import clsx from 'clsx'

const VARIANTS = {
  positive: 'bg-positive-100 text-positive-600',
  negative: 'bg-negative-100 text-negative-600',
  warning: 'bg-warning-100 text-warning-600',
  neutral: 'bg-fg/5 text-fg-muted',
}

const DOT_VARIANTS = {
  positive: 'bg-positive-500',
  negative: 'bg-negative-500',
  warning: 'bg-warning-500',
  neutral: 'bg-fg-subtle',
}

/**
 * status: 'positive' | 'negative' | 'warning' | 'neutral'
 * Use for on-track/behind/exceeded, paid/pending/refunded, profit/loss, etc.
 */
export default function StatusBadge({ status = 'neutral', children, dot = true }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
        VARIANTS[status]
      )}
    >
      {dot && <span className={clsx('h-1.5 w-1.5 rounded-full', DOT_VARIANTS[status])} />}
      {children}
    </span>
  )
}