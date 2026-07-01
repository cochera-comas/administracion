import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/database.types'

export type Guard = Database['public']['Tables']['guards']['Row']
export type GuardInsert = Database['public']['Tables']['guards']['Insert']
export type GuardUpdate = Database['public']['Tables']['guards']['Update']

export function useGuards(includeInactive = false) {
  return useQuery({
    queryKey: ['guards', { includeInactive }],
    queryFn: async () => {
      let query = supabase.from('guards').select('*').order('full_name')
      if (!includeInactive) query = query.eq('is_active', true)
      const { data, error } = await query
      if (error) throw error
      return data
    },
  })
}

export function useCreateGuard() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (guard: GuardInsert) => {
      const { data, error } = await supabase.from('guards').insert(guard).select().single()
      if (error) throw error
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['guards'] }),
  })
}

export function useUpdateGuard() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...update }: GuardUpdate & { id: string }) => {
      const { data, error } = await supabase.from('guards').update(update).eq('id', id).select().single()
      if (error) throw error
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['guards'] }),
  })
}
