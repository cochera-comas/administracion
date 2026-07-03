export type PaymentStatus = 'paid' | 'pending' | 'late'
export type PaymentMethod = 'cash' | 'transfer' | 'card' | 'other'
export type ClientType = 'owner' | 'tenant'
export type MovementType = 'income' | 'expense'

export interface Database {
  public: {
    Tables: {
      clients: {
        Row: {
          id: string
          full_name: string
          phone: string | null
          email: string | null
          monthly_fee: number
          is_active: boolean
          client_type: ClientType
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          full_name: string
          phone?: string | null
          email?: string | null
          monthly_fee: number
          is_active?: boolean
          client_type?: ClientType
          notes?: string | null
        }
        Update: Partial<Database['public']['Tables']['clients']['Insert']>
        Relationships: []
      }
      guards: {
        Row: {
          id: string
          full_name: string
          phone: string | null
          shift_label: string | null
          is_active: boolean
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          full_name: string
          phone?: string | null
          shift_label?: string | null
          is_active?: boolean
          notes?: string | null
        }
        Update: Partial<Database['public']['Tables']['guards']['Insert']>
        Relationships: []
      }
      client_payments: {
        Row: {
          id: string
          client_id: string
          period: string
          amount: number
          payment_date: string | null
          method: PaymentMethod | null
          status: PaymentStatus
          notes: string | null
          voucher_path: string | null
          voucher_verified: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          period: string
          amount: number
          payment_date?: string | null
          method?: PaymentMethod | null
          status?: PaymentStatus
          notes?: string | null
          voucher_path?: string | null
          voucher_verified?: boolean
        }
        Update: Partial<Database['public']['Tables']['client_payments']['Insert']>
        Relationships: [
          {
            foreignKeyName: 'client_payments_client_id_fkey'
            columns: ['client_id']
            isOneToOne: false
            referencedRelation: 'clients'
            referencedColumns: ['id']
          },
        ]
      }
      guard_payments: {
        Row: {
          id: string
          guard_id: string
          period_label: string
          period_start: string
          period_end: string
          amount: number
          payment_date: string
          method: PaymentMethod | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          guard_id: string
          period_label: string
          period_start: string
          period_end: string
          amount: number
          payment_date?: string
          method?: PaymentMethod | null
          notes?: string | null
        }
        Update: Partial<Database['public']['Tables']['guard_payments']['Insert']>
        Relationships: [
          {
            foreignKeyName: 'guard_payments_guard_id_fkey'
            columns: ['guard_id']
            isOneToOne: false
            referencedRelation: 'guards'
            referencedColumns: ['id']
          },
        ]
      }
      parking_spots: {
        Row: {
          id: string
          gate: string
          row_label: string
          row_order: number
          position: number
          spot_label: string
          client_id: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          gate: string
          row_label: string
          row_order: number
          position: number
          spot_label: string
          client_id?: string | null
          notes?: string | null
        }
        Update: Partial<Database['public']['Tables']['parking_spots']['Insert']>
        Relationships: [
          {
            foreignKeyName: 'parking_spots_client_id_fkey'
            columns: ['client_id']
            isOneToOne: false
            referencedRelation: 'clients'
            referencedColumns: ['id']
          },
        ]
      }
      vehicles: {
        Row: {
          id: string
          client_id: string
          plate: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          plate: string
          description?: string | null
        }
        Update: Partial<Database['public']['Tables']['vehicles']['Insert']>
        Relationships: [
          {
            foreignKeyName: 'vehicles_client_id_fkey'
            columns: ['client_id']
            isOneToOne: false
            referencedRelation: 'clients'
            referencedColumns: ['id']
          },
        ]
      }
      hourly_rentals: {
        Row: {
          id: string
          spot_id: string
          renter_name: string
          vehicle_plate: string | null
          rental_date: string
          hours: number
          amount: number
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          spot_id: string
          renter_name: string
          vehicle_plate?: string | null
          rental_date?: string
          hours: number
          amount: number
          notes?: string | null
        }
        Update: Partial<Database['public']['Tables']['hourly_rentals']['Insert']>
        Relationships: [
          {
            foreignKeyName: 'hourly_rentals_spot_id_fkey'
            columns: ['spot_id']
            isOneToOne: false
            referencedRelation: 'parking_spots'
            referencedColumns: ['id']
          },
        ]
      }
      manual_movements: {
        Row: {
          id: string
          type: MovementType
          category: string
          description: string | null
          amount: number
          movement_date: string
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          type: MovementType
          category: string
          description?: string | null
          amount: number
          movement_date?: string
          notes?: string | null
        }
        Update: Partial<Database['public']['Tables']['manual_movements']['Insert']>
        Relationships: []
      }
    }
    Views: {
      v_monthly_summary: {
        Row: {
          period: string
          total_income_paid: number | null
          total_income_pending: number | null
          paid_count: number
          pending_count: number
          late_count: number
        }
        Relationships: []
      }
    }
    Functions: Record<string, never>
    Enums: {
      payment_status: PaymentStatus
      payment_method: PaymentMethod
      client_type: ClientType
      movement_type: MovementType
    }
    CompositeTypes: Record<string, never>
  }
}
