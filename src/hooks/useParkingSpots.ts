import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/database.types'

export type ParkingSpot = Database['public']['Tables']['parking_spots']['Row']

export type ParkingSpotWithClient = ParkingSpot & {
  clients: {
    id: string
    full_name: string
    vehicles: { plate: string }[]
    monthly_fee: number
    is_active: boolean
  } | null
}

export function useParkingSpots() {
  return useQuery({
    queryKey: ['parking_spots'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('parking_spots')
        .select('*, clients(id, full_name, vehicles(plate), monthly_fee, is_active)')
        .order('gate')
        .order('row_order')
        .order('position')
      if (error) throw error
      return data as ParkingSpotWithClient[]
    },
  })
}

export function useClientSpots(clientId: string | undefined) {
  return useQuery({
    queryKey: ['parking_spots', 'by_client', clientId],
    queryFn: async () => {
      const { data, error } = await supabase.from('parking_spots').select('*').eq('client_id', clientId!)
      if (error) throw error
      return data
    },
    enabled: !!clientId,
  })
}

export function useAssignSpot() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ spotId, clientId }: { spotId: string; clientId: string | null }) => {
      const { data, error } = await supabase
        .from('parking_spots')
        .update({ client_id: clientId })
        .eq('id', spotId)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parking_spots'] })
      queryClient.invalidateQueries({ queryKey: ['clients'] })
    },
  })
}
