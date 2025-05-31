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
      shops: {
        Row: {
          id: string
          created_at: string
          name: string
          description?: string
          profile_id: string
          logo_url?: string
          banner_url?: string
          contact_email?: string
          contact_phone?: string
          address?: string
          is_active: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          description?: string
          profile_id: string
          logo_url?: string
          banner_url?: string
          contact_email?: string
          contact_phone?: string
          address?: string
          is_active?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          description?: string
          profile_id?: string
          logo_url?: string
          banner_url?: string
          contact_email?: string
          contact_phone?: string
          address?: string
          is_active?: boolean
        }
      },
      orders: {
        Row: {
          id: string
          created_at: string
          buyer_id: string
          shop_id: string
          product_id?: string
          service_id?: string
          status: 'pending' | 'processing' | 'completed' | 'cancelled'
          total_amount: number
          order_number: string
        }
        Insert: {
          id?: string
          created_at?: string
          buyer_id: string
          shop_id: string
          product_id?: string
          service_id?: string
          status?: 'pending' | 'processing' | 'completed' | 'cancelled'
          total_amount: number
          order_number: string
        }
        Update: {
          id?: string
          created_at?: string
          buyer_id?: string
          shop_id?: string
          product_id?: string
          service_id?: string
          status?: 'pending' | 'processing' | 'completed' | 'cancelled'
          total_amount?: number
          order_number?: string
        }
      }
      reviews: {
        Row: {
          id: string
          created_at: string
          order_id: string
          product_id?: string
          service_id?: string
          shop_id: string
          buyer_id: string
          rating: number
          comment: string
          type: 'product' | 'service'
        }
        Insert: {
          id?: string
          created_at?: string
          order_id: string
          product_id?: string
          service_id?: string
          shop_id: string
          buyer_id: string
          rating: number
          comment: string
          type: 'product' | 'service'
        }
        Update: {
          id?: string
          created_at?: string
          order_id?: string
          product_id?: string
          service_id?: string
          shop_id?: string
          buyer_id?: string
          rating?: number
          comment?: string
          type?: 'product' | 'service'
        }
      }
      users: {
        Row: {
          id: string
          created_at: string
          email: string
          name: string
          phone?: string
          address?: string
          account_type: 'buyer' | 'seller' | 'admin'
          avatar_url?: string
        }
        Insert: {
          id?: string
          created_at?: string
          email: string
          name: string
          phone?: string
          address?: string
          account_type?: 'buyer' | 'seller' | 'admin'
          avatar_url?: string
        }
        Update: {
          id?: string
          created_at?: string
          email?: string
          name?: string
          phone?: string
          address?: string
          account_type?: 'buyer' | 'seller' | 'admin'
          avatar_url?: string
        }
      }
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Shop = Tables<'shops'>
export type Order = Tables<'orders'>
export type Review = Tables<'reviews'>
export type User = Tables<'users'>
