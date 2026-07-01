import { useState } from 'react'
import { useDashboardSummary } from '@/hooks/useDashboardSummary'
import { SummaryCards } from '@/components/dashboard/SummaryCards'
import { PendingPaymentsList } from '@/components/dashboard/PendingPaymentsList'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { monthStart, toDateInputValue } from '@/lib/utils'

export function DashboardPage() {
  const [referenceDate, setReferenceDate] = useState(() => monthStart(new Date()))
  const { data, isLoading, isError } = useDashboardSummary(referenceDate)

  function handleMonthChange(value: string) {
    if (!value) return
    const [year, month] = value.split('-').map(Number)
    setReferenceDate(new Date(year, month - 1, 1))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Resumen</h1>
          <p className="text-sm text-muted-foreground">Estado del mes seleccionado.</p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="dashboard_period">Mes</Label>
          <Input
            id="dashboard_period"
            type="month"
            value={toDateInputValue(referenceDate).slice(0, 7)}
            onChange={(e) => handleMonthChange(e.target.value)}
          />
        </div>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Cargando...</p>}
      {isError && <p className="text-sm text-destructive">Error al cargar el resumen.</p>}

      {data && (
        <>
          <SummaryCards
            totalIncomePaid={data.totalIncomePaid}
            totalIncomePending={data.totalIncomePending}
            totalHourlyIncome={data.totalHourlyIncome}
            totalExpenses={data.totalExpenses}
            balance={data.balance}
          />
          <PendingPaymentsList payments={data.pendingPayments} />
        </>
      )}
    </div>
  )
}
