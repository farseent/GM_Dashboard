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
          className="rounded-md p-1.5 text-fg-muted hover:bg-surface sm:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="text-base font-semibold text-fg sm:text-lg">{title}</h1>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <button className="relative rounded-full p-2 text-fg-muted hover:bg-surface">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-negative-500" />
        </button>

          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-500 text-[14px] font-semibold text-white">
            MD
          </div>
      </div>
    </header>
  )
}