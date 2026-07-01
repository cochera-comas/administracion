import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import type { Client } from '@/hooks/useClients'
import type { ClientPaymentWithClient } from '@/hooks/useClientPayments'
import { useUpdateClientPaymentStatus } from '@/hooks/useClientPayments'
import { formatCurrency } from '@/lib/utils'

const statusLabels: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' }> = {
  paid: { label: 'Pagado', variant: 'default' },
  pending: { label: 'Pendiente', variant: 'secondary' },
  late: { label: 'Atrasado', variant: 'destructive' },
}

export function ClientPaymentTable({
  clients,
  payments,
}: {
  clients: Client[]
  payments: ClientPaymentWithClient[]
}) {
  const updateStatus = useUpdateClientPaymentStatus()
  const paymentsByClient = new Map(payments.map((p) => [p.client_id, p]))

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Cliente</TableHead>
          <TableHead>Cochera</TableHead>
          <TableHead>Monto</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead className="text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {clients.map((client) => {
          const payment = paymentsByClient.get(client.id)
          const status = payment ? statusLabels[payment.status] : null
          return (
            <TableRow key={client.id}>
              <TableCell className="font-medium">{client.full_name}</TableCell>
              <TableCell>{client.spot_number}</TableCell>
              <TableCell>{formatCurrency(payment?.amount ?? client.monthly_fee)}</TableCell>
              <TableCell>
                {status ? (
                  <Badge variant={status.variant}>{status.label}</Badge>
                ) : (
                  <Badge variant="outline">Sin registro</Badge>
                )}
              </TableCell>
              <TableCell className="text-right">
                {payment && payment.status !== 'paid' && (
                  <button
                    className="text-xs font-medium text-primary hover:underline"
                    onClick={() =>
                      updateStatus.mutate({
                        id: payment.id,
                        status: 'paid',
                        payment_date: new Date().toISOString().slice(0, 10),
                      })
                    }
                  >
                    Marcar como pagado
                  </button>
                )}
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
