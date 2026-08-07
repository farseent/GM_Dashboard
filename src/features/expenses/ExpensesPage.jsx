import { useEffect, useMemo, useState } from 'react'
import { Wallet, Layers, MapPin, TrendingUp, TrendingDown, Plus, Pencil, RotateCcw  } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell,
  LineChart, Line,
} from 'recharts'

import KpiCard from '../../components/kpi/KpiCard'
import StatusBadge from '../../components/badge/StatusBadge'
import ChartWrapper from '../../components/charts/ChartWrapper'
import TableFilterBar from '../../components/table/TableFilterBar'
import ChartTooltip from '../../components/charts/ChartTooltip'
import DataTable from '../../components/table/DataTable'
import AddExpenseModal from './components/AddExpenseModal'
import { KpiCardSkeleton, ChartSkeleton, TableSkeleton } from '../../components/ui/Skeleton'
import { filterRows } from '../../lib/sorting'
import { useDelayedLoading } from '../../lib/useDelayedLoading'
import { formatCurrency, formatDate } from '../../lib/formatters'
import {
  createExpense,
  createExpenseCategory,
  getExpense,
  getExpenseCategories,
  getExpenseStatsSummary,
  getMonthlyExpensesByCategory,
  getExpenseCategoryShare,
  getExpenseTrend,
  updateExpense,
} from '../../api/expenseAPI'

const STACK_COLORS = ['#4f46e5', '#818cf8', '#f59e0b', '#22c55e', '#94a3b8', '#ef4444', '#0ea5e9', '#a855f7']
const PIE_COLORS = ['#4f46e5', '#818cf8', '#6366f1', '#f59e0b', '#22c55e', '#ef4444', '#94a3b8', '#cbd5e1']

const emptySummary = {
  totalThisMonth: 0,
  totalLastMonth: 0,
  trendPercent: 0,
  largestCategory: { name: '-', amount: 0 },
  topLocation: { name: '-', locationModel: '', amount: 0 },
}

