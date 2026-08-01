import {
  LayoutDashboard,
  Receipt,
  Wallet,
  Target,
  TrendingUp,
  Package,
} from 'lucide-react'

export const NAV_ITEMS = [
  { label: 'Dashboard', path: '/', icon: LayoutDashboard },
  { label: 'Receipts', path: '/receipts', icon: Receipt },
  { label: 'Expenses', path: '/expenses', icon: Wallet },
  { label: 'Targets', path: '/targets', icon: Target },
  { label: 'Financial Status', path: '/financial-status', icon: TrendingUp },
  { label: 'Products (Tours)', path: '/products', icon: Package },
]
