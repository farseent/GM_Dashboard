import { Bell, ChevronDown, Menu, Sun, Moon } from 'lucide-react'
import { useTheme } from '../lib/useTheme'

export default function Topbar({ title, onMenuClick }) {
  const { theme, toggleTheme } = useTheme()

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
        <button
          onClick={toggleTheme}
          className="rounded-full p-2 text-fg-muted hover:bg-surface"
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>

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