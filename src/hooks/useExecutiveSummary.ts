import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { monthStart, toDateInputValue, limaToday, getSpotPaymentColor } from '@/lib/utils'

export function useExecutiveSummary() {
  return useQuery({
    queryKey: ['executive_summary'],
    queryFn: async () => {
      const today = limaToday()
      const currentPeriod = toDateInputValue(monthStart(today))

      const [
        clientPaymentsRes,
        guardPaymentsRes,
        hourlyRentalsRes,
        manualMovementsRes,
        activeClientsRes,
        currentPeriodPaymentsRes,
        spotsRes,
      ] = await Promise.all([
        supabase.from('client_payments').select('amount').eq('status', 'paid'),
        supabase.from('guard_payments').select('amount'),
        supabase.from('hourly_rentals').select('amount'),
        supabase.from('manual_movements').select('type, amount'),
        supabase.from('clients').select('id').eq('is_active', true),
        supabase.from('client_payments').select('client_id, status').eq('period', currentPeriod),
        supabase.from('parking_spots').select('id, client_id'),
      ])

      if (clientPaymentsRes.error) throw clientPaymentsRes.error
      if (guardPaymentsRes.error) throw guardPaymentsRes.error
      if (hourlyRentalsRes.error) throw hourlyRentalsRes.error
      if (manualMovementsRes.error) throw manualMovementsRes.error
      if (activeClientsRes.error) throw activeClientsRes.error
      if (currentPeriodPaymentsRes.error) throw currentPeriodPaymentsRes.error
      if (spotsRes.error) throw spotsRes.error

      const totalClientIncome = clientPaymentsRes.data.reduce((s, r) => s + Number(r.amount), 0)
      const totalHourlyIncome = hourlyRentalsRes.data.reduce((s, r) => s + Number(r.amount), 0)
      const totalOtherIncome = manualMovementsRes.data
        .filter((m) => m.type === 'income')
        .reduce((s, r) => s + Number(r.amount), 0)
      const totalGuardExpenses = guardPaymentsRes.data.reduce((s, r) => s + Number(r.amount), 0)
      const totalOtherExpenses = manualMovementsRes.data
        .filter((m) => m.type === 'expense')
        .reduce((s, r) => s + Number(r.amount), 0)

      const totalIngresos = totalClientIncome + totalHourlyIncome + totalOtherIncome
      const totalEgresos = totalGuardExpenses + totalOtherExpenses

      const paymentByClient = new Map(currentPeriodPaymentsRes.data.map((p) => [p.client_id, p.status]))
      let alDia = 0
      let dentroDePlazo = 0
      let enMora = 0
      for (const client of activeClientsRes.data) {
        const status = paymentByClient.get(client.id)
        const color = getSpotPaymentColor(status, today)
        if (color === 'paid') alDia++
        else if (color === 'overdue') enMora++
        else dentroDePlazo++
      }

      const ocupadas = spotsRes.data.filter((s) => s.client_id).length
      const libres = spotsRes.data.length - ocupadas

      return {
        generatedAt: today,
        totalIngresos,
        totalEgresos,
        balance: totalIngresos - totalEgresos,
        totalClientIncome,
        totalHourlyIncome,
        totalOtherIncome,
        totalGuardExpenses,
        totalOtherExpenses,
        totalCocheras: spotsRes.data.length,
        ocupadas,
        libres,
        totalClientesActivos: activeClientsRes.data.length,
        alDia,
        dentroDePlazo,
        enMora,
      }
    },
  })
}
