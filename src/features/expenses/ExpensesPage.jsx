import { useEffect, useMemo, useState } from 'react'
import { Wallet, Layers, MapPin, TrendingUp, TrendingDown, Plus, Pencil, RotateCcw  } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  Legend, PieChart, Pie, Cell, LineChart, Line,
} from 'recharts'

import KpiCard from '../../components/kpi/KpiCard'
import StatusBadge from '../../components/badge/StatusBadge'
import ChartWrapper from '../../components/charts/ChartWrapper'
import TableFilterBar from '../../components/table/TableFilterBar'
import ChartTooltip from '../../components/charts/ChartTooltip'
import DataTable from '../../components/table/DataTable'
import AddExpenseModal from './components/AddExpenseModal'
import { KpiCardSkeleton, ChartSkeleton, TableSkeleton } from '../../components/ui/Skeleton'
import { useDelayedLoading } from '../../lib/useDelayedLoading'
import { formatCurrency, formatDate } from '../../lib/formatters'
import { buildCategoryColorMap, getCategoryColor } from '../../lib/chartColors'
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
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({})
  const [sortKey, setSortKey] = useState(null)
  const [sortDir, setSortDir] = useState('asc')
  
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
    const totals = {}
    monthlyByCategory.forEach((row) => {
      Object.keys(row).forEach((k) => {
        if (k !== 'month') {
          totals[k] = (totals[k] || 0) + (row[k] || 0)
        }
      })
    })
    return Object.keys(totals).sort((a, b) => totals[b] - totals[a])
  }, [monthlyByCategory])

  const tooltipOrder = useMemo(() => {
    return [...categoryKeys].reverse()
  }, [categoryKeys])
  
  const categoryColorMap = useMemo(() => {
    const totals = categoryShare.map(c => ({ name: c.name, total: c.value }))
    return buildCategoryColorMap(totals)
  }, [categoryShare])

  const MAX_SLICES = 7
  const pieData = useMemo(() => {
    if (categoryShare.length <= MAX_SLICES) return categoryShare
    const sorted = [...categoryShare].sort((a, b) => b.value - a.value)
    const top = sorted.slice(0, MAX_SLICES)
    const rest = sorted.slice(MAX_SLICES)
    const otherTotal = rest.reduce((sum, c) => sum + c.value, 0)
    return otherTotal > 0 ? [...top, { name: 'Other', value: otherTotal }] : top
  }, [categoryShare])

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
    { key: 'amount', label: 'Amount', sortable: true, render: (r) => formatCurrency(r.amount), },
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

  // Categories: fetch once
  useEffect(() => {
    fetchExpenseCategories()
  }, [])

  // Stats: only depend on filters that actually affect the KPI/chart data
  // (or fetch once if stats are page-global and unrelated to filters)
  useEffect(() => {
    fetchStats()
  }, [])

  // Table data: depends on page, search, filters, sort
  useEffect(() => {
    fetchExpenses()
  }, [page, search, categoryFilter, locationFilter, frequencyFilter, sortKey, sortDir])

  const RECEIPTS_PAGE_SIZE = 5
  const fetchExpenses = async () => {
    try {
      setLoadingExpenses(true)

      const params = { page, limit: RECEIPTS_PAGE_SIZE }

      if (search) params.search = search
      if (categoryFilter !== 'All') params.category = categoryFilter
      if (locationFilter !== 'All') params.locationModel = locationFilter
      if (frequencyFilter !== 'All') params.frequency = frequencyFilter
      
      const sortFieldMap = {
        category: 'category.name',
        branchOrFranchise: 'branchOrFranchise.branchName',
      }
      
      if (sortKey) {
        params.sortField = sortFieldMap[sortKey] || sortKey
        params.sortOrder = sortDir
      }

      const response = await getExpense(params)
      
      if (response.success) {
        const dataWithId = response.data.map(e => ({
          ...e,
          id: e._id
        }))

        setExpenses(dataWithId)
        setPagination(response.pagination)
      }

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
                <ChartTooltip formatter={(v) => formatCurrency(v)} order={tooltipOrder } />                <Legend wrapperStyle={{ fontSize: 11 }} />
                {categoryKeys.map((key, i) => (
                  <Bar
                    key={key}
                    dataKey={key}
                    stackId="a"
                    fill={getCategoryColor(categoryColorMap, key)}
                    radius={i === categoryKeys.length - 1 ? [6, 6, 0, 0] : 0}
                  />
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
              <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={78} paddingAngle={2} stroke="none">
                {pieData.map((entry, i) => (
                  <Cell key={i} fill={getCategoryColor(categoryColorMap, entry.name)} />
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
        onReset={handleResetFilters}
      />
      <DataTable
        columns={columns}
        rows={expenses}
        pageSize={RECEIPTS_PAGE_SIZE}
        page={page}
        totalPages={pagination.totalPages}
        totalCount={pagination.total}
        onPageChange={setPage}
        loading={loadingExpenses}
        sortKey={sortKey}
        sortDir={sortDir}
        onSortChange={(key, dir) => {
          setSortKey(key)
          setSortDir(dir)
          setPage(1)
        }}

        serverPagination
      />
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