import { useState } from 'react'
import { useMovements } from '@/hooks/useMovements'
import { MovementsTable } from '@/components/movements/MovementsTable'
import { ManualMovementFormDialog } from '@/components/movements/ManualMovementFormDialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { monthStart, toDateInputValue, formatCurrency, limaToday } from '@/lib/utils'

export function MovementsPage() {
  const now = limaToday()
  const [rangeStart, setRangeStart] = useState(() => toDateInputValue(monthStart(now)))
  const [rangeEnd, setRangeEnd] = useState(() => toDateInputValue(now))

  const { data, isLoading, isError } = useMovements(rangeStart, rangeEnd)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Movimientos</h1>
          <p className="text-sm text-muted-foreground">
            Ingresos y egresos consolidados para cruzar con el extracto bancario.
          </p>
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
          <ManualMovementFormDialog />
        </div>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Cargando...</p>}
      {isError && <p className="text-sm text-destructive">Error al cargar los movimientos.</p>}

      {data && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">Total ingresos</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold text-green-600">{formatCurrency(data.totalIngresos)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">Total egresos</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold text-red-600">{formatCurrency(data.totalEgresos)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">Saldo neto del periodo</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold">{formatCurrency(data.saldoNeto)}</p>
              </CardContent>
            </Card>
          </div>

          <MovementsTable movements={data.movements} />
        </>
      )}
    </div>
  )
}
