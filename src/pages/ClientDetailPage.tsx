import { useParams, Link } from 'react-router-dom'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { ArrowLeft } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useState } from 'react'
import { useClient } from '@/hooks/useClients'
import {
  useClientPaymentHistory,
  useToggleVoucherVerified,
  getVoucherSignedUrl,
} from '@/hooks/useClientPayments'
import { useClientSpots, useAssignSpot } from '@/hooks/useParkingSpots'
import { ClientFormDialog } from '@/components/clients/ClientFormDialog'
import { ClientPaymentFormDialog } from '@/components/payments/ClientPaymentFormDialog'
import { formatCurrency, computeLateFee, limaToday } from '@/lib/utils'

const statusLabels: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' }> = {
  paid: { label: 'Pagado', variant: 'default' },
  pending: { label: 'Pendiente', variant: 'secondary' },
  late: { label: 'Atrasado', variant: 'destructive' },
}

export function ClientDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: client, isLoading: loadingClient } = useClient(id)
  const { data: spots } = useClientSpots(id)
  const { data: payments, isLoading: loadingPayments } = useClientPaymentHistory(id)
  const toggleVerified = useToggleVoucherVerified()
  const releaseSpot = useAssignSpot()
  const [openingVoucher, setOpeningVoucher] = useState<string | null>(null)

  async function openVoucher(path: string) {
    setOpeningVoucher(path)
    try {
      const url = await getVoucherSignedUrl(path)
      window.open(url, '_blank')
    } finally {
      setOpeningVoucher(null)
    }
  }

  if (loadingClient) return <p className="text-sm text-muted-foreground">Cargando...</p>
  if (!client) return <p className="text-sm text-destructive">Cliente no encontrado.</p>

  return (
    <div className="space-y-4">
      <Link to="/clients" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" />
        Volver a clientes
      </Link>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <CardTitle className="text-xl">{client.full_name}</CardTitle>
            <ul className="text-sm text-muted-foreground">
              {client.vehicles.map((v) => (
                <li key={v.id}>
                  {v.plate}
                  {v.description ? ` — ${v.description}` : ''}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline">{client.client_type === 'owner' ? 'Propietario' : 'Inquilino'}</Badge>
            <Badge variant={client.is_active ? 'default' : 'secondary'}>
              {client.is_active ? 'Activo' : 'Inactivo'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-6">
          <div>
            <p className="text-xs text-muted-foreground">Cochera{spots && spots.length > 1 ? 's' : ''}</p>
            {spots && spots.length > 0 ? (
              <ul className="space-y-0.5">
                {spots.map((s) => (
                  <li key={s.id} className="flex items-center gap-2 text-sm font-medium">
                    {s.gate} — {s.row_label} — {s.spot_label}
                    <button
                      type="button"
                      className="text-xs font-normal text-destructive hover:underline disabled:opacity-50"
                      disabled={releaseSpot.isPending}
                      onClick={() => releaseSpot.mutate({ spotId: s.id, clientId: null })}
                    >
                      Liberar
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm font-medium">Sin asignar</p>
            )}
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Cuota mensual</p>
            <p className="text-sm font-medium">{formatCurrency(client.monthly_fee)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Teléfono</p>
            <p className="text-sm font-medium">{client.phone || '-'}</p>
          </div>
          <div className="ml-auto flex gap-2">
            <ClientFormDialog client={client} />
            <ClientPaymentFormDialog clients={[client]} period={limaToday()} defaultClientId={client.id} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Historial de pagos</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingPayments && <p className="text-sm text-muted-foreground">Cargando...</p>}
          {payments && payments.length === 0 && (
            <p className="text-sm text-muted-foreground">Este cliente todavía no tiene pagos registrados.</p>
          )}
          {payments && payments.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Periodo</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha de pago</TableHead>
                  <TableHead>Método</TableHead>
                  <TableHead>Voucher</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => {
                  const status = statusLabels[payment.status]
                  const lateFee = payment.status !== 'paid' ? computeLateFee(payment.period, limaToday()) : 0
                  return (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium capitalize">
                        {format(new Date(payment.period + 'T00:00:00'), 'MMMM yyyy', { locale: es })}
                      </TableCell>
                      <TableCell>
                        {formatCurrency(payment.amount)}
                        {lateFee > 0 && (
                          <p className="text-xs text-muted-foreground">+S/ {lateFee} mora estimada a hoy</p>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </TableCell>
                      <TableCell>{payment.payment_date ?? '-'}</TableCell>
                      <TableCell>{payment.method ?? '-'}</TableCell>
                      <TableCell>
                        {payment.voucher_path ? (
                          <div className="flex items-center gap-2">
                            <button
                              className="text-xs font-medium text-primary hover:underline disabled:opacity-50"
                              disabled={openingVoucher === payment.voucher_path}
                              onClick={() => openVoucher(payment.voucher_path!)}
                            >
                              Ver
                            </button>
                            <button
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
                        <ClientPaymentFormDialog
                          clients={[client]}
                          period={new Date(payment.period + 'T00:00:00')}
                          payment={payment}
                        />
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
