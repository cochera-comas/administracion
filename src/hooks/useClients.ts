import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/database.types'
import type { Vehicle } from '@/hooks/useVehicles'

export type Client = Database['public']['Tables']['clients']['Row']
export type ClientInsert = Database['public']['Tables']['clients']['Insert']
export type ClientUpdate = Database['public']['Tables']['clients']['Update']

export type ClientWithVehicles = Client & { vehicles: Vehicle[] }

export function useClients(includeInactive = false) {
  return useQuery({
    queryKey: ['clients', { includeInactive }],
    queryFn: async () => {
      let query = supabase.from('clients').select('*, vehicles(*)').order('full_name')
      if (!includeInactive) query = query.eq('is_active', true)
      const { data, error } = await query
      if (error) throw error
      return data as ClientWithVehicles[]
    },
  })
}

export function useClient(id: string | undefined) {
  return useQuery({
    queryKey: ['clients', 'detail', id],
    queryFn: async () => {
      const { data, error } = await supabase.from('clients').select('*, vehicles(*)').eq('id', id!).single()
      if (error) throw error
      return data as ClientWithVehicles
    },
    enabled: !!id,
  })
}

export function useCreateClient() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (client: ClientInsert) => {
      const { data, error } = await supabase.from('clients').insert(client).select().single()
      if (error) throw error
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['clients'] }),
  })
}

export function useUpdateClient() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...update }: ClientUpdate & { id: string }) => {
      const { data, error } = await supabase.from('clients').update(update).eq('id', id).select().single()
      if (error) throw error
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['clients'] }),
  })
}