export default function ExpensesPage() {
  const isLoading = useDelayedLoading(500)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [locationFilter, setLocationFilter] = useState('All')
  const [frequencyFilter, setFrequencyFilter] = useState('All')
  const [expenses, setExpenses] = useState([])
  const [categories, setCategories] = useState([])
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState(null)
  const [loadingExpenses, setLoadingExpenses] = useState(true)
  
  // Analytics state
  const [summary, setSummary] = useState(emptySummary)
  const [monthlyByCategory, setMonthlyByCategory] = useState([])
  const [categoryShare, setCategoryShare] = useState([])
  const [expenseTrend, setExpenseTrend] = useState([])
  const [loadingStats, setLoadingStats] = useState(true)
  const [statsError, setStatsError] = useState('')

  // Category keys for the stacked bar chart are derived from whatever
  // categories actually appear in the response — not hardcoded, since
  // real category names (Fuel, Electricity, etc.) vary per company.
  const categoryKeys = useMemo(() => {
    const keys = new Set()
    monthlyByCategory.forEach((row) => {
      Object.keys(row).forEach((k) => {
        if (k !== 'month') keys.add(k)
      })
    })
    return Array.from(keys)
  }, [monthlyByCategory])

// --- filtered rows ---
  const filtered = useMemo(() => {
    let rows = expenses

    return filterRows(rows, {
      search,
      searchKeys: ['expenseName', 'notes'],
      fieldFilters: {
        category: categoryFilter,
        locationModel: locationFilter,
        frequency: frequencyFilter,
      },
      // category is an object ({name, ...}), not a primitive — tell filterRows
      // how to pull a comparable value for it
      accessors: {
        category: (row) => row.category?.name,
      },
    })
  }, [expenses, search, categoryFilter, locationFilter, frequencyFilter])
  const handleEditClick = (expense) => {
    setEditingExpense(expense)
    setIsAddModalOpen(true)
  }

  const handleAddClick = () => {
    setEditingExpense(null)
    setIsAddModalOpen(true)
  }

  const handleModalClose = () => {
    setIsAddModalOpen(false)
    setEditingExpense(null)
  }

  const columns = [
    { key: 'expenseName', label: 'Expense', sortable: true, },
    { key: 'category', label: 'Category', sortable: true, render: (r) => r.category?.name || '-', },
    { key: 'branchOrFranchise', label: 'Location', sortable: true, render: (r) => r.branchOrFranchise?.branchName || r.branchOrFranchise?.franchiseeName || "-", },
    { key: 'locationModel', label: 'Type', sortable: true, },
    { key: 'frequency', label: 'Frequency', sortable: true, },
    { key: 'amount', label: 'Amount', sortable: true, align: 'right', render: (r) => formatCurrency(r.amount), },
    {
      key: 'actions',
      label: '',
      sortable: false,
      align: 'right',
      render: (r) => (
        <button
          type="button"
          onClick={() => handleEditClick(r)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border-subtle bg-accent-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
          title="Edit expense"
        >
          <Pencil size={14} />
          <span>Edit</span>
        </button>
      ),
    },
  ]

  useEffect(() => {
    fetchExpenses()
    fetchExpenseCategories()
    fetchStats()
  }, [])

  const fetchExpenses = async () => {
    try {
      setLoadingExpenses(true)
      const response = await getExpense()
      setExpenses(response.data)
    } catch (err) {
      console.error("Failed to fetch expenses", err)
    } finally {
      setLoadingExpenses(false)
    }
  }

  const fetchStats = async () => {
    try {
      setLoadingStats(true)
      setStatsError('')

      const [summaryRes, monthlyRes, shareRes, trendRes] = await Promise.all([
        getExpenseStatsSummary(),
        getMonthlyExpensesByCategory(4),
        getExpenseCategoryShare(),
        getExpenseTrend(6),
      ])

      setSummary(summaryRes.data || emptySummary)
      setMonthlyByCategory(monthlyRes.data || [])
      setCategoryShare(shareRes.data || [])
      setExpenseTrend(trendRes.data || [])
    } catch (err) {
      console.error("Failed to fetch expense stats:", err)
      setStatsError('Failed to load analytics.')
    } finally {
      setLoadingStats(false)
    }
  }

  const handleCreateExpense = async (expenseData) => {
    try {
      await createExpense(expenseData)

      // Refresh table + analytics so KPIs/charts reflect the new expense
      await Promise.all([fetchExpenses(), fetchStats()])
    } catch (error) {
      console.error("Failed to create expense:", error)
      throw error
    }
  }

  // ⚠️ Assumes backend endpoint PUT /expense/:id exists (see updateExpense
  // in expenseAPI.js). Currently only PATCH /expense/:id/amount is
  // confirmed live — this will 404 until the full update route ships.
  const handleUpdateExpense = async (id, expenseData) => {
    try {
      await updateExpense(id, expenseData)

      // Refresh table + analytics so KPIs/charts reflect the edit
      await Promise.all([fetchExpenses(), fetchStats()])
    } catch (error) {
      console.error("Failed to update expense:", error)
      throw error
    }
  }

  const fetchExpenseCategories = async () => {
    try {
      const response = await getExpenseCategories()
      setCategories(response.data || response)
    } catch (error) {
      console.error("Failed to fetch expense categories:", error)
      return []
    }
  }

  const handleCreateExpenseCategory = async (categoryData) => {
    try {
      await createExpenseCategory(categoryData)

      // Optional: refresh category list if you're storing it in state
      // await fetchExpenseCategories();
    } catch (error) {
      console.error("Failed to create expense category:", error)
      throw error
    }
  }

  // --- reset handler ---
  const handleResetFilters = () => {
    setSearch('')
    setCategoryFilter('All')
    setLocationFilter('All')
    setFrequencyFilter('All')
  }

  // --- optional: only show the button when a filter is actually active ---
  const hasActiveFilters =
    search.trim() !== '' ||
    categoryFilter !== 'All' ||
    locationFilter !== 'All' ||
    frequencyFilter !== 'All'
  
  const categoryOptions = [
    ...new Set(
      expenses.map((e) => e.category?.name).filter(Boolean)
    ),
  ]

  const locationOptions = [
    ...new Set(
      expenses.map((e) => e.locationModel).filter(Boolean)
    ),
  ]

  const frequencyOptions = [
    ...new Set(
      expenses.map((e) => e.frequency).filter(Boolean)
    ),
  ]

  const trendDirection = summary.trendPercent >= 0 ? 'up' : 'down'
  const trendIcon = trendDirection === 'up' ? TrendingUp : TrendingDown
  const trendValue = `${summary.trendPercent >= 0 ? '+' : ''}${summary.trendPercent.toFixed(1)}%`

  // if (isLoading || loadingExpenses) {
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

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-fg">Expenses</h2>
        <button
          onClick={handleAddClick}
          className="flex items-center gap-1.5 rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
        >
          <Plus size={16} />
          Add Expense
        </button>
      </div>

      {statsError && (
        <p className="rounded-md border border-negative-100 bg-negative-50 px-3 py-2 text-xs text-negative-600">
          {statsError}
        </p>
      )}

      {/* KPI Cards */}
      {loadingStats ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <KpiCardSkeleton key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            label="Total Expense This Month"
            value={formatCurrency(summary.totalThisMonth)}
            icon={Wallet}
            subtext="all categories"
          />
          <KpiCard
            label="Largest Category"
            value={summary.largestCategory.name}
            icon={Layers}
            subtext={formatCurrency(summary.largestCategory.amount)}
          />
          <KpiCard
            label="Top Spending Location"
            value={summary.topLocation.name}
            icon={MapPin}
            subtext={formatCurrency(summary.topLocation.amount)}
          />
          <KpiCard
            label="Expense Trend"
            value={trendValue}
            icon={trendIcon}
            trend={{ direction: trendDirection, value: trendValue, tone: trendDirection === 'up' ? 'negative' : 'positive' }}
            subtext="vs last month"
          />
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ChartWrapper title="Monthly Expenses by Category" subtitle="Last 4 months, stacked">
            {loadingStats ? (
              <ChartSkeleton />
            ) : (
              <BarChart data={monthlyByCategory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e8ee" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#6b84a8" />
                <YAxis tick={{ fontSize: 12 }} stroke="#6b84a8" />
                <ChartTooltip formatter={(v) => formatCurrency(v)} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                {categoryKeys.map((key, i) => (
                  <Bar key={key} dataKey={key} stackId="a" fill={STACK_COLORS[i % STACK_COLORS.length]} radius={i === categoryKeys.length - 1 ? [6, 6, 0, 0] : 0} />
                ))}
              </BarChart>
            )}
          </ChartWrapper>
        </div>

        <ChartWrapper title="Category Share" subtitle="Of total spend">
          {loadingStats ? (
            <ChartSkeleton height={280} />
          ) : (
            <PieChart>
              <Pie data={categoryShare} dataKey="value" nameKey="name" innerRadius={50} outerRadius={78} paddingAngle={2}  stroke="none">
                {categoryShare.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <ChartTooltip formatter={(v) => formatCurrency(v)} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          )}
        </ChartWrapper>
      </div>

      <ChartWrapper title="Expense Trend" subtitle="Last 6 months — spot the spikes" height={240}>
        {loadingStats ? (
          <ChartSkeleton height={240} />
        ) : (
          <LineChart data={expenseTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e8ee" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#6b84a8" />
            <YAxis tick={{ fontSize: 12 }} stroke="#6b84a8" />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <ChartTooltip formatter={(v) => formatCurrency(v)} />
            <Line type="monotone" dataKey="value" stroke="#ef4444" strokeWidth={2.5} dot={{ r: 3 }} />
          </LineChart>
        )}
      </ChartWrapper>

      {/* Table */}
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-fg">Expense Log</h3>
      </div>
      <TableFilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search expenses..."
        filters={[
          { key: 'category', label: 'Category', options: categoryOptions },
          { key: 'locationModel', label: 'Location', options: locationOptions },
          { key: 'frequency', label: 'Frequency', options: frequencyOptions },
        ]}
        values={{
          category: categoryFilter,
          locationModel: locationFilter,
          frequency: frequencyFilter,
        }}
        onFilterChange={(key, value) => {
          if (key === 'category') setCategoryFilter(value)
          if (key === 'locationModel') setLocationFilter(value)
          if (key === 'frequency') setFrequencyFilter(value)
        }}
        actions={
          <button
            type="button"
            onClick={handleResetFilters}
            title="Reset filters"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border-subtle bg-surface-2 text-fg-muted transition-colors hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
          >
            <RotateCcw size={16} />
          </button>
        }
      />
      <DataTable columns={columns} rows={filtered} pageSize={10} />
      <AddExpenseModal
        isOpen={isAddModalOpen}
        onClose={handleModalClose}
        onCreate={handleCreateExpense}
        onUpdate={handleUpdateExpense}
        categories={categories}
        expenseToEdit={editingExpense}
      />
    </div>
  )
}

// import { useMemo, useState } from 'react'
// import { Wallet, Layers, CalendarClock, TrendingUp } from 'lucide-react'
// import {
//   BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
//   PieChart, Pie, Cell,
//   LineChart, Line,
// } from 'recharts'

// import KpiCard from '../../components/kpi/KpiCard'
// import StatusBadge from '../../components/badge/StatusBadge'
// import ChartWrapper from '../../components/charts/ChartWrapper'
// import TableFilterBar from '../../components/table/TableFilterBar'
// import ChartTooltip from '../../components/charts/ChartTooltip'
// import DataTable from '../../components/table/DataTable'
// import { KpiCardSkeleton, ChartSkeleton, TableSkeleton } from '../../components/ui/Skeleton'
// import { filterRows } from '../../lib/sorting'
// import { useDelayedLoading } from '../../lib/useDelayedLoading'
// import { formatCurrency, formatDate } from '../../lib/formatters'
// import {
//   expenses,
//   expensesKpis,
//   monthlyByCategory,
//   categoryShare,
//   expenseTrend,
// } from '../../data/expenses.data'

// const CATEGORY_KEYS = ['Salary', 'Rent', 'Utilities', 'Marketing', 'Other']
// const STACK_COLORS = ['#4f46e5', '#818cf8', '#f59e0b', '#22c55e', '#94a3b8']
// const PIE_COLORS = ['#4f46e5', '#818cf8', '#6366f1', '#f59e0b', '#22c55e', '#ef4444', '#94a3b8', '#cbd5e1']

// export default function ExpensesPage() {
//   const isLoading = useDelayedLoading(500)
//   const [search, setSearch] = useState('')
//   const [categoryFilter, setCategoryFilter] = useState('All')
//   const [branchFilter, setBranchFilter] = useState('All')
//   const [recurringFilter, setRecurringFilter] = useState('All')

//   const filtered = useMemo(() => {
//     let rows = expenses
//     if (recurringFilter !== 'All') {
//       rows = rows.filter((e) => (recurringFilter === 'Recurring' ? e.recurring : !e.recurring))
//     }
//     return filterRows(rows, {
//       search,
//       searchKeys: ['category', 'approvedBy'],
//       fieldFilters: { category: categoryFilter, branch: branchFilter },
//     })
//   }, [search, categoryFilter, branchFilter, recurringFilter])

//   const columns = [
//     { key: 'category', label: 'Category', sortable: true },
//     { key: 'branch', label: 'Branch', sortable: true },
//     { key: 'amount', label: 'Amount', sortable: true, align: 'right', render: (r) => formatCurrency(r.amount) },
//     {
//       key: 'recurring',
//       label: 'Type',
//       sortable: true,
//       render: (r) => (
//         <StatusBadge status={r.recurring ? 'warning' : 'neutral'}>
//           {r.recurring ? 'Recurring' : 'One-time'}
//         </StatusBadge>
//       ),
//     },
//     { key: 'mode', label: 'Mode', sortable: true },
//     { key: 'approvedBy', label: 'Approved By', sortable: true },
//     { key: 'date', label: 'Date', sortable: true, render: (r) => formatDate(r.date) },
//     {
//       key: 'dueDate',
//       label: 'Next Due',
//       sortable: true,
//       render: (r) => (r.dueDate ? formatDate(r.dueDate) : <span className="text-brand-400">—</span>),
//     },
//   ]

//   if (isLoading) {
//     return (
//       <div className="space-y-6">
//         <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
//           {Array.from({ length: 4 }).map((_, i) => <KpiCardSkeleton key={i} />)}
//         </div>
//         <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
//           <div className="lg:col-span-2"><ChartSkeleton /></div>
//           <ChartSkeleton height={280} />
//         </div>
//         <TableSkeleton rows={7} />
//       </div>
//     )
//   }
//   return (
//     <div className="space-y-6">
//       {/* KPI Cards */}
//       <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
//         <KpiCard label="Total Expense This Month" value={formatCurrency(expensesKpis.totalThisMonth)} icon={Wallet} subtext="all categories" />
//         <KpiCard
//           label="Largest Category"
//           value={expensesKpis.largestCategory}
//           icon={Layers}
//           subtext={formatCurrency(expensesKpis.largestCategoryAmount)}
//         />
//         <KpiCard
//           label="Upcoming Due Payments"
//           value={expensesKpis.upcomingDueCount}
//           icon={CalendarClock}
//           subtext={formatCurrency(expensesKpis.upcomingDueAmount)}
//         />
//         <KpiCard
//           label="Expense Trend"
//           value="+4.8%"
//           icon={TrendingUp}
//           trend={{ direction: 'up', value: '+4.8%', tone: 'negative' }}
//           subtext="vs last month"
//         />
//       </div>
 
//       {/* Charts */}
//       <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
//         <div className="lg:col-span-2">
//           <ChartWrapper title="Monthly Expenses by Category" subtitle="Last 4 months, stacked">
//             <BarChart data={monthlyByCategory}>
//               <CartesianGrid strokeDasharray="3 3" stroke="#e5e8ee" vertical={false} />
//               <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#6b84a8" />
//               <YAxis tick={{ fontSize: 12 }} stroke="#6b84a8" />
//               <ChartTooltip formatter={(v) => formatCurrency(v)} />
//               <Legend wrapperStyle={{ fontSize: 11 }} />
//               {CATEGORY_KEYS.map((key, i) => (
//                 <Bar key={key} dataKey={key} stackId="a" fill={STACK_COLORS[i]} radius={i === CATEGORY_KEYS.length - 1 ? [6, 6, 0, 0] : 0} />
//               ))}
//             </BarChart>
//           </ChartWrapper>
//         </div>
 
//         <ChartWrapper title="Category Share" subtitle="Of total spend">
//           <PieChart>
//             <Pie data={categoryShare} dataKey="value" nameKey="name" innerRadius={50} outerRadius={78} paddingAngle={2}  stroke="none">
//               {categoryShare.map((_, i) => (
//                 <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
//               ))}
//             </Pie>
//             <ChartTooltip formatter={(v) => formatCurrency(v)} />
//             <Legend wrapperStyle={{ fontSize: 11 }} />

//           </PieChart>
//         </ChartWrapper>
//       </div>
 
//       <ChartWrapper title="Expense Trend" subtitle="Last 6 months — spot the spikes" height={240}>
//         <LineChart data={expenseTrend}>
//           <CartesianGrid strokeDasharray="3 3" stroke="#e5e8ee" vertical={false} />
//           <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#6b84a8" />
//           <YAxis tick={{ fontSize: 12 }} stroke="#6b84a8" />
//           <Legend wrapperStyle={{ fontSize: 11 }} />
//           <ChartTooltip formatter={(v) => formatCurrency(v)} />
//           <Line type="monotone" dataKey="value" stroke="#ef4444" strokeWidth={2.5} dot={{ r: 3 }} />
//         </LineChart>
//       </ChartWrapper>
 
//       {/* Table */}
//       <div>
//         <h3 className="mb-3 text-sm font-semibold text-fg">Expense Log</h3>
//         <TableFilterBar
//           search={search}
//           onSearchChange={setSearch}
//           searchPlaceholder="Search category or approver..."
//           filters={[
//             { key: 'category', label: 'Category', options: ['Salary', 'Rent', 'Utilities', 'Marketing', 'Vehicle/Transport', 'Vendor Payments', 'Maintenance', 'Miscellaneous'] },
//             { key: 'branch', label: 'Branch', options: ['Kochi', 'Bengaluru', 'Chennai', 'Coimbatore', 'Mysuru'] },
//             { key: 'recurring', label: 'Type', options: ['Recurring', 'One-time'] },
//           ]}
//           values={{ category: categoryFilter, branch: branchFilter, recurring: recurringFilter }}
//           onFilterChange={(key, value) => {
//             if (key === 'category') setCategoryFilter(value)
//             if (key === 'branch') setBranchFilter(value)
//             if (key === 'recurring') setRecurringFilter(value)
//           }}
//         />
//         <DataTable columns={columns} rows={filtered} pageSize={10} />
//       </div>
//     </div>
//   )
// }