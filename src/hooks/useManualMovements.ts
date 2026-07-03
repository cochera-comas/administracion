import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/database.types'

export type ManualMovement = Database['public']['Tables']['manual_movements']['Row']
export type ManualMovementInsert = Database['public']['Tables']['manual_movements']['Insert']

export function useManualMovements(rangeStart: string, rangeEnd: string) {
  return useQuery({
    queryKey: ['manual_movements', rangeStart, rangeEnd],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('manual_movements')
        .select('*')
        .gte('movement_date', rangeStart)
        .lte('movement_date', rangeEnd)
        .order('movement_date', { ascending: false })
      if (error) throw error
      return data
    },
  })
}

export function useCreateManualMovement() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (movement: ManualMovementInsert) => {
      const { data, error } = await supabase.from('manual_movements').insert(movement).select().single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manual_movements'] })
      queryClient.invalidateQueries({ queryKey: ['movements'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard_summary'] })
    },
  })
}

export function useDeleteManualMovement() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('manual_movements').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manual_movements'] })
      queryClient.invalidateQueries({ queryKey: ['movements'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard_summary'] })
    },
  })
}
