import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/database.types'
import { toDateInputValue } from '@/lib/utils'

export type ClientPayment = Database['public']['Tables']['client_payments']['Row']
export type ClientPaymentInsert = Database['public']['Tables']['client_payments']['Insert']

export type ClientPaymentWithClient = ClientPayment & {
  clients: { full_name: string; vehicles: { plate: string }[] } | null
}

export function useClientPayments(period: Date) {
  const periodStr = toDateInputValue(period)
  return useQuery({
    queryKey: ['client_payments', periodStr],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('client_payments')
        .select('*, clients(full_name, vehicles(plate))')
        .eq('period', periodStr)
        .order('created_at')
      if (error) throw error
      return data as ClientPaymentWithClient[]
    },
  })
}

export function useClientPaymentHistory(clientId: string | undefined) {
  return useQuery({
    queryKey: ['client_payments', 'history', clientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('client_payments')
        .select('*')
        .eq('client_id', clientId!)
        .order('period', { ascending: false })
      if (error) throw error
      return data
    },
    enabled: !!clientId,
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

export function useUploadVoucher() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      paymentId,
      clientId,
      file,
    }: {
      paymentId: string
      clientId: string
      file: File
    }) => {
      const path = `${clientId}/${crypto.randomUUID()}-${file.name}`
      const { error: uploadError } = await supabase.storage.from('vouchers').upload(path, file)
      if (uploadError) throw uploadError

      const { data, error } = await supabase
        .from('client_payments')
        .update({ voucher_path: path })
        .eq('id', paymentId)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client_payments'] })
    },
  })
}

export async function getVoucherSignedUrl(path: string) {
  const { data, error } = await supabase.storage.from('vouchers').createSignedUrl(path, 3600)
  if (error) throw error
  return data.signedUrl
}

export function useToggleVoucherVerified() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, verified }: { id: string; verified: boolean }) => {
      const { data, error } = await supabase
        .from('client_payments')
        .update({ voucher_verified: verified })
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client_payments'] })
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
