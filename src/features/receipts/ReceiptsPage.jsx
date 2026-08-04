import { useMemo, useState } from 'react'
import { IndianRupee, Calendar, CalendarDays, RotateCcw } from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell,
  BarChart, Bar, Legend,
} from 'recharts'

import KpiCard from '../../components/kpi/KpiCard'
import StatusBadge from '../../components/badge/StatusBadge'
import ChartWrapper from '../../components/charts/ChartWrapper'
import TableFilterBar from '../../components/table/TableFilterBar'
import DataTable from '../../components/table/DataTable'
import ChartTooltip from '../../components/charts/ChartTooltip'
import { KpiCardSkeleton, ChartSkeleton, TableSkeleton } from '../../components/ui/Skeleton'
import { useDelayedLoading } from '../../lib/useDelayedLoading'
import { filterRows } from '../../lib/sorting'
import { formatCurrency, formatDate } from '../../lib/formatters'
import {
  receipts,
  receiptsKpis,
  revenueTrend,
  paymentTypeSplit,
  bookingsPerTour,
} from '../../data/receipts.data'

const STATUS_TONE = { Paid: 'positive', Pending: 'warning', Refunded: 'negative' }
const PIE_COLORS = ['#4f46e5', '#818cf8', '#22c55e', '#f59e0b', '#ef4444']

export default function ReceiptsPage() {
  const isLoading = useDelayedLoading(500)
  const [search, setSearch] = useState('')
  const [branchFilter, setBranchFilter] = useState('All')
  const [methodFilter, setMethodFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')

  const filtered = useMemo(
    () =>
      filterRows(receipts, {
        search,
        searchKeys: ['customer', 'clientId', 'phone'],
        fieldFilters: { branch: branchFilter, method: methodFilter, status: statusFilter },
      }),
    [search, branchFilter, methodFilter, statusFilter]
  )

  const columns = [
    { key: 'clientId', label: 'Client ID', sortable: true },
    { key: 'customer', label: 'Customer', sortable: true },
    { key: 'phone', label: 'Phone', sortable: true },
    { key: 'tour', label: 'Tour', sortable: true },
    { key: 'branch', label: 'Branch', sortable: true },
    // { key: 'method', label: 'Method', sortable: true },
    { key: 'totalAmount', label: 'Total', sortable: true, align: 'right', render: (r) => formatCurrency(r.totalAmount),},
    { key: 'paidAmount', label: 'Paid', sortable: true, align: 'right', render: (r) => formatCurrency(r.paidAmount),},
    { key: 'balance', label: 'Balance', sortable: true, align: 'right', render: (r) => formatCurrency(r.balance),},
    // { key: 'date', label: 'Date', sortable: true, render: (r) => formatDate(r.date) },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (r) => (
        <div>
          <StatusBadge status={STATUS_TONE[r.status]}>{r.status}</StatusBadge>
          {r.status === 'Refunded' && (
            <p className="mt-1 text-xs text-negative-600">{r.refundReason}</p>
          )}
          {r.status === 'Pending' && (
            <p className="mt-1 text-xs text-warning-600">{formatCurrency(r.balance)} due</p>
          )}
        </div>
      ),
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
        <KpiCard label="Received Today" value={formatCurrency(receiptsKpis.totalToday)} icon={Calendar} subtext="across all branches" />
        <KpiCard label="Received This Week" value={formatCurrency(receiptsKpis.totalThisWeek)} icon={CalendarDays} subtext="Mon–today" />
        <KpiCard label="Received This Month" value={formatCurrency(receiptsKpis.totalThisMonth)} icon={IndianRupee} subtext="month to date" />
        <KpiCard
          label="Total Refunds"
          value={formatCurrency(receiptsKpis.totalRefunds)}
          icon={RotateCcw}
          trend={{ direction: 'up', value: `${receipts.filter((r) => r.status === 'Refunded').length} txns`, tone: 'negative' }}
          subtext="this period"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ChartWrapper title="Revenue Received Over Time" subtitle="Last 8 days">
            <AreaChart data={revenueTrend}>
              <defs>
                <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4f46e5" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#4f46e5" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e8ee" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#6b84a8" />
              <YAxis tick={{ fontSize: 12 }} stroke="#6b84a8" />
              <ChartTooltip formatter={(v) => formatCurrency(v)} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Area type="monotone" dataKey="value" stroke="#4f46e5" strokeWidth={2.5} fill="url(#revenueFill)" />
            </AreaChart>
          </ChartWrapper>
        </div>

        <ChartWrapper title="Payment Type Split" subtitle="% of transactions">
          <PieChart>
            <Pie data={paymentTypeSplit} dataKey="value" nameKey="name" innerRadius={55} outerRadius={80} paddingAngle={2}  stroke="none">
              {paymentTypeSplit.map((_, i) => (
                <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
              ))}
            </Pie>
            <ChartTooltip formatter={(v) => `${v}%`} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
          </PieChart>
        </ChartWrapper>
      </div>

      <ChartWrapper title="Bookings Closed per Tour" subtitle="This period" height={240}>
        <BarChart data={bookingsPerTour}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e8ee" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#6b84a8" />
          <YAxis tick={{ fontSize: 12 }} stroke="#6b84a8" allowDecimals={false} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <ChartTooltip />
          <Bar dataKey="bookings" fill="#22c55e" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ChartWrapper>

      {/* Table */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-fg">Transaction Log</h3>
        <TableFilterBar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search customer, customer ID, or phone..."
          filters={[
            { key: 'branch', label: 'Branch', options: ['Kochi', 'Bengaluru', 'Chennai', 'Coimbatore', 'Mysuru'] },
            // { key: 'method', label: 'Method', options: ['UPI', 'Cash', 'Card', 'Bank Transfer', 'Wallet'] },
            { key: 'status', label: 'Status', options: ['Paid', 'Pending', 'Refunded'] },
          ]}
          values={{ branch: branchFilter, method: methodFilter, status: statusFilter }}
          onFilterChange={(key, value) => {
            if (key === 'branch') setBranchFilter(value)
            if (key === 'method') setMethodFilter(value)
            if (key === 'status') setStatusFilter(value)
          }}
        />
        <DataTable columns={columns} rows={filtered} pageSize={10} />
      </div>
    </div>
  )
}