import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import { NAV_ITEMS } from '../constants/navigation'

export default function DashboardLayout() {
  const location = useLocation()
  const [sidebarExpanded, setSidebarExpanded] = useState(false)

  const current = NAV_ITEMS.find((item) =>
    item.path === '/' ? location.pathname === '/' : location.pathname.startsWith(item.path)
  )

  return (
    <div className="flex h-screen bg-surface">
      <Sidebar
        isExpanded={sidebarExpanded}
        onExpand={() => setSidebarExpanded(true)}
        onCollapse={() => setSidebarExpanded(false)}
      />
      <div className="ml-0 sm:ml-20 flex flex-1 flex-col overflow-hidden">
        <Topbar
          title={current?.label ?? 'Dashboard'}
          onMenuClick={() => setSidebarExpanded(true)}
        />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}