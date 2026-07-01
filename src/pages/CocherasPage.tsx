import { ParkingMap } from '@/components/spots/ParkingMap'

export function CocherasPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Cocheras</h1>
        <p className="text-sm text-muted-foreground">
          Distribución física por puerta. Click en una cochera ocupada para ver el detalle del cliente.
        </p>
      </div>
      <ParkingMap />
    </div>
  )
}
