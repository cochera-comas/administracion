import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/database.types'

export type Vehicle = Database['public']['Tables']['vehicles']['Row']

export function useReplaceClientVehicles() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      clientId,
      vehicles,
    }: {
      clientId: string
      vehicles: { plate: string; description?: string | null }[]
    }) => {
      const { error: deleteError } = await supabase.from('vehicles').delete().eq('client_id', clientId)
      if (deleteError) throw deleteError

      if (vehicles.length === 0) return []

      const { data, error: insertError } = await supabase
        .from('vehicles')
        .insert(vehicles.map((v) => ({ client_id: clientId, plate: v.plate, description: v.description })))
        .select()
      if (insertError) throw insertError
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      queryClient.invalidateQueries({ queryKey: ['parking_spots'] })
    },
  })
}
