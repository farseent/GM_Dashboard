import { ResponsiveContainer } from 'recharts'

/**
 * Consistent card shell for every chart in the app.
 * title/subtitle sit above the chart; actions (e.g. a period toggle) sit top-right.
 * height controls the ResponsiveContainer height (default 280px).
 */
export default function ChartWrapper({ title, subtitle, actions, height = 280, children }) {
  return (
    <div className="rounded-xl border border-border-subtle bg-surface-raised p-5">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h3 className="text-sm font-semibold text-brand-950">{title}</h3>
          {subtitle && <p className="mt-0.5 text-xs text-brand-400">{subtitle}</p>}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>

      <ResponsiveContainer width="100%" height={height}>
        {children}
      </ResponsiveContainer>
    </div>
  )
}