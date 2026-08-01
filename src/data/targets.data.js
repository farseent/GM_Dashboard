// Mirrors what a future `GET /api/targets` response would look like.

const BRANCHES = ['Kochi', 'Bengaluru', 'Chennai', 'Coimbatore', 'Mysuru']
const STAFF = [
  'Anjali R.', 'Vikram S.', 'Deepa M.', 'Rahul K.', 'Fathima N.',
  'Nihal Ahmed', 'Divya Pillai', 'Suresh Babu', 'Ananya Roy', 'Vishal Nambiar',
  'Kiran Kumar', 'Lakshmi Iyer',
]

function statusFor(pct) {
  if (pct >= 100) return 'Exceeded'
  if (pct >= 80) return 'On Track'
  return 'Behind'
}

function seededRow(i) {
  const staff = STAFF[i % STAFF.length]
  const branch = BRANCHES[i % BRANCHES.length]
  const target = 80000 + ((i * 4700) % 60000)
  const pct = Math.round(45 + ((i * 53) % 65))
  const achieved = Math.round((target * pct) / 100)

  return {
    id: 3000 + i,
    staff,
    branch,
    period: 'Jul 2026',
    type: 'Revenue',
    target,
    achieved,
    remaining: Math.max(target - achieved, 0),
    pct,
    status: statusFor(pct),
    lastPeriodPct: Math.round(pct - 8 + ((i * 13) % 20)),
  }
}

export const targets = Array.from({ length: 20 }).map((_, i) => seededRow(i))

export const targetsKpis = {
  companyPct: Math.round(targets.reduce((s, t) => s + t.pct, 0) / targets.length),
  topPerformer: [...targets].sort((a, b) => b.pct - a.pct)[0],
  behindCount: targets.filter((t) => t.status === 'Behind').length,
  totalTarget: targets.reduce((s, t) => s + t.target, 0),
  totalAchieved: targets.reduce((s, t) => s + t.achieved, 0),
}

export const branchAchievement = BRANCHES.map((branch) => {
  const rows = targets.filter((t) => t.branch === branch)
  return {
    name: branch,
    target: rows.reduce((s, r) => s + r.target, 0),
    achieved: rows.reduce((s, r) => s + r.achieved, 0),
  }
})