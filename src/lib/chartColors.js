// Master palette — shared by every chart that shows categories.
// Order matters: category #1 in your sorted category list always gets PALETTE[0], etc.
const PALETTE = [
  '#ef4444', '#22c55e', '#4f46e5','#f59e0b',
  '#0ea5e9' , '#a855f7', '#14b8a6', '#eab308',
]

const OTHER_COLOR = '#94a3b8' // gray, reserved for the overflow bucket

/**
 * Builds a stable { categoryName: color } map from a list of category names.
 * Sort the input first (e.g. alphabetically, or by _id) so the mapping
 * doesn't shift around just because array order changed between renders.
 */
export function buildCategoryColorMap(categoryTotals = []) {
  const sorted = [...categoryTotals].sort((a, b) => b.total - a.total)
  const map = {}
  sorted.forEach(({ name }, i) => {
    map[name] = i < PALETTE.length ? PALETTE[i % PALETTE.length] : OTHER_COLOR
  })
  return map
}

export function getCategoryColor(map, name) {
  return map[name] || OTHER_COLOR
}

export { PALETTE, OTHER_COLOR }