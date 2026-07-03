import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/database.types'

export type HourlyRental = Database['public']['Tables']['hourly_rentals']['Row']
export type HourlyRentalInsert = Database['public']['Tables']['hourly_rentals']['Insert']

export type HourlyRentalWithSpot = HourlyRental & {
  parking_spots: { gate: string; row_label: string; spot_label: string } | null
}

export function useHourlyRentals(rangeStart: string, rangeEnd: string) {
  return useQuery({
    queryKey: ['hourly_rentals', rangeStart, rangeEnd],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hourly_rentals')
        .select('*, parking_spots(gate, row_label, spot_label)')
        .gte('rental_date', rangeStart)
        .lte('rental_date', rangeEnd)
        .order('rental_date', { ascending: false })
      if (error) throw error
      return data as HourlyRentalWithSpot[]
    },
  })
}

export function useCreateHourlyRental() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (rental: HourlyRentalInsert) => {
      const { data, error } = await supabase.from('hourly_rentals').insert(rental).select().single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hourly_rentals'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard_summary'] })
    },
  })
}

export function useUpdateHourlyRental() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...update }: Database['public']['Tables']['hourly_rentals']['Update'] & { id: string }) => {
      const { data, error } = await supabase.from('hourly_rentals').update(update).eq('id', id).select().single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hourly_rentals'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard_summary'] })
    },
  })
}
