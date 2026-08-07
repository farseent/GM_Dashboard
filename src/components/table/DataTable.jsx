import { useMemo, useState } from 'react'
import { ArrowUp, ArrowDown, ChevronsUpDown, ChevronLeft, ChevronRight } from 'lucide-react'
import clsx from 'clsx'
import { sortRows } from '../../lib/sorting'

/**
 * columns: [{ key, label, sortable?: bool, align?: 'left'|'right', render?: (row) => node }]
 * rows: already-filtered data (filtering lives in the parent via TableFilterBar + filterRows)
 * pageSize: rows per page (default 10)
 * emptyLabel: message shown when rows.length === 0
 */
export default function DataTable({ 
  columns,
  rows, 
  pageSize = 10, 
  emptyLabel = 'No records found',
  page,
  totalPages,
  onPageChange,
  totalCount,
  serverPagination,
  sortKey,
  sortDir,
  onSortChange,
}) {

  const sorted = serverPagination ? rows : sortRows(rows, sortKey, sortDir)
  const currentPage = serverPagination ? page : Math.min(page, totalPages)
  const paginated = serverPagination ? rows : sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const handleSort = (key) => {
    if (!key) return
    let dir = 'asc'
    if (sortKey === key && sortDir === 'asc') {
      dir = 'desc'
    }
    console.log(key, dir)
    onSortChange(key, dir)
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border-subtle bg-surface-raised">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border-subtle bg-surface">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={clsx(
                    'px-4 py-3 text-xs font-semibold uppercase tracking-wide text-fg-muted',
                    col.align === 'right' ? 'text-right' : 'text-left'
                  )}
                >
                  {col.sortable ? (
                    <button
                      onClick={() => handleSort(col.key)}
                      className={clsx(
                        'inline-flex items-center gap-1 hover:text-fg',
                        col.align === 'right' && 'flex-row-reverse'
                      )}
                    >
                      {col.label}
                      {sortKey === col.key ? (
                        sortDir === 'asc' ? (
                          <ArrowUp className="h-3 w-3" />
                        ) : (
                          <ArrowDown className="h-3 w-3" />
                        )
                      ) : (
                        <ChevronsUpDown className="h-3 w-3 text-fg-subtle/60" />
                      )}
                    </button>
                  ) : (
                    col.label
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-10 text-center text-sm text-fg-subtle">
                  {emptyLabel}
                </td>
              </tr>
            ) : (
              paginated.map((row, i) => (
                <tr
                  key={row.id ?? i}
                  className="border-b border-border-subtle last:border-b-0 hover:bg-surface"
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={clsx(
                        'px-4 py-3 text-fg',
                        col.align === 'right' && 'text-right'
                      )}
                    >
                      {col.render ? col.render(row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {sorted.length > 0 && (
        <div className="flex items-center justify-between border-t border-border-subtle px-4 py-3 text-xs text-fg-muted">
          <span>
            Showing {(currentPage - 1) * pageSize + 1}–
            {Math.min(currentPage * pageSize, totalCount)} of {totalCount}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="rounded-md p-1.5 hover:bg-surface disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="px-2">
              Page {currentPage} of {serverPagination ? totalPages : totalPages}
            </span>
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="rounded-md p-1.5 hover:bg-surface disabled:opacity-30"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}