/**
 * Sorts an array of row objects by a given key/direction.
 * Handles strings, numbers, and dates transparently.
 */
export function sortRows(rows, sortKey, sortDir = 'asc') {
  if (!sortKey) return rows
  const dir = sortDir === 'asc' ? 1 : -1

  return [...rows].sort((a, b) => {
    const aVal = a[sortKey]
    const bVal = b[sortKey]

    if (aVal == null) return 1
    if (bVal == null) return -1

    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return (aVal - bVal) * dir
    }

    const aDate = Date.parse(aVal)
    const bDate = Date.parse(bVal)
    if (!Number.isNaN(aDate) && !Number.isNaN(bDate) && typeof aVal === 'string' && /\d{4}-\d{2}-\d{2}/.test(aVal)) {
      return (aDate - bDate) * dir
    }

    return String(aVal).localeCompare(String(bVal)) * dir
  })
}

/**
 * Filters rows by a free-text search across the given keys,
 * plus an optional set of exact-match field filters.
 * fieldFilters: { status: 'Paid', branch: 'Kochi' } — 'All' / '' / undefined is ignored.
 */
export function filterRows(rows, { search = '', searchKeys = [], fieldFilters = {} } = {}) {
  let result = rows

  const activeFilters = Object.entries(fieldFilters).filter(
    ([, value]) => value && value !== 'All'
  )
  if (activeFilters.length) {
    result = result.filter((row) =>
      activeFilters.every(([key, value]) => String(row[key]) === String(value))
    )
  }

  if (search.trim()) {
    const q = search.trim().toLowerCase()
    result = result.filter((row) =>
      searchKeys.some((key) => String(row[key] ?? '').toLowerCase().includes(q))
    )
  }

  return result
}