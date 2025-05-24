export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      equipment: {
        Row: {
          id: string
          created_at: string | null
          title: string
          description: string | null
          type: string
          location: string
          rate: number
          owner_id: string
          status: string | null
        }
        Insert: {
          id?: string
          created_at?: string | null
          title: string
          description?: string | null
          type: string
          location: string
          rate: number
          owner_id: string
          status?: string | null
        }
        Update: {
          id?: string
          created_at?: string | null
          title?: string
          description?: string | null
          type?: string
          location?: string
          rate?: number
          owner_id?: string
          status?: string | null
        }
      }
      bookings: {
        Row: {
          id: string
          created_at: string | null
          equipment_id: string
          user_id: string
          start_date: string
          end_date: string
          status: string | null
        }
        Insert: {
          id?: string
          created_at?: string | null
          equipment_id: string
          user_id: string
          start_date: string
          end_date: string
          status?: string | null
        }
        Update: {
          id?: string
          created_at?: string | null
          equipment_id?: string
          user_id?: string
          start_date?: string
          end_date?: string
          status?: string | null
        }
      }
      user_profiles: {
        Row: {
          id: string
          user_id: string
          email: string
          created_at: string | null
          full_name: string | null
          phone: string | null
          company_name: string | null
          profile_image_url: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          email: string
          created_at?: string | null
          full_name?: string | null
          phone?: string | null
          company_name?: string | null
          profile_image_url?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          email?: string
          created_at?: string | null
          full_name?: string | null
          phone?: string | null
          company_name?: string | null
          profile_image_url?: string | null
          updated_at?: string | null
        }
      }
      user_roles: {
        Row: {
          id: string
          user_id: string
          role: string
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          role: string
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          role?: string
          created_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}