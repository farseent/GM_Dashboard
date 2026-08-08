// components/charts/ChartTooltip.jsx

import { Tooltip } from 'recharts'

export default function ChartTooltip({ order, ...props }) {
  // `order` = array of dataKeys in the order you want them listed
  // (e.g. the same categoryKeys array driving the bar stack order).
  // If not provided, falls back to Recharts' default behavior.
  const itemSorter = order
    ? (item) => order.indexOf(item.dataKey)
    : undefined

  return (
    <Tooltip
      {...props}
      itemSorter={itemSorter}
      contentStyle={{
        backgroundColor: 'var(--color-surface-raised)',
        border: '1px solid var(--color-border-subtle)',
        borderRadius: 12,
        color: 'var(--color-fg)',
        boxShadow: '0 10px 24px rgba(0,0,0,.15)',
      }}
      labelStyle={{
        color: 'var(--color-fg)',
        fontWeight: 600,
      }}
      itemStyle={{
        color: 'var(--color-fg)',
      }}
      cursor={{
        fill: 'rgba(99,102,241,.12)',
      }}
    />
  )
}