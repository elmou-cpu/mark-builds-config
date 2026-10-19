export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.17"
  }
  public: {
    Tables: {
      admin_invitations: {
        Row: {
          accepted_at: string | null
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string | null
          invited_user_id: string | null
          revoked_at: string | null
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          email: string
          expires_at: string
          id?: string
          invited_by?: string | null
          invited_user_id?: string | null
          revoked_at?: string | null
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string | null
          invited_user_id?: string | null
          revoked_at?: string | null
        }
        Relationships: []
      }
      audit_log: {
        Row: {
          action: string
          actor_email: string
          actor_id: string | null
          after_data: Json | null
          before_data: Json | null
          created_at: string
          entity_id: string | null
          entity_label: string
          entity_type: string
          id: string
        }
        Insert: {
          action: string
          actor_email?: string
          actor_id?: string | null
          after_data?: Json | null
          before_data?: Json | null
          created_at?: string
          entity_id?: string | null
          entity_label?: string
          entity_type: string
          id?: string
        }
        Update: {
          action?: string
          actor_email?: string
          actor_id?: string | null
          after_data?: Json | null
          before_data?: Json | null
          created_at?: string
          entity_id?: string | null
          entity_label?: string
          entity_type?: string
          id?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          active: boolean
          created_at: string
          created_by: string | null
          id: string
          label: string
          name: string
          sort_order: number
          updated_by: string | null
        }
        Insert: {
          active?: boolean
          created_at?: string
          created_by?: string | null
          id: string
          label?: string
          name: string
          sort_order?: number
          updated_by?: string | null
        }
        Update: {
          active?: boolean
          created_at?: string
          created_by?: string | null
          id?: string
          label?: string
          name?: string
          sort_order?: number
          updated_by?: string | null
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          client_ip: string | null
          created_at: string
          email: string
          full_name: string
          handled_at: string | null
          handled_by: string | null
          id: string
          message: string
          phone: string
          status: Database["public"]["Enums"]["message_status"]
          subject: string
          updated_at: string
        }
        Insert: {
          client_ip?: string | null
          created_at?: string
          email: string
          full_name: string
          handled_at?: string | null
          handled_by?: string | null
          id?: string
          message: string
          phone?: string
          status?: Database["public"]["Enums"]["message_status"]
          subject?: string
          updated_at?: string
        }
        Update: {
          client_ip?: string | null
          created_at?: string
          email?: string
          full_name?: string
          handled_at?: string | null
          handled_by?: string | null
          id?: string
          message?: string
          phone?: string
          status?: Database["public"]["Enums"]["message_status"]
          subject?: string
          updated_at?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          line_total: number
          order_id: string
          product_id: string | null
          product_name: string
          product_sku: string
          product_slug: string
          quantity: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          id?: string
          line_total: number
          order_id: string
          product_id?: string | null
          product_name: string
          product_sku?: string
          product_slug?: string
          quantity: number
          unit_price: number
        }
        Update: {
          created_at?: string
          id?: string
          line_total?: number
          order_id?: string
          product_id?: string | null
          product_name?: string
          product_sku?: string
          product_slug?: string
          quantity?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          address: string
          cancellation_reason: string | null
          cancelled_at: string | null
          client_ip: string | null
          created_at: string
          currency: string
          customer_email: string | null
          customer_name: string
          customer_phone: string
          delivery_mode: Database["public"]["Enums"]["delivery_mode"]
          discount_amount: number
          id: string
          notes: string
          order_number: string
          paid_at: string | null
          payment_provider: string | null
          payment_reference: string | null
          payment_status: Database["public"]["Enums"]["payment_status"]
          refund_amount: number | null
          refunded_at: string | null
          shipping_fee: number
          status: Database["public"]["Enums"]["order_status"]
          stock_released: boolean
          subtotal: number
          tax_amount: number
          total: number
          updated_at: string
          wilaya: string
        }
        Insert: {
          address?: string
          cancellation_reason?: string | null
          cancelled_at?: string | null
          client_ip?: string | null
          created_at?: string
          currency?: string
          customer_email?: string | null
          customer_name: string
          customer_phone: string
          delivery_mode?: Database["public"]["Enums"]["delivery_mode"]
          discount_amount?: number
          id?: string
          notes?: string
          order_number: string
          paid_at?: string | null
          payment_provider?: string | null
          payment_reference?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          refund_amount?: number | null
          refunded_at?: string | null
          shipping_fee?: number
          status?: Database["public"]["Enums"]["order_status"]
          stock_released?: boolean
          subtotal: number
          tax_amount?: number
          total: number
          updated_at?: string
          wilaya: string
        }
        Update: {
          address?: string
          cancellation_reason?: string | null
          cancelled_at?: string | null
          client_ip?: string | null
          created_at?: string
          currency?: string
          customer_email?: string | null
          customer_name?: string
          customer_phone?: string
          delivery_mode?: Database["public"]["Enums"]["delivery_mode"]
          discount_amount?: number
          id?: string
          notes?: string
          order_number?: string
          paid_at?: string | null
          payment_provider?: string | null
          payment_reference?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          refund_amount?: number | null
          refunded_at?: string | null
          shipping_fee?: number
          status?: Database["public"]["Enums"]["order_status"]
          stock_released?: boolean
          subtotal?: number
          tax_amount?: number
          total?: number
          updated_at?: string
          wilaya?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          active: boolean
          attributes: Json
          badge: string | null
          brand: string
          category_id: string
          condition: string
          created_at: string
          created_by: string | null
          description: string
          featured: boolean
          id: string
          image_path: string | null
          image_paths: Json
          image_url: string | null
          low_stock_threshold: number
          name: string
          old_price: number | null
          price: number
          rating: number | null
          sku: string
          slug: string
          specifications: Json
          status: string
          stock: number
          tags: Json
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          active?: boolean
          attributes?: Json
          badge?: string | null
          brand?: string
          category_id: string
          condition?: string
          created_at?: string
          created_by?: string | null
          description?: string
          featured?: boolean
          id?: string
          image_path?: string | null
          image_paths?: Json
          image_url?: string | null
          low_stock_threshold?: number
          name: string
          old_price?: number | null
          price?: number
          rating?: number | null
          sku?: string
          slug: string
          specifications?: Json
          status?: string
          stock?: number
          tags?: Json
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          active?: boolean
          attributes?: Json
          badge?: string | null
          brand?: string
          category_id?: string
          condition?: string
          created_at?: string
          created_by?: string | null
          description?: string
          featured?: boolean
          id?: string
          image_path?: string | null
          image_paths?: Json
          image_url?: string | null
          low_stock_threshold?: number
          name?: string
          old_price?: number | null
          price?: number
          rating?: number | null
          sku?: string
          slug?: string
          specifications?: Json
          status?: string
          stock?: number
          tags?: Json
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      rate_limits: {
        Row: {
          attempts: number
          blocked_until: string | null
          bucket: string
          window_start: string
        }
        Insert: {
          attempts?: number
          blocked_until?: string | null
          bucket: string
          window_start?: string
        }
        Update: {
          attempts?: number
          blocked_until?: string | null
          bucket?: string
          window_start?: string
        }
        Relationships: []
      }
      store_settings: {
        Row: {
          created_at: string
          default_low_stock_threshold: number
          delivery_fee: number
          free_delivery_threshold: number | null
          id: boolean
          notification_email: string
          tax_rate: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          default_low_stock_threshold?: number
          delivery_fee?: number
          free_delivery_threshold?: number | null
          id?: boolean
          notification_email?: string
          tax_rate?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          default_low_stock_threshold?: number
          delivery_fee?: number
          free_delivery_threshold?: number | null
          id?: boolean
          notification_email?: string
          tax_rate?: number
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          granted_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          granted_by?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          granted_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cancel_order: {
        Args: { p_actor: string; p_order_id: string; p_reason: string }
        Returns: Json
      }
      consume_rate_limit: {
        Args: {
          p_backoff_seconds?: number
          p_bucket: string
          p_limit: number
          p_window_seconds: number
        }
        Returns: Json
      }
      create_order: {
        Args: { p_client_ip?: string; p_customer: Json; p_items: Json }
        Returns: Json
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      reset_rate_limit: { Args: { p_bucket: string }; Returns: undefined }
    }
    Enums: {
      app_role: "admin" | "user"
      delivery_mode: "retrait" | "livraison"
      message_status: "nouveau" | "lu" | "resolu"
      order_status:
        | "nouvelle"
        | "confirmee"
        | "prete"
        | "expediee"
        | "livree"
        | "annulee"
      payment_status: "impaye" | "paye" | "rembourse" | "echoue"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
      delivery_mode: ["retrait", "livraison"],
      message_status: ["nouveau", "lu", "resolu"],
      order_status: [
        "nouvelle",
        "confirmee",
        "prete",
        "expediee",
        "livree",
        "annulee",
      ],
      payment_status: ["impaye", "paye", "rembourse", "echoue"],
    },
  },
} as const
