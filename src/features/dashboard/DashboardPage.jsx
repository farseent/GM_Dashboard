import { useMemo, useState } from 'react'
import { IndianRupee, Wallet, TrendingUp, Target, AlertTriangle, Trophy } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'

import KpiCard from '../../components/kpi/KpiCard'
import StatusBadge from '../../components/badge/StatusBadge'
import ChartWrapper from '../../components/charts/ChartWrapper'
import TableFilterBar from '../../components/table/TableFilterBar'
import DataTable from '../../components/table/DataTable'
import ChartTooltip from '../../components/charts/ChartTooltip'
import { KpiCardSkeleton, ChartSkeleton, TableSkeleton } from '../../components/ui/Skeleton'
import { filterRows } from '../../lib/sorting'
import { useDelayedLoading } from '../../lib/useDelayedLoading'
import { formatCurrency, formatPercent } from '../../lib/formatters'
import {
  overviewKpis,
  topTour,
  alerts,
  branchRevenueExpense,
  branchSummary,
} from '../../data/dashboard.data'

const STATUS_TONE = { 'On Track': 'positive', Behind: 'negative', Exceeded: 'positive' }
const ALERT_TONE = {
  negative: 'border-negative-500/30 bg-negative-50 text-negative-600',
  warning: 'border-warning-500/30 bg-warning-50 text-warning-600',
}

export default function DashboardPage() {
  const isLoading = useDelayedLoading(500)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')

  const filtered = useMemo(
    () =>
      filterRows(branchSummary, {
        search,
        searchKeys: ['branch'],
        fieldFilters: { status: statusFilter },
      }),
    [search, statusFilter]
  )

  const columns = [
    { key: 'branch', label: 'Branch', sortable: true },
    { key: 'revenue', label: 'Revenue', sortable: true, align: 'right', render: (r) => formatCurrency(r.revenue) },
    { key: 'expenses', label: 'Expenses', sortable: true, align: 'right', render: (r) => formatCurrency(r.expenses) },
    { key: 'profit', label: 'Profit', sortable: true, align: 'right', render: (r) => formatCurrency(r.profit) },
    {
      key: 'targetPct',
      label: 'Target %',
      sortable: true,
      align: 'right',
      render: (r) => formatPercent(r.targetPct),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (r) => <StatusBadge status={STATUS_TONE[r.status]}>{r.status}</StatusBadge>,
    },
  ]

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <KpiCardSkeleton key={i} />)}
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2"><ChartSkeleton /></div>
          <ChartSkeleton height={280} />
        </div>
        <TableSkeleton rows={7} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Total Revenue"
          value={formatCurrency(overviewKpis.totalRevenue.value)}
          icon={IndianRupee}
          trend={{ direction: 'up', value: formatPercent(overviewKpis.totalRevenue.change, { signed: true }), tone: overviewKpis.totalRevenue.tone }}
          subtext="vs last month"
        />
        <KpiCard
          label="Total Expenses"
          value={formatCurrency(overviewKpis.totalExpenses.value)}
          icon={Wallet}
          trend={{ direction: 'up', value: formatPercent(overviewKpis.totalExpenses.change, { signed: true }), tone: overviewKpis.totalExpenses.tone }}
          subtext="vs last month"
        />
        <KpiCard
          label="Net Profit"
          value={formatCurrency(overviewKpis.netProfit.value)}
          icon={TrendingUp}
          trend={{ direction: 'up', value: formatPercent(overviewKpis.netProfit.change, { signed: true }), tone: overviewKpis.netProfit.tone }}
          subtext="vs last month"
        />
        <KpiCard
          label="Target Completion"
          value={formatPercent(overviewKpis.targetCompletion.value)}
          icon={Target}
          trend={{ direction: 'down', value: formatPercent(overviewKpis.targetCompletion.change, { signed: true }), tone: overviewKpis.targetCompletion.tone }}
          subtext="company-wide"
        />
      </div>

      {/* Alerts strip */}
      <div className="space-y-2">
        {alerts.map((a) => (
          <div
            key={a.id}
            className={`flex items-center gap-2.5 rounded-lg border px-4 py-2.5 text-sm font-medium ${ALERT_TONE[a.severity]}`}
          >
            <AlertTriangle className="h-4 w-4 shrink-0" />
            {a.message}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Chart */}
        <div className="lg:col-span-2">
          <ChartWrapper title="Revenue vs Expenses by Branch" subtitle="This month">
            <BarChart data={branchRevenueExpense}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e8ee" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#6b84a8" />
              <YAxis tick={{ fontSize: 12 }} stroke="#6b84a8" />
              <ChartTooltip formatter={(v) => formatCurrency(v)} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="revenue" name="Revenue" fill="#4f46e5" radius={[6, 6, 0, 0]} />
              <Bar dataKey="expenses" name="Expenses" fill="#f59e0b" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ChartWrapper>
        </div>

        {/* Top tour spotlight */}
        <div className="rounded-xl border border-border-subtle bg-surface-raised p-5">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-warning-500/10 p-2">
              <Trophy className="h-4 w-4 text-warning-600" />
            </div>
            <p className="text-sm font-medium text-fg-muted">Top Performing Tour</p>
          </div>
          <p className="mt-3 text-lg font-semibold text-fg">{topTour.name}</p>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-fg-muted">Bookings</span>
              <span className="font-medium text-fg">{topTour.bookings}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-fg-muted">Revenue</span>
              <span className="font-medium text-fg">{formatCurrency(topTour.revenue)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Branch summary table */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-fg">Branch Performance Summary</h3>
        <TableFilterBar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search branch..."
          filters={[{ key: 'status', label: 'Status', options: ['On Track', 'Behind', 'Exceeded'] }]}
          values={{ status: statusFilter }}
          onFilterChange={(_, value) => setStatusFilter(value)}
        />
        <DataTable columns={columns} rows={filtered} pageSize={10} />
      </div>
    </div>
  )
}