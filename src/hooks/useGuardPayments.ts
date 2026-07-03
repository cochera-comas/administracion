import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/database.types'

export type GuardPayment = Database['public']['Tables']['guard_payments']['Row']
export type GuardPaymentInsert = Database['public']['Tables']['guard_payments']['Insert']

export type GuardPaymentWithGuard = GuardPayment & {
  guards: { full_name: string; shift_label: string | null } | null
}

export function useGuardPayments(rangeStart: string, rangeEnd: string) {
  return useQuery({
    queryKey: ['guard_payments', rangeStart, rangeEnd],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('guard_payments')
        .select('*, guards(full_name, shift_label)')
        .gte('period_start', rangeStart)
        .lte('period_end', rangeEnd)
        .order('period_start', { ascending: false })
      if (error) throw error
      return data as GuardPaymentWithGuard[]
    },
  })
}

export function useCreateGuardPayment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payment: GuardPaymentInsert) => {
      const { data, error } = await supabase.from('guard_payments').insert(payment).select().single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guard_payments'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard_summary'] })
    },
  })
}

export function useUpdateGuardPayment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...update }: Database['public']['Tables']['guard_payments']['Update'] & { id: string }) => {
      const { data, error } = await supabase.from('guard_payments').update(update).eq('id', id).select().single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guard_payments'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard_summary'] })
    },
  })
}
