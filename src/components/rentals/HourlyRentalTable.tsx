import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { HourlyRentalWithSpot } from '@/hooks/useHourlyRentals'
import type { ParkingSpotWithClient } from '@/hooks/useParkingSpots'
import { HourlyRentalFormDialog } from '@/components/rentals/HourlyRentalFormDialog'
import { formatCurrency } from '@/lib/utils'

export function HourlyRentalTable({
  rentals,
  spots,
}: {
  rentals: HourlyRentalWithSpot[]
  spots: ParkingSpotWithClient[]
}) {
  if (rentals.length === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">No hay alquileres registrados en este rango.</p>
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Cochera</TableHead>
          <TableHead>Nombre</TableHead>
          <TableHead>Patente</TableHead>
          <TableHead>Fecha</TableHead>
          <TableHead>Horas</TableHead>
          <TableHead>Monto</TableHead>
          <TableHead className="text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rentals.map((rental) => (
          <TableRow key={rental.id}>
            <TableCell className="font-medium">
              {rental.parking_spots
                ? `${rental.parking_spots.gate} — ${rental.parking_spots.row_label} — ${rental.parking_spots.spot_label}`
                : '—'}
            </TableCell>
            <TableCell>{rental.renter_name}</TableCell>
            <TableCell>{rental.vehicle_plate || '-'}</TableCell>
            <TableCell>{rental.rental_date}</TableCell>
            <TableCell>{rental.hours}</TableCell>
            <TableCell>{formatCurrency(rental.amount)}</TableCell>
            <TableCell className="text-right">
              <HourlyRentalFormDialog spots={spots} rental={rental} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
