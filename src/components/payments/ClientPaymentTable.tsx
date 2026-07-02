import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import type { ClientWithVehicles } from '@/hooks/useClients'
import type { ClientPaymentWithClient } from '@/hooks/useClientPayments'
import { useUpdateClientPaymentStatus, useToggleVoucherVerified, getVoucherSignedUrl } from '@/hooks/useClientPayments'
import { ClientPaymentFormDialog } from '@/components/payments/ClientPaymentFormDialog'
import { formatCurrency, formatPlates, computeLateFee, toDateInputValue, limaToday } from '@/lib/utils'

const statusLabels: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' }> = {
  paid: { label: 'Pagado', variant: 'default' },
  pending: { label: 'Pendiente', variant: 'secondary' },
  late: { label: 'Atrasado', variant: 'destructive' },
}

export function ClientPaymentTable({
  clients,
  payments,
  period,
}: {
  clients: ClientWithVehicles[]
  payments: ClientPaymentWithClient[]
  period: Date
}) {
  const updateStatus = useUpdateClientPaymentStatus()
  const toggleVerified = useToggleVoucherVerified()
  const [openingVoucher, setOpeningVoucher] = useState<string | null>(null)
  const paymentsByClient = new Map(payments.map((p) => [p.client_id, p]))
  const periodStr = toDateInputValue(new Date(period.getFullYear(), period.getMonth(), 1))
  const lateFee = computeLateFee(periodStr, limaToday())

  async function openVoucher(path: string) {
    setOpeningVoucher(path)
    try {
      const url = await getVoucherSignedUrl(path)
      window.open(url, '_blank')
    } finally {
      setOpeningVoucher(null)
    }
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Cliente</TableHead>
          <TableHead>Patente</TableHead>
          <TableHead>Monto</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead>Voucher</TableHead>
          <TableHead className="text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {clients.map((client) => {
          const payment = paymentsByClient.get(client.id)
          const status = payment ? statusLabels[payment.status] : null
          const pending = payment && payment.status !== 'paid'
          return (
            <TableRow key={client.id}>
              <TableCell className="font-medium">{client.full_name}</TableCell>
              <TableCell>{formatPlates(client.vehicles)}</TableCell>
              <TableCell>
                {formatCurrency(payment?.amount ?? client.monthly_fee)}
                {pending && lateFee > 0 && (
                  <p className="text-xs text-muted-foreground">+S/ {lateFee} mora estimada a hoy</p>
                )}
              </TableCell>
              <TableCell>
                {status ? (
                  <Badge variant={status.variant}>{status.label}</Badge>
                ) : (
                  <Badge variant="outline">Sin registro</Badge>
                )}
              </TableCell>
              <TableCell>
                {payment?.voucher_path ? (
                  <div className="flex items-center gap-2">
                    <button
                      className="text-xs font-medium text-primary hover:underline disabled:opacity-50"
                      disabled={openingVoucher === payment.voucher_path}
                      onClick={() => openVoucher(payment.voucher_path!)}
                    >
                      Ver voucher
                    </button>
                    <button
                      className="text-xs"
                      onClick={() =>
                        toggleVerified.mutate({ id: payment.id, verified: !payment.voucher_verified })
                      }
                    >
                      <Badge variant={payment.voucher_verified ? 'default' : 'outline'}>
                        {payment.voucher_verified ? 'Verificado' : 'Sin verificar'}
                      </Badge>
                    </button>
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground">—</span>
                )}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-3">
                  {payment && payment.status !== 'paid' && (
                    <button
                      className="text-xs font-medium text-primary hover:underline"
                      onClick={() =>
                        updateStatus.mutate({
                          id: payment.id,
                          status: 'paid',
                          payment_date: toDateInputValue(limaToday()),
                        })
                      }
                    >
                      Marcar como pagado
                    </button>
                  )}
                  {payment && (
                    <ClientPaymentFormDialog clients={clients} period={period} payment={payment} />
                  )}
                </div>
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
