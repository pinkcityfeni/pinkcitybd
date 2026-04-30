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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      app_settings: {
        Row: {
          key: string
          updated_at: string
          value: string
        }
        Insert: {
          key: string
          updated_at?: string
          value?: string
        }
        Update: {
          key?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      banners: {
        Row: {
          active: boolean
          created_at: string
          id: string
          image: string
          link: string
          sort_order: number
          title: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          image?: string
          link?: string
          sort_order?: number
          title?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          image?: string
          link?: string
          sort_order?: number
          title?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          icon: string
          id: string
          image: string | null
          name: string
          sort_order: number
          subcategories: string[]
        }
        Insert: {
          created_at?: string
          icon?: string
          id?: string
          image?: string | null
          name: string
          sort_order?: number
          subcategories?: string[]
        }
        Update: {
          created_at?: string
          icon?: string
          id?: string
          image?: string | null
          name?: string
          sort_order?: number
          subcategories?: string[]
        }
        Relationships: []
      }
      customer_points: {
        Row: {
          created_at: string
          id: string
          name: string
          phone: string
          points: number
          total_earned: number
          total_redeemed: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          name?: string
          phone: string
          points?: number
          total_earned?: number
          total_redeemed?: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          phone?: string
          points?: number
          total_earned?: number
          total_redeemed?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      orders: {
        Row: {
          created_at: string
          customer_email: string | null
          customer_name: string | null
          customer_phone: string | null
          customer_phone_normalized: string | null
          delivery_address: string | null
          delivery_charge: number | null
          delivery_zone: string | null
          discount: number | null
          discount_type: string | null
          id: string
          items: Json
          payment_method: string | null
          payment_status: string | null
          points_earned: number
          points_redeemed: number
          returned_items: Json
          split_payment: Json | null
          status: string
          total: number
          type: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          customer_phone_normalized?: string | null
          delivery_address?: string | null
          delivery_charge?: number | null
          delivery_zone?: string | null
          discount?: number | null
          discount_type?: string | null
          id?: string
          items?: Json
          payment_method?: string | null
          payment_status?: string | null
          points_earned?: number
          points_redeemed?: number
          returned_items?: Json
          split_payment?: Json | null
          status?: string
          total?: number
          type?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          customer_phone_normalized?: string | null
          delivery_address?: string | null
          delivery_charge?: number | null
          delivery_zone?: string | null
          discount?: number | null
          discount_type?: string | null
          id?: string
          items?: Json
          payment_method?: string | null
          payment_status?: string | null
          points_earned?: number
          points_redeemed?: number
          returned_items?: Json
          split_payment?: Json | null
          status?: string
          total?: number
          type?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      point_transactions: {
        Row: {
          created_at: string
          customer_id: string
          id: string
          note: string | null
          order_id: string | null
          points: number
          type: string
        }
        Insert: {
          created_at?: string
          customer_id: string
          id?: string
          note?: string | null
          order_id?: string | null
          points: number
          type: string
        }
        Update: {
          created_at?: string
          customer_id?: string
          id?: string
          note?: string | null
          order_id?: string | null
          points?: number
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "point_transactions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customer_points"
            referencedColumns: ["id"]
          },
        ]
      }
      pos_returns: {
        Row: {
          created_at: string
          id: string
          items: Json
          order_id: string
          points_reverted: number
          processed_by: string | null
          reason: string | null
          refund_method: string
          total_refund: number
        }
        Insert: {
          created_at?: string
          id?: string
          items?: Json
          order_id: string
          points_reverted?: number
          processed_by?: string | null
          reason?: string | null
          refund_method?: string
          total_refund?: number
        }
        Update: {
          created_at?: string
          id?: string
          items?: Json
          order_id?: string
          points_reverted?: number
          processed_by?: string | null
          reason?: string | null
          refund_method?: string
          total_refund?: number
        }
        Relationships: []
      }
      products: {
        Row: {
          barcode: string
          buying_price: number
          category: string
          compare_at_price: number
          created_at: string
          description: string
          id: string
          image: string
          images: string[]
          name: string
          price: number
          source: string
          stock: number
          subcategory: string
          trending: boolean
          updated_at: string
        }
        Insert: {
          barcode?: string
          buying_price?: number
          category?: string
          compare_at_price?: number
          created_at?: string
          description?: string
          id?: string
          image?: string
          images?: string[]
          name: string
          price?: number
          source?: string
          stock?: number
          subcategory?: string
          trending?: boolean
          updated_at?: string
        }
        Update: {
          barcode?: string
          buying_price?: number
          category?: string
          compare_at_price?: number
          created_at?: string
          description?: string
          id?: string
          image?: string
          images?: string[]
          name?: string
          price?: number
          source?: string
          stock?: number
          subcategory?: string
          trending?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          name: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          approved: boolean
          comment: string
          created_at: string
          customer_name: string
          id: string
          product_id: string
          rating: number
          user_id: string | null
        }
        Insert: {
          approved?: boolean
          comment?: string
          created_at?: string
          customer_name?: string
          id?: string
          product_id: string
          rating: number
          user_id?: string | null
        }
        Update: {
          approved?: boolean
          comment?: string
          created_at?: string
          customer_name?: string
          id?: string
          product_id?: string
          rating?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products_public"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      products_public: {
        Row: {
          barcode: string | null
          category: string | null
          compare_at_price: number | null
          created_at: string | null
          description: string | null
          id: string | null
          image: string | null
          images: string[] | null
          name: string | null
          price: number | null
          stock: number | null
          subcategory: string | null
          trending: boolean | null
          updated_at: string | null
        }
        Insert: {
          barcode?: string | null
          category?: string | null
          compare_at_price?: number | null
          created_at?: string | null
          description?: string | null
          id?: string | null
          image?: string | null
          images?: string[] | null
          name?: string | null
          price?: number | null
          stock?: number | null
          subcategory?: string | null
          trending?: boolean | null
          updated_at?: string | null
        }
        Update: {
          barcode?: string | null
          category?: string | null
          compare_at_price?: number | null
          created_at?: string | null
          description?: string | null
          id?: string | null
          image?: string | null
          images?: string[] | null
          name?: string | null
          price?: number | null
          stock?: number | null
          subcategory?: string | null
          trending?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "cashier" | "customer"
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
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
      app_role: ["admin", "cashier", "customer"],
    },
  },
} as const
