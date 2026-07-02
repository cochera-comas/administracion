import { useState } from 'react'
import { useHourlyRentals } from '@/hooks/useHourlyRentals'
import { useParkingSpots } from '@/hooks/useParkingSpots'
import { HourlyRentalFormDialog } from '@/components/rentals/HourlyRentalFormDialog'
import { HourlyRentalTable } from '@/components/rentals/HourlyRentalTable'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { monthStart, toDateInputValue, limaToday } from '@/lib/utils'

export function HourlyRentalsPage() {
  const now = limaToday()
  const [rangeStart, setRangeStart] = useState(() => toDateInputValue(monthStart(now)))
  const [rangeEnd, setRangeEnd] = useState(() =>
    toDateInputValue(new Date(now.getFullYear(), now.getMonth() + 1, 0))
  )

  const { data: spots } = useParkingSpots()
  const { data: rentals, isLoading, isError } = useHourlyRentals(rangeStart, rangeEnd)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Alquileres por hora</h1>
          <p className="text-sm text-muted-foreground">Ingresos por alquiler temporal de cocheras.</p>
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
          {spots && <HourlyRentalFormDialog spots={spots} />}
        </div>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Cargando...</p>}
      {isError && <p className="text-sm text-destructive">Error al cargar los alquileres.</p>}
      {rentals && <HourlyRentalTable rentals={rentals} />}
    </div>
  )
}
