import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ClientFormDialog } from '@/components/clients/ClientFormDialog'
import { useUpdateClient, type ClientWithVehicles } from '@/hooks/useClients'
import { formatCurrency, formatPlates, formatSpotLabels, minSpotNumber } from '@/lib/utils'

export function ClientTable({ clients }: { clients: ClientWithVehicles[] }) {
  const updateClient = useUpdateClient()
  const [spotSort, setSpotSort] = useState<'asc' | 'desc' | null>(null)

  const sortedClients = useMemo(() => {
    if (!spotSort) return clients
    return [...clients].sort((a, b) => {
      const diff = minSpotNumber(a.parking_spots) - minSpotNumber(b.parking_spots)
      return spotSort === 'asc' ? diff : -diff
    })
  }, [clients, spotSort])

  function toggleSpotSort() {
    setSpotSort((current) => (current === 'asc' ? 'desc' : 'asc'))
  }

  if (clients.length === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">No hay clientes para mostrar.</p>
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nombre</TableHead>
          <TableHead>Tipo</TableHead>
          <TableHead>Patente</TableHead>
          <TableHead>
            <button type="button" onClick={toggleSpotSort} className="flex items-center gap-1 hover:text-foreground">
              Cochera
              {spotSort === 'asc' && <ArrowUp className="size-3.5" />}
              {spotSort === 'desc' && <ArrowDown className="size-3.5" />}
              {!spotSort && <ArrowUpDown className="size-3.5" />}
            </button>
          </TableHead>
          <TableHead>Cuota mensual</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead className="text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedClients.map((client) => (
          <TableRow key={client.id}>
            <TableCell className="font-medium">
              <Link to={`/clients/${client.id}`} className="hover:underline">
                {client.full_name}
              </Link>
            </TableCell>
            <TableCell>
              <Badge variant="outline">{client.client_type === 'owner' ? 'Propietario' : 'Inquilino'}</Badge>
            </TableCell>
            <TableCell>{formatPlates(client.vehicles)}</TableCell>
            <TableCell>{formatSpotLabels(client.parking_spots)}</TableCell>
            <TableCell>{formatCurrency(client.monthly_fee)}</TableCell>
            <TableCell>
              <Badge variant={client.is_active ? 'default' : 'secondary'}>
                {client.is_active ? 'Activo' : 'Inactivo'}
              </Badge>
            </TableCell>
            <TableCell className="flex justify-end gap-2">
              <ClientFormDialog client={client} />
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  updateClient.mutate({ id: client.id, is_active: !client.is_active })
                }
              >
                {client.is_active ? 'Desactivar' : 'Activar'}
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
