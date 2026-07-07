import { Outlet } from 'react-router-dom'
import { Sidebar } from '@/components/layout/Sidebar'

export function AppLayout() {
  return (
    <div className="flex min-h-screen print:block">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-6 print:overflow-visible print:p-0">
        <Outlet />
      </main>
    </div>
  )
}
