import { useEffect, useMemo, useState } from 'react'
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

import {
  getReceipts
} from '../../api/receiptAPI'

const STATUS_TONE = { Paid: 'positive', Pending: 'warning', Refunded: 'negative' }
const PIE_COLORS = ['#4f46e5', '#818cf8', '#22c55e', '#f59e0b', '#ef4444']

export default function ReceiptsPage() {
  const isLoading = useDelayedLoading(500)
  const [search, setSearch] = useState('')
  const [branchFilter, setBranchFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [receipts, setReceipts] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ totalPages: 1, currentPage: 1, total: 0 })
  const [sortKey, setSortKey] = useState(null)
  const [sortDir, setSortDir] = useState('asc')
  
  const handleResetFilters = () => {
    setSearch('')
    setBranchFilter('All')
    setStatusFilter('All')
  }
  
  const RECEIPTS_PAGE_SIZE = 5
  const fetchReceipts = async () => {
    try {
      setLoading(true)
      const params = { page, limit: RECEIPTS_PAGE_SIZE }
      
      const SORT_FIELD_MAP = {
        tour: 'primaryDestinationName.label',
        branch: 'state',
        totalAmount: 'totalAmountToBePaid',
        paidAmount: 'totalAmountPaid',
      }

      if (sortKey) {
         params.sortField = SORT_FIELD_MAP[sortKey] || sortKey
         params.sortOrder = sortDir
       }
      
      if (statusFilter !== 'All') params.status = statusFilter
      if (search) params.search = search

      const res = await getReceipts(params)

      if (res.success) {
        const dataWithId = res.data.map(r => ({ ...r, id: r._id }))
        setReceipts(dataWithId)
        setPagination(res.pagination)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReceipts()
  }, [page, branchFilter, statusFilter, search, sortKey, sortDir])

  useEffect(() => {
    setPage(1)
  }, [branchFilter, statusFilter, search])

  const filtered = receipts

  const columns = [
  { key: 'clientId', label: 'Client ID', sortable: true },
  { key: 'name', label: 'Customer', sortable: true },
  { key: 'mobileNumber', label: 'Phone', sortable: true, },
  { key: 'tour', label: 'Tour', sortable: true, render: (r) => r.primaryDestinationName?.label || '-', },
  { key: 'branch', label: 'Branch', sortable: true, render: (r) => r.state || '-', },
  { key: 'totalAmount', label: 'Total', sortable: true, render: (r) => formatCurrency(r.totalAmountToBePaid || 0), },
  { key: 'paidAmount', label: 'Paid', sortable: true, render: (r) => formatCurrency(r.totalAmountPaid || 0), },
  { key: 'balance', label: 'Balance', sortable: true, render: (r) => formatCurrency(r.balance || 0), },
  { key: 'status', label: 'Status', sortable: true,
    render: (r) => {
    let status = 'Pending';
    if (r.balance === 0) {
      status = 'Paid';
    } else if (r.totalAmountPaid > 0 && r.balance > 0) {
      status = 'Partially Paid';
    }
      return (
        <div>
          <StatusBadge status={STATUS_TONE[status]}>{status}</StatusBadge>
          {status === 'Paid' && (
            <p className="mt-1 text-xs text-success-600">Fully paid</p>
          )}
          {status === 'Pending' && r.totalAmountPaid > 0 && (
            <p className="mt-1 text-xs text-warning-600">{formatCurrency(r.balance)} due</p>
          )}
          {status === 'Pending' && r.totalAmountPaid === 0 && (
            <p className="mt-1 text-xs text-warning-600">No payment made yet</p>
          )}
        </div>
      );
    },
  }
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
            { key: 'status', label: 'Status', options: ['Paid', 'Pending', 'Refunded'] },
          ]}
          values={{ branch: branchFilter, status: statusFilter }}
          onFilterChange={(key, value) => {
            if (key === 'branch') setBranchFilter(value)
            if (key === 'status') setStatusFilter(value)
          }}
          onReset={handleResetFilters}
        />
        <DataTable 
          columns={columns}
          rows={filtered}
          pageSize={RECEIPTS_PAGE_SIZE}
          page={page}
          totalPages={pagination.totalPages}
          totalCount={pagination.total}
          loading={loading}
          onPageChange={setPage}
          sortKey={sortKey}
          sortDir={sortDir}
          onSortChange={(key, dir) => {
            setSortKey(key)
            setSortDir(dir)
          }}
          serverPagination 
        />
      </div>
    </div>
  )
}

