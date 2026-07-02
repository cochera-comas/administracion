import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useParkingSpots, type ParkingSpotWithClient } from '@/hooks/useParkingSpots'
import { useClients } from '@/hooks/useClients'
import { useClientPayments } from '@/hooks/useClientPayments'
import { SpotCell } from '@/components/spots/SpotCell'
import { monthStart, limaToday } from '@/lib/utils'

function groupByGateAndRow(spots: ParkingSpotWithClient[]) {
  const gates = new Map<string, Map<string, ParkingSpotWithClient[]>>()
  for (const spot of spots) {
    if (!gates.has(spot.gate)) gates.set(spot.gate, new Map())
    const rows = gates.get(spot.gate)!
    if (!rows.has(spot.row_label)) rows.set(spot.row_label, [])
    rows.get(spot.row_label)!.push(spot)
  }
  return gates
}

export function ParkingMap() {
  const { data: spots, isLoading, isError } = useParkingSpots()
  const { data: clients } = useClients(false)
  const { data: currentPayments } = useClientPayments(monthStart(limaToday()))

  if (isLoading) return <p className="text-sm text-muted-foreground">Cargando...</p>
  if (isError) return <p className="text-sm text-destructive">Error al cargar las cocheras.</p>
  if (!spots || spots.length === 0) {
    return <p className="text-sm text-muted-foreground">Todavía no hay cocheras cargadas.</p>
  }

  const assignedClientIds = new Set(spots.filter((s) => s.client_id).map((s) => s.client_id))
  const unassignedClients = (clients ?? []).filter((c) => c.is_active && !assignedClientIds.has(c.id))
  const paymentByClientId = new Map((currentPayments ?? []).map((p) => [p.client_id, p]))

  const gates = groupByGateAndRow(spots)

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {[...gates.entries()].map(([gate, rows]) => (
        <Card key={gate}>
          <CardHeader>
            <CardTitle>Puerta {gate.replace(/^PT/i, '')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[...rows.entries()].map(([rowLabel, rowSpots]) => (
              <div key={rowLabel} className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">{rowLabel}</p>
                <div className="flex flex-wrap gap-2">
                  {rowSpots.map((spot) => (
                    <SpotCell
                      key={spot.id}
                      spot={spot}
                      unassignedClients={unassignedClients}
                      paymentStatus={spot.client_id ? paymentByClientId.get(spot.client_id)?.status : undefined}
                    />
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
