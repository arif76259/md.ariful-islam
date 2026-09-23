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
      ambassadors: {
        Row: {
          brand: string
          created_at: string
          description: string
          featured: boolean
          highlights: string[]
          id: string
          logo_url: string | null
          period: string
          role_title: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          brand: string
          created_at?: string
          description?: string
          featured?: boolean
          highlights?: string[]
          id?: string
          logo_url?: string | null
          period?: string
          role_title?: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          brand?: string
          created_at?: string
          description?: string
          featured?: boolean
          highlights?: string[]
          id?: string
          logo_url?: string | null
          period?: string
          role_title?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      case_steps: {
        Row: {
          created_at: string
          description: string
          id: string
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string
          id?: string
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      community_impacts: {
        Row: {
          created_at: string
          description: string
          id: string
          label: string
          metric: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string
          id?: string
          label: string
          metric?: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          label?: string
          metric?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      experiences: {
        Row: {
          category: string
          created_at: string
          description: string
          end_date: string
          featured: boolean
          id: string
          image_url: string | null
          is_current: boolean
          organization: string
          responsibilities: string[]
          skills: string[]
          sort_order: number
          start_date: string
          title: string
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string
          end_date?: string
          featured?: boolean
          id?: string
          image_url?: string | null
          is_current?: boolean
          organization?: string
          responsibilities?: string[]
          skills?: string[]
          sort_order?: number
          start_date?: string
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          end_date?: string
          featured?: boolean
          id?: string
          image_url?: string | null
          is_current?: boolean
          organization?: string
          responsibilities?: string[]
          skills?: string[]
          sort_order?: number
          start_date?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      media: {
        Row: {
          created_at: string
          id: string
          kind: string
          name: string
          path: string
          size_bytes: number
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          kind?: string
          name: string
          path?: string
          size_bytes?: number
          updated_at?: string
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          kind?: string
          name?: string
          path?: string
          size_bytes?: number
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      profile: {
        Row: {
          bio: string
          created_at: string
          current_role_title: string
          education: string
          email: string
          focus: string
          headline: string
          id: string
          linkedin: string
          location: string
          name: string
          phone: string
          photo_url: string | null
          resume_url: string | null
          statement: string
          updated_at: string
        }
        Insert: {
          bio?: string
          created_at?: string
          current_role_title?: string
          education?: string
          email?: string
          focus?: string
          headline?: string
          id?: string
          linkedin?: string
          location?: string
          name?: string
          phone?: string
          photo_url?: string | null
          resume_url?: string | null
          statement?: string
          updated_at?: string
        }
        Update: {
          bio?: string
          created_at?: string
          current_role_title?: string
          education?: string
          email?: string
          focus?: string
          headline?: string
          id?: string
          linkedin?: string
          location?: string
          name?: string
          phone?: string
          photo_url?: string | null
          resume_url?: string | null
          statement?: string
          updated_at?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          category: string
          cover_url: string | null
          created_at: string
          description: string
          external_link: string | null
          featured: boolean
          features: string[]
          gallery: string[]
          github_link: string | null
          id: string
          name: string
          sort_order: number
          status: string
          tagline: string
          tools: string[]
          updated_at: string
        }
        Insert: {
          category?: string
          cover_url?: string | null
          created_at?: string
          description?: string
          external_link?: string | null
          featured?: boolean
          features?: string[]
          gallery?: string[]
          github_link?: string | null
          id?: string
          name: string
          sort_order?: number
          status?: string
          tagline?: string
          tools?: string[]
          updated_at?: string
        }
        Update: {
          category?: string
          cover_url?: string | null
          created_at?: string
          description?: string
          external_link?: string | null
          featured?: boolean
          features?: string[]
          gallery?: string[]
          github_link?: string | null
          id?: string
          name?: string
          sort_order?: number
          status?: string
          tagline?: string
          tools?: string[]
          updated_at?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          background_tone: string
          border_intensity: number
          created_at: string
          gradient_intensity: number
          id: string
          keywords: string
          og_description: string
          og_image: string | null
          og_title: string
          primary_accent: string
          secondary_accent: string
          seo_description: string
          seo_title: string
          theme_preset: string
          updated_at: string
        }
        Insert: {
          background_tone?: string
          border_intensity?: number
          created_at?: string
          gradient_intensity?: number
          id?: string
          keywords?: string
          og_description?: string
          og_image?: string | null
          og_title?: string
          primary_accent?: string
          secondary_accent?: string
          seo_description?: string
          seo_title?: string
          theme_preset?: string
          updated_at?: string
        }
        Update: {
          background_tone?: string
          border_intensity?: number
          created_at?: string
          gradient_intensity?: number
          id?: string
          keywords?: string
          og_description?: string
          og_image?: string | null
          og_title?: string
          primary_accent?: string
          secondary_accent?: string
          seo_description?: string
          seo_title?: string
          theme_preset?: string
          updated_at?: string
        }
        Relationships: []
      }
      skills: {
        Row: {
          created_at: string
          group_name: string
          id: string
          level: number
          name: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          group_name?: string
          id?: string
          level?: number
          name: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          group_name?: string
          id?: string
          level?: number
          name?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      social_links: {
        Row: {
          created_at: string
          icon: string
          id: string
          label: string
          sort_order: number
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          icon?: string
          id?: string
          label: string
          sort_order?: number
          updated_at?: string
          url: string
        }
        Update: {
          created_at?: string
          icon?: string
          id?: string
          label?: string
          sort_order?: number
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      claim_admin: { Args: never; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      app_role: "admin"
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
      app_role: ["admin"],
    },
  },
} as const