// import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
// import { IndianRupee, Calendar, CalendarDays, RotateCcw } from 'lucide-react'
// import {
//   AreaChart, Area, XAxis, YAxis, CartesianGrid, Legend,
//   PieChart, Pie, Cell,
//   BarChart, Bar,
// } from 'recharts'

// import KpiCard from '../../components/kpi/KpiCard'
// import StatusBadge from '../../components/badge/StatusBadge'
// import ChartWrapper from '../../components/charts/ChartWrapper'
// import TableFilterBar from '../../components/table/TableFilterBar'
// import DataTable from '../../components/table/DataTable'
// import ChartTooltip from '../../components/charts/ChartTooltip'
// import { KpiCardSkeleton, ChartSkeleton, TableSkeleton } from '../../components/ui/Skeleton'
// import { formatCurrency } from '../../lib/formatters'
// import { useDebouncedValue } from '../../lib/useDebouncedValue'

// import {
//   getReceipts,
//   getReceiptStatsSummary,
//   getReceiptRevenueTrend,
//   getReceiptPaymentTypeSplit,
//   getReceiptBookingsPerTour,
// } from '../../api/receiptAPI'

// const STATUS_TONE = { Paid: 'positive', Pending: 'warning', 'Partially Paid': 'warning', Refunded: 'negative' }
// const PIE_COLORS = ['#4f46e5', '#818cf8', '#22c55e', '#f59e0b', '#ef4444']

// // Shape mirrors what /receipt/stats/summary returns.
// // netReceipts isn't rendered as its own KPI yet — add a card for it if/when you want it surfaced.
// const emptySummary = {
//   totalToday: 0,
//   totalThisWeek: 0,
//   totalThisMonth: 0,
//   totalRefunds: 0,
//   netReceipts: 0,
// }

// const RECEIPTS_PAGE_SIZE = 5

// export default function ReceiptsPage() {
//   const [search, setSearch] = useState('')
//   const debouncedSearch = useDebouncedValue(search, 400)
//   const abortControllerRef = useRef(null)

//   const [branchFilter, setBranchFilter] = useState('All')
//   const [statusFilter, setStatusFilter] = useState('All')

//   const [receipts, setReceipts] = useState([])
//   const [loading, setLoading] = useState(true)
//   const [page, setPage] = useState(1)
//   const [pagination, setPagination] = useState({ totalPages: 1, currentPage: 1, total: 0 })
//   const [sortKey, setSortKey] = useState(null)
//   const [sortDir, setSortDir] = useState('asc')

//   // Analytics state
//   const [summary, setSummary] = useState(emptySummary)
//   const [revenueTrend, setRevenueTrend] = useState([])
//   const [paymentTypeSplit, setPaymentTypeSplit] = useState([])
//   const [bookingsPerTour, setBookingsPerTour] = useState([])
//   const [loadingStats, setLoadingStats] = useState(true)
//   const [statsError, setStatsError] = useState('')

//   useEffect(() => {
//     fetchReceipts()
//   }, [page, debouncedSearch, branchFilter, statusFilter, sortKey, sortDir])

//   // Stats: fetch once. Re-run manually (e.g. after a receipt is created/updated
//   // elsewhere) if you want these to stay in sync with table mutations.
//   useEffect(() => {
//     fetchStats()
//   }, [])

//   useEffect(() => {
//     setPage(1)
//   }, [debouncedSearch, branchFilter, statusFilter])

//   useEffect(() => {
//     return () => {
//       abortControllerRef.current?.abort()
//     }
//   }, [])

//   const fetchReceipts = async () => {
//     // Cancel whatever request is still in flight — its response would be stale anyway
//     abortControllerRef.current?.abort()
//     const controller = new AbortController()
//     abortControllerRef.current = controller

//     try {
//       setLoading(true)
//       const params = { page, limit: RECEIPTS_PAGE_SIZE }

//       const SORT_FIELD_MAP = {
//         tour: 'primaryDestinationName.label',
//         branch: 'state',
//         totalAmount: 'totalAmountToBePaid',
//         paidAmount: 'totalAmountPaid',
//       }

//       if (sortKey) {
//         params.sortField = SORT_FIELD_MAP[sortKey] || sortKey
//         params.sortOrder = sortDir
//       }

//       if (branchFilter !== 'All') params.branch = branchFilter
//       if (statusFilter !== 'All') params.status = statusFilter
//       if (debouncedSearch) params.search = debouncedSearch

//       const res = await getReceipts(params, controller.signal)

