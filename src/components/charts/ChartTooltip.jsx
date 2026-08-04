// components/charts/ChartTooltip.jsx

import { Tooltip } from 'recharts'

export default function ChartTooltip(props) {
  return (
    <Tooltip
      {...props}
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