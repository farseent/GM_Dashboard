// Mirrors what a future `GET /api/expenses` response would look like.

const CATEGORIES = ['Salary', 'Rent', 'Utilities', 'Marketing', 'Vehicle/Transport', 'Vendor Payments', 'Maintenance', 'Miscellaneous']
const BRANCHES = ['Kochi', 'Bengaluru', 'Chennai', 'Coimbatore', 'Mysuru']
const MODES = ['Bank Transfer', 'Cash', 'UPI', 'Cheque']
const APPROVERS = ['Anjali R.', 'Vikram S.', 'Deepa M.', 'Rahul K.']

function seededRow(i) {
  const category = CATEGORIES[i % CATEGORIES.length]
  const recurring = ['Salary', 'Rent', 'Utilities'].includes(category)
  const baseAmounts = {
    Salary: 145000, Rent: 68000, Utilities: 14000, Marketing: 22000,
    'Vehicle/Transport': 18000, 'Vendor Payments': 31000, Maintenance: 9000, Miscellaneous: 6000,
  }
  const amount = Math.round(baseAmounts[category] * (0.85 + ((i * 37) % 30) / 100))

  return {
    id: 2000 + i,
    category,
    branch: BRANCHES[i % BRANCHES.length],
    amount,
    recurring,
    mode: MODES[i % MODES.length],
    approvedBy: APPROVERS[i % APPROVERS.length],
    date: `2026-0${(i % 6) + 1}-${String((i % 27) + 1).padStart(2, '0')}`,
    dueDate: recurring ? `2026-0${((i % 6) + 2) % 12 || 1}-05` : null,
  }
}

export const expenses = Array.from({ length: 24 }).map((_, i) => seededRow(i))

export const expensesKpis = {
  totalThisMonth: expenses.reduce((s, e) => s + e.amount, 0),
  largestCategory: 'Salary',
  largestCategoryAmount: expenses.filter((e) => e.category === 'Salary').reduce((s, e) => s + e.amount, 0),
    topLocation: {
    name: 'Kochi',
    amount: expenses.filter((e) => e.branch === 'Kochi').reduce((s, e) => s + e.amount, 0),
  }
}

export const monthlyByCategory = [
  { month: 'Apr', Salary: 138000, Rent: 65000, Utilities: 12500, Marketing: 19000, Other: 28000 },
  { month: 'May', Salary: 141000, Rent: 65000, Utilities: 13800, Marketing: 24000, Other: 31000 },
  { month: 'Jun', Salary: 143000, Rent: 68000, Utilities: 15200, Marketing: 17500, Other: 26000 },
  { month: 'Jul', Salary: 145000, Rent: 68000, Utilities: 14100, Marketing: 22500, Other: 33000 },
]

export const categoryShare = [
  { name: 'Salary', value: 145000 },
  { name: 'Rent', value: 68000 },
  { name: 'Vendor Payments', value: 31000 },
  { name: 'Marketing', value: 22000 },
  { name: 'Vehicle/Transport', value: 18000 },
  { name: 'Utilities', value: 14000 },
  { name: 'Maintenance', value: 9000 },
  { name: 'Miscellaneous', value: 6000 },
]

export const expenseTrend = [
  { month: 'Feb', value: 268000 },
  { month: 'Mar', value: 274000 },
  { month: 'Apr', value: 262000 },
  { month: 'May', value: 274800 },
  { month: 'Jun', value: 269700 },
  { month: 'Jul', value: 282600 },
]