// Mirrors what a future `GET /api/receipts` response would look like.

const BRANCHES = ['Kochi', 'Bengaluru', 'Chennai', 'Coimbatore', 'Mysuru']
const TOURS = ['Munnar Hills Escape', 'Goa Beach Weekend', 'Kashmir Valley Tour', 'Andaman Island Hopper', 'Wayanad Wildlife Trail']
const STAFF = ['Anjali R.', 'Vikram S.', 'Deepa M.', 'Rahul K.', 'Fathima N.']
const METHODS = ['UPI', 'Cash', 'Card', 'Bank Transfer', 'Wallet']
const NAMES = [
  'Ravi Menon', 'Aisha Khan', 'Thomas Philip', 'Meera Nair', 'Sanjay Rao',
  'Priya Varma', 'Arjun Das', 'Fatima Sheikh', 'Kiran Kumar', 'Lakshmi Iyer',
  'Nihal Ahmed', 'Divya Pillai', 'Suresh Babu', 'Ananya Roy', 'Vishal Nambiar',
]

function seededRow(i) {
  const isRefund = i % 9 === 0
  const isPending = !isRefund && i % 5 === 0
  const status = isRefund ? 'Refunded' : isPending ? 'Pending' : 'Paid'
  const totalAmount = 6000 + ((i * 733) % 24000)

  let paidAmount;
  if (status === 'Paid') {
    paidAmount = totalAmount
  }
  else if (status === 'Pending') {
    paidAmount = Math.round(totalAmount * (0.3 + ((i * 13) % 50) / 100))
  }
  else {
    paidAmount = 0
  }
  const balance = totalAmount - paidAmount

  return {
    id: 1000 + i,
    clientId: `CL-2026-${String(1000 + i).padStart(5, '0')}`,
    customer: NAMES[i % NAMES.length],
    phone: `9${String(100000000 + i * 87321).slice(0, 9)}`,
    totalAmount,
    paidAmount,
    balance: totalAmount - paidAmount,
    method: METHODS[i % METHODS.length],
    tour: TOURS[i % TOURS.length],
    branch: BRANCHES[i % BRANCHES.length],
    staff: STAFF[i % STAFF.length],
    date: `2026-0${(i % 6) + 1}-${String((i % 27) + 1).padStart(2, '0')}`,
    status,
    refundReason: isRefund ? ['Trip cancelled by customer', 'Duplicate payment', 'Weather cancellation'][i % 3] : null,
    // pendingDue: isPending ? Math.round(amount * 0.4) : 0,
  }
}

export const receipts = Array.from({ length: 26 }).map((_, i) => seededRow(i))

export const receiptsKpis = {
  totalToday: 42000,
  totalThisWeek: 268000,
  totalThisMonth: 1245000,
  totalRefunds: 52400,
  // totalRefunds: receipts.filter((r) => r.status === 'Refunded').reduce((s, r) => s + r.balance, 0),
  netReceipts: receipts.reduce((s, r) => s + (r.status === 'Refunded' ? 0 : r.amount), 0),
}

export const revenueTrend = [
  { date: 'Jul 25', value: 38000 }, { date: 'Jul 26', value: 42000 }, { date: 'Jul 27', value: 31000 },
  { date: 'Jul 28', value: 51000 }, { date: 'Jul 29', value: 47000 }, { date: 'Jul 30', value: 60000 },
  { date: 'Jul 31', value: 42000 }, { date: 'Aug 01', value: 55000 },
]

export const paymentTypeSplit = METHODS.map((method, i) => ({
  name: method,
  value: [34, 28, 18, 12, 8][i],
}))

export const bookingsPerTour = TOURS.map((tour) => ({
  name: tour.split(' ').slice(0, 2).join(' '),
  bookings: receipts.filter((r) => r.tour === tour).length,
}))