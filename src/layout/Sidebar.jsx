import { NavLink } from 'react-router-dom'
import { Compass, X } from 'lucide-react'
import { NAV_ITEMS } from '../constants/navigation'
import clsx from 'clsx'

/**
 * Sidebar is always visible as a fixed icon rail (w-20).
 * Tapping the compass logo expands it to w-64 as an overlay.
 * Collapses via the X button or clicking the backdrop.
 */
export default function Sidebar({ isExpanded, onExpand, onCollapse }) {
  return (
    <>
      {isExpanded && (
        <div
          className="fixed inset-0 z-40 bg-brand-950/50 transition-opacity duration-200"
          onClick={onCollapse}
          aria-hidden="true"
        />
      )}

      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-50 flex h-screen flex-col overflow-hidden bg-brand-950 text-white transition-[width] duration-300 ease-in-out',
          isExpanded ? 'w-64' : 'w-0 sm:w-20'
        )}
      >
        <div className={clsx('flex items-center py-6', isExpanded ? 'justify-between px-6' : 'justify-center px-2')}>
          <button
            onClick={onExpand}
            className="flex items-center gap-2"
            aria-label="Expand sidebar"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent-500">
              <Compass className="h-5 w-5 text-white" />
            </div>
            <div
              className={clsx(
                'overflow-hidden whitespace-nowrap text-left transition-all duration-300',
                isExpanded ? 'w-40 opacity-100' : 'w-0 opacity-0'
              )}
            >
              <p className="text-sm font-semibold tracking-tight">General Manager</p>
              <p className="text-[11px] text-brand-400">Operations Console</p>
            </div>
          </button>

          {isExpanded && (
            <button onClick={onCollapse} className="rounded-md p-1 text-brand-400 hover:text-white">
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        <nav className="flex-1 space-y-1 px-3">
          {NAV_ITEMS.map(({ label, path, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              end={path === '/'}
              title={!isExpanded ? label : undefined}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 overflow-hidden whitespace-nowrap rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  !isExpanded && 'justify-center',
                  isActive
                    ? 'bg-accent-600 text-white'
                    : 'text-brand-400 hover:bg-brand-800 hover:text-white'
                )
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span
                className={clsx(
                  'overflow-hidden transition-all duration-300',
                  isExpanded ? 'w-auto opacity-100' : 'w-0 opacity-0'
                )}
              >
                {label}
              </span>
            </NavLink>
          ))}
        </nav>

        <div
          className={clsx(
            'overflow-hidden whitespace-nowrap border-t border-brand-800 px-6 py-4 transition-opacity duration-300',
            isExpanded ? 'opacity-100' : 'opacity-0'
          )}
        >
          <p className="text-[11px] text-brand-400">v0.1.0 · Mock data mode</p>
        </div>
      </aside>
    </>
  )
}