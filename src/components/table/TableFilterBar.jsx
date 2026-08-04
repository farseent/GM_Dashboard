import { Search } from 'lucide-react'

/**
 * search: string, onSearchChange: fn
 * filters: [{ key, label, options: string[] }]
 * values: { [key]: string }, onFilterChange: (key, value) => void
 */
export default function TableFilterBar({
  search,
  onSearchChange,
  searchPlaceholder = 'Search...',
  filters = [],
  values = {},
  onFilterChange,
}) {
  return (
    <div className="flex flex-wrap items-center gap-3 border-b border-border-subtle bg-surface-raised px-4 py-3">
      <div className="relative min-w-[220px] flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-subtle" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="w-full rounded-lg border border-border-subtle bg-surface py-2 pl-9 pr-3 text-sm text-fg placeholder:text-fg-subtle focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
        />
      </div>

      {filters.map((filter) => (
        <select
          key={filter.key}
          value={values[filter.key] ?? 'All'}
          onChange={(e) => onFilterChange(filter.key, e.target.value)}
          className="rounded-lg border border-border-subtle bg-surface px-3 py-2 text-sm text-fg focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
        >
          <option value="All">{filter.label}: All</option>
          {filter.options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      ))}
    </div>
  )
}