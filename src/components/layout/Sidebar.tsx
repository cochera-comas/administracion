import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import {
  LayoutDashboard,
  Users,
  Wallet,
  ShieldCheck,
  Banknote,
  LogOut,
} from 'lucide-react'

const links = [
  { to: '/dashboard', label: 'Resumen', icon: LayoutDashboard },
  { to: '/clients', label: 'Clientes', icon: Users },
  { to: '/client-payments', label: 'Pagos de clientes', icon: Wallet },
  { to: '/guards', label: 'Guardias', icon: ShieldCheck },
  { to: '/guard-payments', label: 'Pagos a guardias', icon: Banknote },
]

export function Sidebar() {
  const { signOut } = useAuth()

  return (
    <aside className="flex h-screen w-60 shrink-0 flex-col border-r bg-card">
      <div className="px-4 py-5">
        <h1 className="text-lg font-semibold">Cochera</h1>
        <p className="text-xs text-muted-foreground">Panel administrativo</p>
      </div>
      <nav className="flex flex-1 flex-col gap-1 px-2">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
                isActive && 'bg-muted text-foreground'
              )
            }
          >
            <Icon className="size-4" />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t p-2">
        <Button variant="ghost" className="w-full justify-start gap-2" onClick={() => signOut()}>
          <LogOut className="size-4" />
          Cerrar sesión
        </Button>
      </div>
    </aside>
  )
}
