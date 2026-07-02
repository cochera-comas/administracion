import { useState } from 'react'
import { useClients } from '@/hooks/useClients'
import { useClientPayments } from '@/hooks/useClientPayments'
import { ClientPaymentFormDialog } from '@/components/payments/ClientPaymentFormDialog'
import { ClientPaymentTable } from '@/components/payments/ClientPaymentTable'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { monthStart, toDateInputValue, limaToday } from '@/lib/utils'

export function ClientPaymentsPage() {
  const [period, setPeriod] = useState(() => monthStart(limaToday()))
  const { data: clients, isLoading: loadingClients } = useClients(false)
  const { data: payments, isLoading: loadingPayments, isError } = useClientPayments(period)

  function handleMonthChange(value: string) {
    if (!value) return
    const [year, month] = value.split('-').map(Number)
    setPeriod(new Date(year, month - 1, 1))
  }

  const isLoading = loadingClients || loadingPayments

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Pagos de clientes</h1>
          <p className="text-sm text-muted-foreground">Ingresos mensuales por cliente.</p>
        </div>
        <div className="flex items-end gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="period">Mes</Label>
            <Input
              id="period"
              type="month"
              value={toDateInputValue(period).slice(0, 7)}
              onChange={(e) => handleMonthChange(e.target.value)}
            />
          </div>
          {clients && <ClientPaymentFormDialog clients={clients} period={period} />}
        </div>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Cargando...</p>}
      {isError && <p className="text-sm text-destructive">Error al cargar los pagos.</p>}
      {clients && payments && <ClientPaymentTable clients={clients} payments={payments} period={period} />}
    </div>
  )
}
