export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      activities: {
        Row: {
          actor_id: string | null
          client_id: string | null
          created_at: string
          deal_id: string | null
          event_type: Database["public"]["Enums"]["activity_event"]
          id: string
          metadata: Json | null
          note: string | null
          production_id: string | null
          shipment_id: string | null
          task_id: string | null
        }
        Insert: {
          actor_id?: string | null
          client_id?: string | null
          created_at?: string
          deal_id?: string | null
          event_type: Database["public"]["Enums"]["activity_event"]
          id?: string
          metadata?: Json | null
          note?: string | null
          production_id?: string | null
          shipment_id?: string | null
          task_id?: string | null
        }
        Update: {
          actor_id?: string | null
          client_id?: string | null
          created_at?: string
          deal_id?: string | null
          event_type?: Database["public"]["Enums"]["activity_event"]
          id?: string
          metadata?: Json | null
          note?: string | null
          production_id?: string | null
          shipment_id?: string | null
          task_id?: string | null
        }
      }
      clients: {
        Row: {
          address: string | null
          city: string | null
          company_name: string
          contact_person: string | null
          country: string | null
          created_at: string
          created_by: string | null
          email: string | null
          id: string
          is_active: boolean
          notes: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          city?: string | null
          company_name: string
          contact_person?: string | null
          country?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          id?: string
          is_active?: boolean
          notes?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          city?: string | null
          company_name?: string
          contact_person?: string | null
          country?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          id?: string
          is_active?: boolean
          notes?: string | null
          phone?: string | null
          updated_at?: string
        }
      }
      deals: {
        Row: {
          actual_close_date: string | null
          assigned_to: string | null
          client_id: string
          created_at: string
          created_by: string | null
          currency: string
          deal_name: string
          expected_close_date: string | null
          id: string
          is_archived: boolean
          next_action: string | null
          next_action_date: string | null
          notes: string | null
          product_description: string | null
          quantity: number | null
          stage: Database["public"]["Enums"]["deal_stage"]
          total_value: number | null
          unit_price: number | null
          updated_at: string
        }
        Insert: {
          actual_close_date?: string | null
          assigned_to?: string | null
          client_id: string
          created_at?: string
          created_by?: string | null
          currency?: string
          deal_name: string
          expected_close_date?: string | null
          id?: string
          is_archived?: boolean
          next_action?: string | null
          next_action_date?: string | null
          notes?: string | null
          product_description?: string | null
          quantity?: number | null
          stage?: Database["public"]["Enums"]["deal_stage"]
          total_value?: number | null
          unit_price?: number | null
          updated_at?: string
        }
        Update: {
          actual_close_date?: string | null
          assigned_to?: string | null
          client_id?: string
          created_at?: string
          created_by?: string | null
          currency?: string
          deal_name?: string
          expected_close_date?: string | null
          id?: string
          is_archived?: boolean
          next_action?: string | null
          next_action_date?: string | null
          notes?: string | null
          product_description?: string | null
          quantity?: number | null
          stage?: Database["public"]["Enums"]["deal_stage"]
          total_value?: number | null
          unit_price?: number | null
          updated_at?: string
        }
      }
      production_orders: {
        Row: {
          actual_completion_date: string | null
          created_at: string
          created_by: string | null
          deal_id: string
          expected_completion_date: string | null
          id: string
          notes: string | null
          quantity: number
          start_date: string | null
          status: Database["public"]["Enums"]["production_status"]
          unit_cost: number | null
          updated_at: string
          vendor_id: string | null
        }
        Insert: {
          actual_completion_date?: string | null
          created_at?: string
          created_by?: string | null
          deal_id: string
          expected_completion_date?: string | null
          id?: string
          notes?: string | null
          quantity: number
          start_date?: string | null
          status?: Database["public"]["Enums"]["production_status"]
          unit_cost?: number | null
          updated_at?: string
          vendor_id?: string | null
        }
        Update: {
          actual_completion_date?: string | null
          created_at?: string
          created_by?: string | null
          deal_id?: string
          expected_completion_date?: string | null
          id?: string
          notes?: string | null
          quantity?: number
          start_date?: string | null
          status?: Database["public"]["Enums"]["production_status"]
          unit_cost?: number | null
          updated_at?: string
          vendor_id?: string | null
        }
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          is_active: boolean
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name: string
          id: string
          is_active?: boolean
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
      }
      shipments: {
        Row: {
          actual_delivery_date: string | null
          courier_name: string | null
          created_at: string
          created_by: string | null
          deal_id: string
          delivery_address: string | null
          dispatch_date: string | null
          expected_delivery_date: string | null
          id: string
          notes: string | null
          recipient_name: string | null
          status: Database["public"]["Enums"]["shipment_status"]
          tracking_number: string | null
          updated_at: string
        }
        Insert: {
          actual_delivery_date?: string | null
          courier_name?: string | null
          created_at?: string
          created_by?: string | null
          deal_id: string
          delivery_address?: string | null
          dispatch_date?: string | null
          expected_delivery_date?: string | null
          id?: string
          notes?: string | null
          recipient_name?: string | null
          status?: Database["public"]["Enums"]["shipment_status"]
          tracking_number?: string | null
          updated_at?: string
        }
      }
      tasks: {
        Row: {
          assigned_to: string
          client_id: string | null
          completed_at: string | null
          created_at: string
          created_by: string | null
          deal_id: string | null
          description: string | null
          due_date: string | null
          id: string
          priority: Database["public"]["Enums"]["task_priority"]
          reminder_date: string | null
          shipment_id: string | null
          status: Database["public"]["Enums"]["task_status"]
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to: string
          client_id?: string | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          deal_id?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: Database["public"]["Enums"]["task_priority"]
          reminder_date?: string | null
          shipment_id?: string | null
          status?: Database["public"]["Enums"]["task_status"]
          title: string
          updated_at?: string
        }
      }
      vendors: {
        Row: {
          address: string | null
          contact_person: string | null
          created_at: string
          created_by: string | null
          email: string | null
          id: string
          is_active: boolean
          name: string
          notes: string | null
          phone: string | null
          speciality: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          contact_person?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          id?: string
          is_active?: boolean
          name: string
          notes?: string | null
          phone?: string | null
          speciality?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          contact_person?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          id?: string
          is_active?: boolean
          name?: string
          notes?: string | null
          phone?: string | null
          speciality?: string | null
          updated_at?: string
        }
      }
    }
    Views: {
      dashboard_summary: {
        Row: {
          active_deals: number | null
          delayed_production: number | null
          due_today: number | null
          overdue_tasks: number | null
          shipments_in_transit: number | null
        }
      }
    }
    Enums: {
      activity_event:
        | "deal_created"
        | "deal_stage_changed"
        | "deal_updated"
        | "task_created"
        | "task_completed"
        | "production_started"
        | "production_completed"
        | "shipment_created"
        | "shipment_dispatched"
        | "shipment_delivered"
        | "note_added"
      deal_stage:
        | "lead"
        | "quoted"
        | "negotiation"
        | "confirmed"
        | "production"
        | "ready_to_ship"
        | "shipped"
        | "completed"
        | "lost"
      production_status:
        | "not_started"
        | "in_progress"
        | "quality_check"
        | "completed"
        | "delayed"
      shipment_status:
        | "preparing"
        | "dispatched"
        | "in_transit"
        | "delivered"
        | "delayed"
      task_priority: "low" | "medium" | "high" | "urgent"
      task_status: "pending" | "doing" | "done" | "overdue"
      user_role: "admin" | "manager" | "sales" | "production" | "logistics"
    }
  }
}

export type Tables<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Row"]
export type Enums<T extends keyof Database["public"]["Enums"]> = Database["public"]["Enums"][T]
