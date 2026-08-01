import { NavLink } from 'react-router-dom'
import { Compass, X } from 'lucide-react'
import { NAV_ITEMS } from '../constants/navigation'
import clsx from 'clsx'

/**
 * isOpen/onClose only affect mobile (<lg): sidebar becomes an off-canvas
 * drawer with a backdrop. On lg+ it's always visible as a static column.
 */
export default function Sidebar({ isOpen = false, onClose }) {
  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-brand-950/50 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-50 flex h-screen w-64 shrink-0 flex-col bg-brand-950 text-white transition-transform duration-200 lg:static lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between px-6 py-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-500">
              <Compass className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold tracking-tight">Voyage GM</p>
              <p className="text-[11px] text-brand-400">Operations Console</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-md p-1 text-brand-400 hover:text-white lg:hidden">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3">
          {NAV_ITEMS.map(({ label, path, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              end={path === '/'}
              onClick={onClose}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-accent-600 text-white'
                    : 'text-brand-400 hover:bg-brand-800 hover:text-white'
                )
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-brand-800 px-6 py-4">
          <p className="text-[11px] text-brand-400">v0.1.0 · Mock data mode</p>
        </div>
      </aside>
    </>
  )
}