//       if (res.success) {
//         const dataWithId = res.data.map(r => ({ ...r, id: r._id }))
//         setReceipts(dataWithId)
//         setPagination(res.pagination)
//       }
//     } catch (err) {
//       if (err.code === 'ERR_CANCELED') {
//         // Expected — a newer request superseded this one, nothing to do
//         return
//       }
//       console.error('Failed to fetch receipts', err)
//     } finally {
//       // Only clear loading if this request is still the current one
//       if (abortControllerRef.current === controller) {
//         setLoading(false)
//       }
//     }
//   }

//   const fetchStats = async () => {
//     try {
//       setLoadingStats(true)
//       setStatsError('')

//       const [summaryRes, revenueRes, paymentRes, bookingsRes] = await Promise.all([
//         getReceiptStatsSummary(),
//         getReceiptRevenueTrend(8),
//         getReceiptPaymentTypeSplit(),
//         getReceiptBookingsPerTour(),
//       ])

//       setSummary(summaryRes.data || emptySummary)
//       setRevenueTrend(revenueRes.data || [])
//       setPaymentTypeSplit(paymentRes.data || [])
//       setBookingsPerTour(bookingsRes.data || [])
//     } catch (err) {
//       console.error('Failed to fetch receipt stats:', err)
//       setStatsError('Failed to load analytics.')
//     } finally {
//       setLoadingStats(false)
//     }
//   }

//   const handleResetFilters = useCallback(() => {
//     setSearch('')
//     setBranchFilter('All')
//     setStatusFilter('All')
//   }, [])

//   const handleSortChange = useCallback((key, dir) => {
//     setSortKey(key)
//     setSortDir(dir)
//     setPage(1)
//   }, [])

//   const columns = useMemo(() => [
//     { key: 'clientId', label: 'Client ID', sortable: true },
//     { key: 'name', label: 'Customer', sortable: true },
//     { key: 'mobileNumber', label: 'Phone', sortable: true },
//     { key: 'tour', label: 'Tour', sortable: true, render: (r) => r.primaryDestinationName?.label || '-' },
//     { key: 'branch', label: 'Branch', sortable: true, render: (r) => r.state || '-' },
//     { key: 'totalAmount', label: 'Total', sortable: true, render: (r) => formatCurrency(r.totalAmountToBePaid || 0) },
//     { key: 'paidAmount', label: 'Paid', sortable: true, render: (r) => formatCurrency(r.totalAmountPaid || 0) },
//     { key: 'balance', label: 'Balance', sortable: true, render: (r) => formatCurrency(r.balance || 0) },
//     {
//       key: 'status',
//       label: 'Status',
//       sortable: true,
//       render: (r) => {
//         let status = 'Pending'
//         if (r.balance === 0) {
//           status = 'Paid'
//         } else if (r.totalAmountPaid > 0 && r.balance > 0) {
//           status = 'Partially Paid'
//         }
//         return (
//           <div>
//             <StatusBadge status={STATUS_TONE[status]}>{status}</StatusBadge>
//             {status === 'Paid' && (
//               <p className="mt-1 text-xs text-success-600">Fully paid</p>
//             )}
//             {status !== 'Paid' && r.totalAmountPaid > 0 && (
//               <p className="mt-1 text-xs text-warning-600">{formatCurrency(r.balance)} due</p>
//             )}
//             {status === 'Pending' && r.totalAmountPaid === 0 && (
//               <p className="mt-1 text-xs text-warning-600">No payment made yet</p>
//             )}
//           </div>
//         )
//       },
//     },
//   ], [])

//   // Payment type split can have more slices than we want to render individually —
//   // same "top N + Other" pattern the Expenses category pie chart uses.
//   const MAX_SLICES = 5
//   const pieData = useMemo(() => {
//     if (paymentTypeSplit.length <= MAX_SLICES) return paymentTypeSplit
//     const sorted = [...paymentTypeSplit].sort((a, b) => b.value - a.value)
//     const top = sorted.slice(0, MAX_SLICES)
//     const rest = sorted.slice(MAX_SLICES)
//     const otherTotal = rest.reduce((sum, c) => sum + c.value, 0)
//     return otherTotal > 0 ? [...top, { name: 'Other', value: otherTotal }] : top
//   }, [paymentTypeSplit])

