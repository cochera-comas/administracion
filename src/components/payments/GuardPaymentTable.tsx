import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { GuardPaymentWithGuard } from '@/hooks/useGuardPayments'
import type { Guard } from '@/hooks/useGuards'
import { GuardPaymentFormDialog } from '@/components/payments/GuardPaymentFormDialog'
import { formatCurrency } from '@/lib/utils'

export function GuardPaymentTable({
  payments,
  guards,
}: {
  payments: GuardPaymentWithGuard[]
  guards: Guard[]
}) {
  if (payments.length === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">No hay pagos registrados en este rango.</p>
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Guardia</TableHead>
          <TableHead>Periodo</TableHead>
          <TableHead>Rango</TableHead>
          <TableHead>Monto</TableHead>
          <TableHead>Fecha de pago</TableHead>
          <TableHead className="text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {payments.map((payment) => (
          <TableRow key={payment.id}>
            <TableCell className="font-medium">{payment.guards?.full_name ?? '—'}</TableCell>
            <TableCell>{payment.period_label}</TableCell>
            <TableCell>
              {payment.period_start} — {payment.period_end}
            </TableCell>
            <TableCell>{formatCurrency(payment.amount)}</TableCell>
            <TableCell>{payment.payment_date}</TableCell>
            <TableCell className="text-right">
              <GuardPaymentFormDialog guards={guards} payment={payment} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
