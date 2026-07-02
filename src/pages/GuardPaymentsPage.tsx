import { useState } from 'react'
import { useGuards } from '@/hooks/useGuards'
import { useGuardPayments } from '@/hooks/useGuardPayments'
import { GuardPaymentFormDialog } from '@/components/payments/GuardPaymentFormDialog'
import { GuardPaymentTable } from '@/components/payments/GuardPaymentTable'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { monthStart, toDateInputValue, limaToday } from '@/lib/utils'

export function GuardPaymentsPage() {
  const now = limaToday()
  const [rangeStart, setRangeStart] = useState(() => toDateInputValue(monthStart(now)))
  const [rangeEnd, setRangeEnd] = useState(() =>
    toDateInputValue(new Date(now.getFullYear(), now.getMonth() + 1, 0))
  )

  const { data: guards } = useGuards(false)
  const { data: payments, isLoading, isError } = useGuardPayments(rangeStart, rangeEnd)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Pagos a guardias</h1>
          <p className="text-sm text-muted-foreground">Egresos por turnos trabajados.</p>
        </div>
        <div className="flex items-end gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="rangeStart">Desde</Label>
            <Input
              id="rangeStart"
              type="date"
              value={rangeStart}
              onChange={(e) => setRangeStart(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="rangeEnd">Hasta</Label>
            <Input id="rangeEnd" type="date" value={rangeEnd} onChange={(e) => setRangeEnd(e.target.value)} />
          </div>
          {guards && <GuardPaymentFormDialog guards={guards} />}
        </div>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Cargando...</p>}
      {isError && <p className="text-sm text-destructive">Error al cargar los pagos.</p>}
      {payments && <GuardPaymentTable payments={payments} />}
    </div>
  )
}
