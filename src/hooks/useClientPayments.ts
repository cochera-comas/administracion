import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/database.types'
import { toDateInputValue } from '@/lib/utils'

export type ClientPayment = Database['public']['Tables']['client_payments']['Row']
export type ClientPaymentInsert = Database['public']['Tables']['client_payments']['Insert']

export type ClientPaymentWithClient = ClientPayment & {
  clients: { full_name: string; spot_number: string } | null
}

export function useClientPayments(period: Date) {
  const periodStr = toDateInputValue(period)
  return useQuery({
    queryKey: ['client_payments', periodStr],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('client_payments')
        .select('*, clients(full_name, spot_number)')
        .eq('period', periodStr)
        .order('created_at')
      if (error) throw error
      return data as ClientPaymentWithClient[]
    },
  })
}

export function useCreateClientPayment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payment: ClientPaymentInsert) => {
      const { data, error } = await supabase.from('client_payments').insert(payment).select().single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client_payments'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard_summary'] })
    },
  })
}

export function useUpdateClientPaymentStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      id,
      status,
      payment_date,
      method,
    }: {
      id: string
      status: ClientPayment['status']
      payment_date?: string | null
      method?: ClientPayment['method']
    }) => {
      const { data, error } = await supabase
        .from('client_payments')
        .update({ status, payment_date, method })
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client_payments'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard_summary'] })
    },
  })
}
