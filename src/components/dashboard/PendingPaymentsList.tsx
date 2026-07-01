import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { ClientPaymentWithClient } from '@/hooks/useClientPayments'
import { formatCurrency, formatPlates } from '@/lib/utils'

export function PendingPaymentsList({ payments }: { payments: ClientPaymentWithClient[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Pagos pendientes / atrasados este mes</CardTitle>
      </CardHeader>
      <CardContent>
        {payments.length === 0 ? (
          <p className="text-sm text-muted-foreground">No hay pagos pendientes registrados para este mes.</p>
        ) : (
          <ul className="divide-y">
            {payments.map((payment) => (
              <li key={payment.id} className="flex items-center justify-between py-2 text-sm">
                <span>
                  {payment.clients?.full_name} — {formatPlates(payment.clients?.vehicles)}
                </span>
                <span className="flex items-center gap-2">
                  {formatCurrency(payment.amount)}
                  <Badge variant={payment.status === 'late' ? 'destructive' : 'secondary'}>
                    {payment.status === 'late' ? 'Atrasado' : 'Pendiente'}
                  </Badge>
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
