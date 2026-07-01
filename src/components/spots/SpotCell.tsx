import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAssignSpot, type ParkingSpotWithClient } from '@/hooks/useParkingSpots'
import type { ClientWithVehicles } from '@/hooks/useClients'
import { formatPlates, getSpotPaymentColor } from '@/lib/utils'

const paymentColorClasses: Record<string, string> = {
  paid: 'border-green-700/30 bg-green-600 text-white hover:bg-green-600/90',
  grace: 'border-yellow-600/30 bg-yellow-500 text-black hover:bg-yellow-500/90',
  overdue: 'border-red-700/30 bg-red-600 text-white hover:bg-red-600/90',
}

export function SpotCell({
  spot,
  unassignedClients,
  paymentStatus,
}: {
  spot: ParkingSpotWithClient
  unassignedClients: ClientWithVehicles[]
  paymentStatus?: 'paid' | 'pending' | 'late'
}) {
  const navigate = useNavigate()
  const assignSpot = useAssignSpot()
  const [assignOpen, setAssignOpen] = useState(false)
  const [selectedClientId, setSelectedClientId] = useState('')

  if (spot.clients) {
    const client = spot.clients
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={() => navigate(`/clients/${client.id}`)}
        onKeyDown={(e) => e.key === 'Enter' && navigate(`/clients/${client.id}`)}
        className={cn(
          'group relative flex h-16 w-24 flex-col justify-center rounded-md border px-2 py-1 text-left text-xs cursor-pointer transition-colors',
          client.is_active
            ? paymentColorClasses[getSpotPaymentColor(paymentStatus)]
            : 'border-border bg-muted text-muted-foreground'
        )}
      >
        <span className="font-semibold">{spot.spot_label}</span>
        <span className="truncate">{client.full_name}</span>
        <span className="truncate opacity-80">{formatPlates(client.vehicles)}</span>
        <button
          type="button"
          aria-label="Liberar cochera"
          onClick={(e) => {
            e.stopPropagation()
            assignSpot.mutate({ spotId: spot.id, clientId: null })
          }}
          className="absolute -top-1.5 -right-1.5 hidden size-4 items-center justify-center rounded-full bg-destructive text-white group-hover:flex"
        >
          <X className="size-3" />
        </button>
      </div>
    )
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setAssignOpen(true)}
        className="flex h-16 w-24 flex-col items-center justify-center gap-0.5 rounded-md border border-dashed border-border text-xs text-muted-foreground hover:border-primary hover:text-primary"
      >
        <span className="font-semibold">{spot.spot_label}</span>
        <span>Libre</span>
      </button>
      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Asignar cochera {spot.spot_label}</DialogTitle>
          </DialogHeader>
          <Select value={selectedClientId} onValueChange={setSelectedClientId}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Seleccioná un cliente sin cochera" />
            </SelectTrigger>
            <SelectContent>
              {unassignedClients.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.full_name} — {formatPlates(c.vehicles)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {unassignedClients.length === 0 && (
            <p className="text-xs text-muted-foreground">
              No hay clientes activos sin cochera asignada.
            </p>
          )}
          <DialogFooter>
            <Button
              disabled={!selectedClientId || assignSpot.isPending}
              onClick={() => {
                assignSpot.mutate(
                  { spotId: spot.id, clientId: selectedClientId },
                  {
                    onSuccess: () => {
                      setAssignOpen(false)
                      setSelectedClientId('')
                    },
                  }
                )
              }}
            >
              Asignar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
