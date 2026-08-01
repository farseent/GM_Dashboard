// Mirrors what a future `GET /api/dashboard/summary` response would look like.

export const overviewKpis = {
  totalRevenue: { value: 1245000, change: 8.2, tone: 'positive' },
  totalExpenses: { value: 612000, change: 3.1, tone: 'negative' },
  netProfit: { value: 633000, change: 12.4, tone: 'positive' },
  targetCompletion: { value: 78, change: -4.5, tone: 'negative' },
}

export const topTour = {
  name: 'Munnar Hills Escape',
  bookings: 142,
  revenue: 318000,
}

export const alerts = [
  { id: 1, severity: 'negative', message: 'Chennai branch is 22% behind monthly target' },
  { id: 2, severity: 'warning', message: 'Refunds up 15% this week across all branches' },
  { id: 3, severity: 'warning', message: 'Vehicle/Transport expenses trending above budget' },
]

export const branchRevenueExpense = [
  { name: 'Kochi', revenue: 480000, expenses: 210000 },
  { name: 'Bengaluru', revenue: 395000, expenses: 198000 },
  { name: 'Chennai', revenue: 370000, expenses: 204000 },
]

export const branchSummary = [
  { id: 1, branch: 'Kochi', revenue: 480000, expenses: 210000, profit: 270000, targetPct: 92, status: 'On Track' },
  { id: 2, branch: 'Bengaluru', revenue: 395000, expenses: 198000, profit: 197000, targetPct: 81, status: 'On Track' },
  { id: 3, branch: 'Chennai', revenue: 370000, expenses: 204000, profit: 166000, targetPct: 58, status: 'Behind' },
  { id: 4, branch: 'Thiruvananthapuram', revenue: 288000, expenses: 156000, profit: 132000, targetPct: 74, status: 'Behind' },
  { id: 5, branch: 'Coimbatore', revenue: 312000, expenses: 149000, profit: 163000, targetPct: 88, status: 'On Track' },
  { id: 6, branch: 'Mangaluru', revenue: 201000, expenses: 118000, profit: 83000, targetPct: 63, status: 'Behind' },
  { id: 7, branch: 'Mysuru', revenue: 244000, expenses: 121000, profit: 123000, targetPct: 95, status: 'Exceeded' },
]