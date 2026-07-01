import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { ClientPaymentWithClient } from '@/hooks/useClientPayments'
import { monthStart, toDateInputValue } from '@/lib/utils'

export function useDashboardSummary(referenceDate: Date) {
  const period = toDateInputValue(monthStart(referenceDate))
  const monthRangeStart = period
  const monthRangeEnd = toDateInputValue(new Date(referenceDate.getFullYear(), referenceDate.getMonth() + 1, 0))

  return useQuery({
    queryKey: ['dashboard_summary', period],
    queryFn: async () => {
      const [summaryRes, guardExpensesRes, pendingRes] = await Promise.all([
        supabase.from('v_monthly_summary').select('*').eq('period', period).maybeSingle(),
        supabase
          .from('guard_payments')
          .select('amount')
          .gte('period_start', monthRangeStart)
          .lte('period_start', monthRangeEnd),
        supabase
          .from('client_payments')
          .select('*, clients(full_name, vehicles(plate))')
          .eq('period', period)
          .in('status', ['pending', 'late'])
          .order('status', { ascending: false }),
      ])

      if (summaryRes.error) throw summaryRes.error
      if (guardExpensesRes.error) throw guardExpensesRes.error
      if (pendingRes.error) throw pendingRes.error

      const totalIncomePaid = summaryRes.data?.total_income_paid ?? 0
      const totalIncomePending = summaryRes.data?.total_income_pending ?? 0
      const totalExpenses = guardExpensesRes.data.reduce((sum, row) => sum + Number(row.amount), 0)

      return {
        totalIncomePaid,
        totalIncomePending,
        totalExpenses,
        balance: totalIncomePaid - totalExpenses,
        pendingCount: summaryRes.data?.pending_count ?? 0,
        lateCount: summaryRes.data?.late_count ?? 0,
        pendingPayments: pendingRes.data as ClientPaymentWithClient[],
      }
    },
  })
}
