export type PaymentStatus = 'paid' | 'pending' | 'late'
export type PaymentMethod = 'cash' | 'transfer' | 'card' | 'other'

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
    }
    CompositeTypes: Record<string, never>
  }
}
