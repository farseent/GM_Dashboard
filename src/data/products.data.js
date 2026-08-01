// Mirrors what a future `GET /api/products` (tours) response would look like.

const CATEGORIES = ['Domestic', 'International', 'Adventure', 'Family', 'Honeymoon']
const BRANCHES = ['Kochi', 'Bengaluru', 'Chennai', 'Coimbatore', 'Mysuru']

const TOUR_NAMES = [
  'Munnar Hills Escape', 'Goa Beach Weekend', 'Kashmir Valley Tour', 'Andaman Island Hopper',
  'Wayanad Wildlife Trail', 'Ooty Nilgiri Retreat', 'Rajasthan Heritage Circuit', 'Bali Honeymoon Special',
  'Ladakh Adventure Ride', 'Kerala Backwaters Cruise', 'Singapore City Break', 'Coorg Coffee Trail',
  'Thailand Island Explorer', 'Himachal Snow Trek', 'Dubai Desert Getaway',
]

function seededTour(name, i) {
  const bookings = 40 + ((i * 17) % 110)
  const avgTicket = 12000 + ((i * 930) % 18000)
  const revenue = bookings * avgTicket
  const costRatio = 0.45 + ((i * 7) % 25) / 100
  const cost = Math.round(revenue * costRatio)
  const profit = revenue - cost

  return {
    id: 4000 + i,
    name,
    category: CATEGORIES[i % CATEGORIES.length],
    branch: BRANCHES[i % BRANCHES.length],
    bookings,
    revenue,
    cost,
    profit,
    margin: Math.round((profit / revenue) * 1000) / 10,
    rating: Math.round((3.6 + ((i * 11) % 14) / 10) * 10) / 10,
    cancellationRate: Math.round((2 + ((i * 3) % 9)) * 10) / 10,
  }
}

export const tours = TOUR_NAMES.map((name, i) => seededTour(name, i))

export const toursKpis = {
  mostBooked: [...tours].sort((a, b) => b.bookings - a.bookings)[0],
  mostProfitable: [...tours].sort((a, b) => b.profit - a.profit)[0],
  avgRating: Math.round((tours.reduce((s, t) => s + t.rating, 0) / tours.length) * 10) / 10,
  avgCancellation: Math.round((tours.reduce((s, t) => s + t.cancellationRate, 0) / tours.length) * 10) / 10,
}

export const bookingsByTour = tours
  .map((t) => ({ name: t.name.split(' ').slice(0, 2).join(' '), bookings: t.bookings }))
  .sort((a, b) => b.bookings - a.bookings)
  .slice(0, 8)

export const revenueProfitByTour = tours
  .map((t) => ({ name: t.name.split(' ').slice(0, 2).join(' '), revenue: t.revenue, profit: t.profit }))
  .sort((a, b) => b.revenue - a.revenue)
  .slice(0, 8)

export const revenueShareByCategory = CATEGORIES.map((cat) => ({
  name: cat,
  value: tours.filter((t) => t.category === cat).reduce((s, t) => s + t.revenue, 0),
}))