import { ParkingMap } from '@/components/spots/ParkingMap'

const legend = [
  { color: 'bg-green-600', label: 'Al día' },
  { color: 'bg-yellow-500', label: 'Dentro del plazo (hasta el 5)' },
  { color: 'bg-red-600', label: 'En mora' },
  { color: 'bg-muted', label: 'Inactivo' },
]

export function CocherasPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Cocheras</h1>
        <p className="text-sm text-muted-foreground">
          Distribución física por puerta. Click en una cochera ocupada para ver el detalle del cliente.
        </p>
      </div>
      <div className="flex flex-wrap gap-4">
        {legend.map((item) => (
          <div key={item.label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className={`size-3 rounded-sm ${item.color}`} />
            {item.label}
          </div>
        ))}
      </div>
      <ParkingMap />
    </div>
  )
}
