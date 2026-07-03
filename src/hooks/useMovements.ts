import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export type Movement = {
  id: string
  date: string
  type: 'ingreso' | 'egreso'
  category: 'Cliente' | 'Guardia' | 'Alquiler x hora' | string
  description: string
  amount: number
  method: string | null
  manualMovementId?: string
}

const methodLabels: Record<string, string> = {
  cash: 'Efectivo',
  transfer: 'Transferencia',
  card: 'Tarjeta',
  other: 'Otro',
}

export function useMovements(rangeStart: string, rangeEnd: string) {
  return useQuery({
    queryKey: ['movements', rangeStart, rangeEnd],
    queryFn: async () => {
      const [clientPaymentsRes, guardPaymentsRes, hourlyRentalsRes, manualMovementsRes] = await Promise.all([
        supabase
          .from('client_payments')
          .select('id, amount, payment_date, method, clients(full_name)')
          .eq('status', 'paid')
          .gte('payment_date', rangeStart)
          .lte('payment_date', rangeEnd),
        supabase
          .from('guard_payments')
          .select('id, amount, payment_date, method, guards(full_name)')
          .gte('payment_date', rangeStart)
          .lte('payment_date', rangeEnd),
        supabase
          .from('hourly_rentals')
          .select('id, amount, rental_date, renter_name, parking_spots(spot_label)')
          .gte('rental_date', rangeStart)
          .lte('rental_date', rangeEnd),
        supabase
          .from('manual_movements')
          .select('id, type, category, description, amount, movement_date')
          .gte('movement_date', rangeStart)
          .lte('movement_date', rangeEnd),
      ])

      if (clientPaymentsRes.error) throw clientPaymentsRes.error
      if (guardPaymentsRes.error) throw guardPaymentsRes.error
      if (hourlyRentalsRes.error) throw hourlyRentalsRes.error
      if (manualMovementsRes.error) throw manualMovementsRes.error

      const movements: Movement[] = [
        ...clientPaymentsRes.data.map((p): Movement => ({
          id: `client_payment-${p.id}`,
          date: p.payment_date!,
          type: 'ingreso',
          category: 'Cliente',
          description: p.clients?.full_name ?? 'Cliente',
          amount: Number(p.amount),
          method: p.method ? (methodLabels[p.method] ?? p.method) : null,
        })),
        ...guardPaymentsRes.data.map((p): Movement => ({
          id: `guard_payment-${p.id}`,
          date: p.payment_date,
          type: 'egreso',
          category: 'Guardia',
          description: p.guards?.full_name ?? 'Guardia',
          amount: Number(p.amount),
          method: p.method ? (methodLabels[p.method] ?? p.method) : null,
        })),
        ...hourlyRentalsRes.data.map((r): Movement => ({
          id: `hourly_rental-${r.id}`,
          date: r.rental_date,
          type: 'ingreso',
          category: 'Alquiler x hora',
          description: `${r.renter_name}${r.parking_spots ? ` — cochera ${r.parking_spots.spot_label}` : ''}`,
          amount: Number(r.amount),
          method: null,
        })),
        ...manualMovementsRes.data.map((m): Movement => ({
          id: `manual-${m.id}`,
          date: m.movement_date,
          type: m.type === 'income' ? 'ingreso' : 'egreso',
          category: m.category,
          description: m.description || m.category,
          amount: Number(m.amount),
          method: null,
          manualMovementId: m.id,
        })),
      ]

      movements.sort((a, b) => a.date.localeCompare(b.date))

      const totalIngresos = movements.filter((m) => m.type === 'ingreso').reduce((s, m) => s + m.amount, 0)
      const totalEgresos = movements.filter((m) => m.type === 'egreso').reduce((s, m) => s + m.amount, 0)

      return {
        movements,
        totalIngresos,
        totalEgresos,
        saldoNeto: totalIngresos - totalEgresos,
      }
    },
  })
}
