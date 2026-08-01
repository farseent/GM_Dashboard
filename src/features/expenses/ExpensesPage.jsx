import { useMemo, useState } from 'react'
import { Wallet, Layers, CalendarClock, TrendingUp } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell,
  LineChart, Line,
} from 'recharts'

import KpiCard from '../../components/kpi/KpiCard'
import StatusBadge from '../../components/badge/StatusBadge'
import ChartWrapper from '../../components/charts/ChartWrapper'
import TableFilterBar from '../../components/table/TableFilterBar'
import DataTable from '../../components/table/DataTable'
import { KpiCardSkeleton, ChartSkeleton, TableSkeleton } from '../../components/ui/Skeleton'
import { filterRows } from '../../lib/sorting'
import { useDelayedLoading } from '../../lib/useDelayedLoading'
import { formatCurrency, formatDate } from '../../lib/formatters'
import {
  expenses,
  expensesKpis,
  monthlyByCategory,
  categoryShare,
  expenseTrend,
} from '../../data/expenses.data'

const CATEGORY_KEYS = ['Salary', 'Rent', 'Utilities', 'Marketing', 'Other']
const STACK_COLORS = ['#4f46e5', '#818cf8', '#f59e0b', '#22c55e', '#94a3b8']
const PIE_COLORS = ['#4f46e5', '#818cf8', '#6366f1', '#f59e0b', '#22c55e', '#ef4444', '#94a3b8', '#cbd5e1']

export default function ExpensesPage() {
  const isLoading = useDelayedLoading(500)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [branchFilter, setBranchFilter] = useState('All')
  const [recurringFilter, setRecurringFilter] = useState('All')

  const filtered = useMemo(() => {
    let rows = expenses
    if (recurringFilter !== 'All') {
      rows = rows.filter((e) => (recurringFilter === 'Recurring' ? e.recurring : !e.recurring))
    }
    return filterRows(rows, {
      search,
      searchKeys: ['category', 'approvedBy'],
      fieldFilters: { category: categoryFilter, branch: branchFilter },
    })
  }, [search, categoryFilter, branchFilter, recurringFilter])

  const columns = [
    { key: 'category', label: 'Category', sortable: true },
    { key: 'branch', label: 'Branch', sortable: true },
    { key: 'amount', label: 'Amount', sortable: true, align: 'right', render: (r) => formatCurrency(r.amount) },
    {
      key: 'recurring',
      label: 'Type',
      sortable: true,
      render: (r) => (
        <StatusBadge status={r.recurring ? 'warning' : 'neutral'}>
          {r.recurring ? 'Recurring' : 'One-time'}
        </StatusBadge>
      ),
    },
    { key: 'mode', label: 'Mode', sortable: true },
    { key: 'approvedBy', label: 'Approved By', sortable: true },
    { key: 'date', label: 'Date', sortable: true, render: (r) => formatDate(r.date) },
    {
      key: 'dueDate',
      label: 'Next Due',
      sortable: true,
      render: (r) => (r.dueDate ? formatDate(r.dueDate) : <span className="text-brand-400">—</span>),
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
        <KpiCard label="Total Expense This Month" value={formatCurrency(expensesKpis.totalThisMonth)} icon={Wallet} subtext="all categories" />
        <KpiCard
          label="Largest Category"
          value={expensesKpis.largestCategory}
          icon={Layers}
          subtext={formatCurrency(expensesKpis.largestCategoryAmount)}
        />
        <KpiCard
          label="Upcoming Due Payments"
          value={expensesKpis.upcomingDueCount}
          icon={CalendarClock}
          subtext={formatCurrency(expensesKpis.upcomingDueAmount)}
        />
        <KpiCard
          label="Expense Trend"
          value="+4.8%"
          icon={TrendingUp}
          trend={{ direction: 'up', value: '+4.8%', tone: 'negative' }}
          subtext="vs last month"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ChartWrapper title="Monthly Expenses by Category" subtitle="Last 4 months, stacked">
            <BarChart data={monthlyByCategory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e8ee" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#6b84a8" />
              <YAxis tick={{ fontSize: 12 }} stroke="#6b84a8" />
              <Tooltip formatter={(v) => formatCurrency(v)} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              {CATEGORY_KEYS.map((key, i) => (
                <Bar key={key} dataKey={key} stackId="a" fill={STACK_COLORS[i]} radius={i === CATEGORY_KEYS.length - 1 ? [6, 6, 0, 0] : 0} />
              ))}
            </BarChart>
          </ChartWrapper>
        </div>

        <ChartWrapper title="Category Share" subtitle="Of total spend">
          <PieChart>
            <Pie data={categoryShare} dataKey="value" nameKey="name" innerRadius={50} outerRadius={78} paddingAngle={2}>
              {categoryShare.map((_, i) => (
                <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(v) => formatCurrency(v)} />
          </PieChart>
        </ChartWrapper>
      </div>

      <ChartWrapper title="Expense Trend" subtitle="Last 6 months — spot the spikes" height={240}>
        <LineChart data={expenseTrend}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e8ee" vertical={false} />
          <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#6b84a8" />
          <YAxis tick={{ fontSize: 12 }} stroke="#6b84a8" />
          <Tooltip formatter={(v) => formatCurrency(v)} />
          <Line type="monotone" dataKey="value" stroke="#ef4444" strokeWidth={2.5} dot={{ r: 3 }} />
        </LineChart>
      </ChartWrapper>

      {/* Table */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-brand-950">Expense Log</h3>
        <TableFilterBar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search category or approver..."
          filters={[
            { key: 'category', label: 'Category', options: ['Salary', 'Rent', 'Utilities', 'Marketing', 'Vehicle/Transport', 'Vendor Payments', 'Maintenance', 'Miscellaneous'] },
            { key: 'branch', label: 'Branch', options: ['Kochi', 'Bengaluru', 'Chennai', 'Coimbatore', 'Mysuru'] },
            { key: 'recurring', label: 'Type', options: ['Recurring', 'One-time'] },
          ]}
          values={{ category: categoryFilter, branch: branchFilter, recurring: recurringFilter }}
          onFilterChange={(key, value) => {
            if (key === 'category') setCategoryFilter(value)
            if (key === 'branch') setBranchFilter(value)
            if (key === 'recurring') setRecurringFilter(value)
          }}
        />
        <DataTable columns={columns} rows={filtered} pageSize={10} />
      </div>
    </div>
  )
}