//   const areaChartElement = useMemo(() => (
//     <AreaChart data={revenueTrend}>
//       <defs>
//         <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
//           <stop offset="0%" stopColor="#4f46e5" stopOpacity={0.35} />
//           <stop offset="100%" stopColor="#4f46e5" stopOpacity={0} />
//         </linearGradient>
//       </defs>
//       <CartesianGrid strokeDasharray="3 3" stroke="#e5e8ee" vertical={false} />
//       <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#6b84a8" />
//       <YAxis tick={{ fontSize: 12 }} stroke="#6b84a8" />
//       <ChartTooltip formatter={(v) => formatCurrency(v)} />
//       <Legend wrapperStyle={{ fontSize: 11 }} />
//       <Area type="monotone" dataKey="value" stroke="#4f46e5" strokeWidth={2.5} fill="url(#revenueFill)" />
//     </AreaChart>
//   ), [revenueTrend])

//   const pieChartElement = useMemo(() => (
//     <PieChart>
//       <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={80} paddingAngle={2} stroke="none">
//         {pieData.map((_, i) => (
//           <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
//         ))}
//       </Pie>
//       <ChartTooltip formatter={(v) => `${v}%`} />
//       <Legend wrapperStyle={{ fontSize: 11 }} />
//     </PieChart>
//   ), [pieData])

//   const barChartElement = useMemo(() => (
//     <BarChart data={bookingsPerTour}>
//       <CartesianGrid strokeDasharray="3 3" stroke="#e5e8ee" vertical={false} />
//       <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#6b84a8" />
//       <YAxis tick={{ fontSize: 12 }} stroke="#6b84a8" allowDecimals={false} />
//       <Legend wrapperStyle={{ fontSize: 11 }} />
//       <ChartTooltip />
//       <Bar dataKey="bookings" fill="#22c55e" radius={[6, 6, 0, 0]} />
//     </BarChart>
//   ), [bookingsPerTour])

//   return (
//     <div className="space-y-6">
//       {statsError && (
//         <p className="rounded-md border border-negative-100 bg-negative-50 px-3 py-2 text-xs text-negative-600">
//           {statsError}
//         </p>
//       )}

//       {/* KPI Cards */}
//       {loadingStats ? (
//         <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
//           {Array.from({ length: 4 }).map((_, i) => <KpiCardSkeleton key={i} />)}
//         </div>
//       ) : (
//         <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
//           <KpiCard label="Received Today" value={formatCurrency(summary.totalToday)} icon={Calendar} subtext="across all branches" />
//           <KpiCard label="Received This Week" value={formatCurrency(summary.totalThisWeek)} icon={CalendarDays} subtext="Mon–today" />
//           <KpiCard label="Received This Month" value={formatCurrency(summary.totalThisMonth)} icon={IndianRupee} subtext="month to date" />
//           <KpiCard
//             label="Total Refunds"
//             value={formatCurrency(summary.totalRefunds)}
//             icon={RotateCcw}
//             subtext="this period"
//           />
//         </div>
//       )}

//       {/* Charts */}
//       <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
//         <div className="lg:col-span-2">
//           <ChartWrapper title="Revenue Received Over Time" subtitle="Last 8 days">
//             {loadingStats ? <ChartSkeleton /> : areaChartElement}
//           </ChartWrapper>
//         </div>

//         <ChartWrapper title="Payment Type Split" subtitle="% of transactions">
//           {loadingStats ? <ChartSkeleton /> : pieChartElement}
//         </ChartWrapper>
//       </div>

//       <ChartWrapper title="Bookings Closed per Tour" subtitle="This period" height={240}>
//         {loadingStats ? <ChartSkeleton /> : barChartElement}
//       </ChartWrapper>

//       {/* Table */}
//       <div>
//         <h3 className="mb-3 text-sm font-semibold text-fg">Transaction Log</h3>
//         <TableFilterBar
//           search={search}
//           onSearchChange={setSearch}
//           searchPlaceholder="Search customer, customer ID, or phone..."
//           filters={[
//             { key: 'branch', label: 'Branch', options: ['Kochi', 'Bengaluru', 'Chennai', 'Coimbatore', 'Mysuru'] },
//             { key: 'status', label: 'Status', options: ['Paid', 'Pending', 'Refunded'] },
//           ]}
//           values={{ branch: branchFilter, status: statusFilter }}
//           onFilterChange={(key, value) => {
//             if (key === 'branch') setBranchFilter(value)
//             if (key === 'status') setStatusFilter(value)
//           }}
//           onReset={handleResetFilters}
//         />
//         <DataTable
//           columns={columns}
//           rows={receipts}
//           pageSize={RECEIPTS_PAGE_SIZE}
//           page={page}
//           totalPages={pagination.totalPages}
//           totalCount={pagination.total}
//           loading={loading}
//           onPageChange={setPage}
//           sortKey={sortKey}
//           sortDir={sortDir}
//           onSortChange={handleSortChange}
//           serverPagination
//         />
//       </div>
//     </div>
//   )
// }