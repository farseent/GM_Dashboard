import { useMemo, useState } from 'react'
import { TrendingUp, TrendingDown, Wallet, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react'
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  BarChart, Cell,
} from 'recharts'

import KpiCard from '../../components/kpi/KpiCard'
import StatusBadge from '../../components/badge/StatusBadge'
import ChartWrapper from '../../components/charts/ChartWrapper'
import TableFilterBar from '../../components/table/TableFilterBar'
import DataTable from '../../components/table/DataTable'
import { KpiCardSkeleton, ChartSkeleton, TableSkeleton } from '../../components/ui/Skeleton'
import { useDelayedLoading } from '../../lib/useDelayedLoading'
import { filterRows } from '../../lib/sorting'
import { formatCurrency, formatPercent } from '../../lib/formatters'
import {
  financialKpis,
  revenueExpenseProfit,
  profitMarginTrend,
  branchProfitLoss,
} from '../../data/financialStatus.data'

export default function FinancialStatusPage() {
  const isLoading = useDelayedLoading(500)
  const [search, setSearch] = useState('')
  const [branchFilter, setBranchFilter] = useState('All')

  const filtered = useMemo(
    () =>
      filterRows(branchProfitLoss, {
        search,
        searchKeys: ['branch'],
        fieldFilters: { branch: branchFilter },
      }),
    [search, branchFilter]
  )

  const columns = [
    { key: 'branch', label: 'Branch', sortable: true },
    { key: 'revenue', label: 'Revenue', sortable: true, align: 'right', render: (r) => formatCurrency(r.revenue) },
    { key: 'expenses', label: 'Expenses', sortable: true, align: 'right', render: (r) => formatCurrency(r.expenses) },
    { key: 'profit', label: 'Profit', sortable: true, align: 'right', render: (r) => formatCurrency(r.profit) },
    { key: 'margin', label: 'Margin', sortable: true, align: 'right', render: (r) => formatPercent(r.margin) },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (r) => <StatusBadge status={r.status === 'Profit' ? 'positive' : 'negative'}>{r.status}</StatusBadge>,
    },
  ]

  const isProfit = financialKpis.netProfit >= 0

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
      {/* Big status indicator */}
      <div
        className={`flex items-center justify-between rounded-xl border p-6 ${
          isProfit ? 'border-positive-500/30 bg-positive-50' : 'border-negative-500/30 bg-negative-50'
        }`}
      >
        <div className="flex items-center gap-4">
          <div className={`rounded-full p-3 ${isProfit ? 'bg-positive-500/15' : 'bg-negative-500/15'}`}>
            {isProfit ? (
              <TrendingUp className="h-7 w-7 text-positive-600" />
            ) : (
              <TrendingDown className="h-7 w-7 text-negative-600" />
            )}
          </div>
          <div>
            <p className={`text-sm font-semibold ${isProfit ? 'text-positive-600' : 'text-negative-600'}`}>
              Company Status: {isProfit ? 'Profit' : 'Loss'}
            </p>
            <p className="text-2xl font-semibold text-brand-950">{formatCurrency(financialKpis.netProfit)}</p>
          </div>
        </div>
        <div className="text-right text-sm text-brand-500">
          <p>Profit Margin</p>
          <p className="text-lg font-semibold text-brand-950">{formatPercent(financialKpis.profitMargin)}</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Total Revenue" value={formatCurrency(financialKpis.totalRevenue)} icon={Wallet} subtext="this month" />
        <KpiCard label="Total Expenses" value={formatCurrency(financialKpis.totalExpenses)} icon={Wallet} subtext="this month" />
        <KpiCard
          label="Receivables"
          value={formatCurrency(financialKpis.receivables)}
          icon={ArrowDownToLine}
          subtext="yet to be collected"
        />
        <KpiCard
          label="Payables"
          value={formatCurrency(financialKpis.payables)}
          icon={ArrowUpFromLine}
          subtext="money owed"
        />
      </div>

      {/* Combo chart */}
      <ChartWrapper title="Revenue vs Expenses with Net Profit" subtitle="Last 6 months">
        <ComposedChart data={revenueExpenseProfit}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e8ee" vertical={false} />
          <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#6b84a8" />
          <YAxis tick={{ fontSize: 12 }} stroke="#6b84a8" />
          <Tooltip formatter={(v) => formatCurrency(v)} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Bar dataKey="revenue" name="Revenue" fill="#818cf8" radius={[6, 6, 0, 0]} />
          <Bar dataKey="expenses" name="Expenses" fill="#f59e0b" radius={[6, 6, 0, 0]} />
          <Line type="monotone" dataKey="profit" name="Net Profit" stroke="#16a34a" strokeWidth={2.5} dot={{ r: 3 }} />
        </ComposedChart>
      </ChartWrapper>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartWrapper title="Branch Profit/Loss" subtitle="Worst to best performing">
          <BarChart data={branchProfitLoss} layout="vertical" margin={{ left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e8ee" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 12 }} stroke="#6b84a8" />
            <YAxis type="category" dataKey="branch" tick={{ fontSize: 12 }} stroke="#6b84a8" width={110} />
            <Tooltip formatter={(v) => formatCurrency(v)} />
            <Bar dataKey="profit" name="Profit" radius={[0, 6, 6, 0]}>
              {branchProfitLoss.map((entry, i) => (
                <Cell key={i} fill={entry.profit >= 0 ? '#22c55e' : '#ef4444'} />
              ))}
            </Bar>
          </BarChart>
        </ChartWrapper>

        <ChartWrapper title="Profit Margin Trend" subtitle="Last 6 months">
          <ComposedChart data={profitMarginTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e8ee" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#6b84a8" />
            <YAxis tick={{ fontSize: 12 }} stroke="#6b84a8" unit="%" />
            <Tooltip formatter={(v) => `${v}%`} />
            <Line type="monotone" dataKey="margin" name="Margin %" stroke="#4f46e5" strokeWidth={2.5} dot={{ r: 3 }} />
          </ComposedChart>
        </ChartWrapper>
      </div>

      {/* Table */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-brand-950">Branch Breakdown</h3>
        <TableFilterBar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search branch..."
          filters={[{ key: 'branch', label: 'Branch', options: branchProfitLoss.map((b) => b.branch) }]}
          values={{ branch: branchFilter }}
          onFilterChange={(_, value) => setBranchFilter(value)}
        />
        <DataTable columns={columns} rows={filtered} pageSize={10} />
      </div>
    </div>
  )
}