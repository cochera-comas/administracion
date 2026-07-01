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
import { useUpdateClient, type Client } from '@/hooks/useClients'
import { formatCurrency } from '@/lib/utils'

export function ClientTable({ clients }: { clients: Client[] }) {
  const updateClient = useUpdateClient()

  if (clients.length === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">No hay clientes para mostrar.</p>
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nombre</TableHead>
          <TableHead>Patente</TableHead>
          <TableHead>Cochera</TableHead>
          <TableHead>Cuota mensual</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead className="text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {clients.map((client) => (
          <TableRow key={client.id}>
            <TableCell className="font-medium">{client.full_name}</TableCell>
            <TableCell>{client.vehicle_plate}</TableCell>
            <TableCell>{client.spot_number}</TableCell>
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
