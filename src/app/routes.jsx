import DashboardLayout from '../layout/DashboardLayout'
import DashboardPage from '../features/dashboard/DashboardPage'
import ReceiptsPage from '../features/receipts/ReceiptsPage'
import ExpensesPage from '../features/expenses/ExpensesPage'
import TargetsPage from '../features/targets/TargetsPage'
import FinancialStatusPage from '../features/financial-status/FinancialStatusPage'
import ProductsPage from '../features/products/ProductsPage'

export const routes = [
  {
    element: <DashboardLayout />,
    children: [
      { path: '/', element: <DashboardPage /> },
      { path: '/receipts', element: <ReceiptsPage /> },
      { path: '/expenses', element: <ExpensesPage /> },
      { path: '/targets', element: <TargetsPage /> },
      { path: '/financial-status', element: <FinancialStatusPage /> },
      { path: '/products', element: <ProductsPage /> },
    ],
  },
]