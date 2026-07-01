import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'

export function SummaryCards({
  totalIncomePaid,
  totalIncomePending,
  totalHourlyIncome,
  totalExpenses,
  balance,
}: {
  totalIncomePaid: number
  totalIncomePending: number
  totalHourlyIncome: number
  totalExpenses: number
  balance: number
}) {
  const cards = [
    { label: 'Ingresos cobrados', value: totalIncomePaid },
    { label: 'Ingresos pendientes', value: totalIncomePending },
    { label: 'Alquiler por horas', value: totalHourlyIncome },
    { label: 'Egresos (guardias)', value: totalExpenses },
    { label: 'Balance neto', value: balance },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {cards.map((card) => (
        <Card key={card.label}>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">{card.label}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{formatCurrency(card.value)}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
