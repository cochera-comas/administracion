import { useDashboardSummary } from '@/hooks/useDashboardSummary'
import { SummaryCards } from '@/components/dashboard/SummaryCards'
import { PendingPaymentsList } from '@/components/dashboard/PendingPaymentsList'

export function DashboardPage() {
  const { data, isLoading, isError } = useDashboardSummary(new Date())

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Resumen</h1>
        <p className="text-sm text-muted-foreground">Estado del mes actual.</p>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Cargando...</p>}
      {isError && <p className="text-sm text-destructive">Error al cargar el resumen.</p>}

      {data && (
        <>
          <SummaryCards
            totalIncomePaid={data.totalIncomePaid}
            totalIncomePending={data.totalIncomePending}
            totalExpenses={data.totalExpenses}
            balance={data.balance}
          />
          <PendingPaymentsList payments={data.pendingPayments} />
        </>
      )}
    </div>
  )
}
