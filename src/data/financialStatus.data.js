// Mirrors what a future `GET /api/financial-status` response would look like.

export const financialKpis = {
  totalRevenue: 1245000,
  totalExpenses: 612000,
  netProfit: 633000,
  profitMargin: 50.8,
  marginChange: 2.4,
  receivables: 184000,
  payables: 96000,
}

export const revenueExpenseProfit = [
  { month: 'Feb', revenue: 980000, expenses: 610000, profit: 370000 },
  { month: 'Mar', revenue: 1040000, expenses: 628000, profit: 412000 },
  { month: 'Apr', revenue: 1105000, expenses: 618000, profit: 487000 },
  { month: 'May', revenue: 1160000, expenses: 634000, profit: 526000 },
  { month: 'Jun', revenue: 1198000, expenses: 641000, profit: 557000 },
  { month: 'Jul', revenue: 1245000, expenses: 612000, profit: 633000 },
]

export const profitMarginTrend = revenueExpenseProfit.map((r) => ({
  month: r.month,
  margin: Math.round((r.profit / r.revenue) * 1000) / 10,
}))

// Sorted worst -> best, matching the "spot underperformers instantly" requirement
export const branchProfitLoss = [
  { id: 1, branch: 'Chennai', revenue: 370000, expenses: 204000, profit: 166000, status: 'Profit' },
  { id: 2, branch: 'Mangaluru', revenue: 201000, expenses: 118000, profit: 83000, status: 'Profit' },
  { id: 3, branch: 'Thiruvananthapuram', revenue: 288000, expenses: 156000, profit: 132000, status: 'Profit' },
  { id: 4, branch: 'Coimbatore', revenue: 312000, expenses: 149000, profit: 163000, status: 'Profit' },
  { id: 5, branch: 'Bengaluru', revenue: 395000, expenses: 198000, profit: 197000, status: 'Profit' },
  { id: 6, branch: 'Mysuru', revenue: 244000, expenses: 121000, profit: 123000, status: 'Profit' },
  { id: 7, branch: 'Kochi', revenue: 480000, expenses: 210000, profit: 270000, status: 'Profit' },
].map((b) => ({ ...b, margin: Math.round((b.profit / b.revenue) * 1000) / 10 }))
 .sort((a, b) => a.profit - b.profit)