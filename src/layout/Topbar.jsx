import { Bell, ChevronDown, Menu, Sun, Moon } from 'lucide-react'
import { useTheme } from '../lib/useTheme'

export default function Topbar({ title, onMenuClick }) {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-border-subtle bg-surface-raised px-4 sm:px-8">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="rounded-md p-1.5 text-fg-muted hover:bg-surface lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="text-base font-semibold text-fg sm:text-lg">{title}</h1>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        
        {/* --- UPDATED TOGGLE BUTTON START --- */}
      <button
        onClick={toggleTheme}
        className="relative flex h-9 w-16 items-center rounded-full border border-border-subtle bg-surface transition-colors duration-300 hover:bg-surface/80"
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {/* Background */}
        <div
          className={`absolute inset-0 rounded-full transition-colors duration-300 ${
            isDark ? 'bg-brand-800/40' : 'bg-transparent'
          }`}
        />

        {/* Sun (visible in dark mode) */}
        <Sun
          className={`absolute left-2 h-4 w-4 transition-all duration-300 ${
            isDark
              ? 'text-amber-400 opacity-100'
              : 'text-fg-muted opacity-40'
          }`}
        />

        {/* Moon (visible in light mode) */}
        <Moon
          className={`absolute right-2 h-4 w-4 transition-all duration-300 ${
            isDark
              ? 'text-fg-muted opacity-40'
              : 'text-slate-600 opacity-100 dark:text-slate-300'
          }`}
        />

        {/* Sliding knob */}
        <div
          className={`relative z-10 h-7 w-7 rounded-full border bg-surface-raised shadow-sm transition-transform duration-300 ${
            isDark
              ? 'translate-x-7 border-brand-600'
              : 'translate-x-0 border-border-subtle'
          }`}
        />
      </button>
        {/* --- UPDATED TOGGLE BUTTON END --- */}

        <button className="relative rounded-full p-2 text-fg-muted hover:bg-surface">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-negative-500" />
        </button>

        <button className="flex items-center gap-2 rounded-lg border border-border-subtle px-2 py-1.5 hover:bg-surface sm:px-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent-500 text-xs font-semibold text-white">
            GM
          </div>
          <span className="hidden text-sm font-medium text-fg sm:inline">General Manager</span>
          <ChevronDown className="hidden h-4 w-4 text-fg-muted sm:inline" />
        </button>
      </div>
    </header>
  )
}