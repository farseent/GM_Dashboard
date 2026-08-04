import { useMemo, useState } from 'react'
import { Flame, Trophy, Star, RotateCcw } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
  PieChart, Pie, Cell,
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
import { formatCurrency, formatPercent } from '../../lib/formatters'
import {
  tours,
  toursKpis,
  bookingsByTour,
  revenueProfitByTour,
  revenueShareByCategory,
} from '../../data/products.data'

const PIE_COLORS = ['#4f46e5', '#818cf8', '#22c55e', '#f59e0b', '#ef4444']

function marginStatus(margin) {
  if (margin >= 45) return 'positive'
  if (margin >= 30) return 'warning'
  return 'negative'
}

export default function ProductsPage() {
  const isLoading = useDelayedLoading(500)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [branchFilter, setBranchFilter] = useState('All')

  const filtered = useMemo(
    () =>
      filterRows(tours, {
        search,
        searchKeys: ['name'],
        fieldFilters: { category: categoryFilter, branch: branchFilter },
      }),
    [search, categoryFilter, branchFilter]
  )

  const columns = [
    { key: 'name', label: 'Tour', sortable: true },
    { key: 'category', label: 'Category', sortable: true },
    { key: 'bookings', label: 'Bookings', sortable: true, align: 'right' },
    { key: 'revenue', label: 'Revenue', sortable: true, align: 'right', render: (r) => formatCurrency(r.revenue) },
    { key: 'profit', label: 'Profit', sortable: true, align: 'right', render: (r) => formatCurrency(r.profit) },
    {
      key: 'margin',
      label: 'Margin',
      sortable: true,
      align: 'right',
      render: (r) => <StatusBadge status={marginStatus(r.margin)}>{formatPercent(r.margin)}</StatusBadge>,
    },
    { key: 'rating', label: 'Rating', sortable: true, align: 'right', render: (r) => `★ ${r.rating}` },
    {
      key: 'cancellationRate',
      label: 'Cancellation',
      sortable: true,
      align: 'right',
      render: (r) => formatPercent(r.cancellationRate),
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
          label="Most Booked Tour"
          value={toursKpis.mostBooked.name}
          icon={Flame}
          subtext={`${toursKpis.mostBooked.bookings} bookings`}
        />
        <KpiCard
          label="Most Profitable Tour"
          value={toursKpis.mostProfitable.name}
          icon={Trophy}
          subtext={formatCurrency(toursKpis.mostProfitable.profit)}
        />
        <KpiCard label="Avg. Customer Rating" value={`★ ${toursKpis.avgRating}`} icon={Star} subtext="across all tours" />
        <KpiCard
          label="Avg. Cancellation Rate"
          value={formatPercent(toursKpis.avgCancellation)}
          icon={RotateCcw}
          trend={{ direction: 'down', value: formatPercent(toursKpis.avgCancellation), tone: 'warning' }}
        />
      </div>
 
      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ChartWrapper title="Bookings per Tour" subtitle="Top 8, most to least sold">
            <BarChart data={bookingsByTour}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e8ee" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="#6b84a8" interval={0} angle={-20} textAnchor="end" height={60} />
              <YAxis tick={{ fontSize: 12 }} stroke="#6b84a8" allowDecimals={false} />
              <ChartTooltip />
              <Bar dataKey="bookings" fill="#4f46e5" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ChartWrapper>
        </div>
 
        <ChartWrapper title="Revenue Share by Category" subtitle="This period">
          <PieChart>
            <Pie data={revenueShareByCategory} dataKey="value" nameKey="name" innerRadius={50} outerRadius={78} paddingAngle={2}  stroke="none">
              {revenueShareByCategory.map((_, i) => (
                <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
              ))}
            </Pie>
            <ChartTooltip formatter={(v) => formatCurrency(v)} />
          </PieChart>
        </ChartWrapper>
      </div>
 
      <ChartWrapper title="Revenue vs Profit per Tour" subtitle="Top 8 by revenue" height={280}>
        <BarChart data={revenueProfitByTour}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e8ee" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="#6b84a8" interval={0} angle={-20} textAnchor="end" height={60} />
          <YAxis tick={{ fontSize: 12 }} stroke="#6b84a8" />
          <ChartTooltip formatter={(v) => formatCurrency(v)} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Bar dataKey="revenue" name="Revenue" fill="#818cf8" radius={[6, 6, 0, 0]} />
          <Bar dataKey="profit" name="Profit" fill="#22c55e" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ChartWrapper>
 
      {/* Table */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-fg">All Tours</h3>
        <TableFilterBar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search tour..."
          filters={[
            { key: 'category', label: 'Category', options: ['Domestic', 'International', 'Adventure', 'Family', 'Honeymoon'] },
            { key: 'branch', label: 'Branch', options: ['Kochi', 'Bengaluru', 'Chennai', 'Coimbatore', 'Mysuru'] },
          ]}
          values={{ category: categoryFilter, branch: branchFilter }}
          onFilterChange={(key, value) => {
            if (key === 'category') setCategoryFilter(value)
            if (key === 'branch') setBranchFilter(value)
          }}
        />
        <DataTable columns={columns} rows={filtered} pageSize={10} />
      </div>
    </div>
  )
}