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
      Courses_Table: {
        Row: {
          c_name: string | null
          content_prompt: string | null
          course_modules: Json | null
          cover_image: string | null
          created_at: string
          creator_id: string | null
          creator_name: string | null
          description: string | null
          enrolled_count: number | null
          id: number
          skill_offered: Json | null
        }
        Insert: {
          c_name?: string | null
          content_prompt?: string | null
          course_modules?: Json | null
          cover_image?: string | null
          created_at?: string
          creator_id?: string | null
          creator_name?: string | null
          description?: string | null
          enrolled_count?: number | null
          id?: number
          skill_offered?: Json | null
        }
        Update: {
          c_name?: string | null
          content_prompt?: string | null
          course_modules?: Json | null
          cover_image?: string | null
          created_at?: string
          creator_id?: string | null
          creator_name?: string | null
          description?: string | null
          enrolled_count?: number | null
          id?: number
          skill_offered?: Json | null
        }
        Relationships: []
      }
      Learner_Profile: {
        Row: {
          avatar: string | null
          Courses: Json | null
          Courses_Enrolled: Json | null
          created_at: string
          Email: string | null
          id: number
          last_course_visited_id: string | null
          n_textual_solve: number | null
          n_visual_solve: number | null
          Name: string | null
          Skills: Json | null
        }
        Insert: {
          avatar?: string | null
          Courses?: Json | null
          Courses_Enrolled?: Json | null
          created_at?: string
          Email?: string | null
          id?: number
          last_course_visited_id?: string | null
          n_textual_solve?: number | null
          n_visual_solve?: number | null
          Name?: string | null
          Skills?: Json | null
        }
        Update: {
          avatar?: string | null
          Courses?: Json | null
          Courses_Enrolled?: Json | null
          created_at?: string
          Email?: string | null
          id?: number
          last_course_visited_id?: string | null
          n_textual_solve?: number | null
          n_visual_solve?: number | null
          Name?: string | null
          Skills?: Json | null
        }
        Relationships: []
      }
      module_content: {
        Row: {
          content: string | null
          created_at: string
          id: string
          module_id: string
          textual_content: string | null
          updated_at: string
          visual_content: Json | null
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          module_id: string
          textual_content?: string | null
          updated_at?: string
          visual_content?: Json | null
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: string
          module_id?: string
          textual_content?: string | null
          updated_at?: string
          visual_content?: Json | null
        }
        Relationships: []
      }
      modules: {
        Row: {
          course_id: string
          created_at: string
          description: string | null
          id: string
          order: number
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          course_id: string
          created_at?: string
          description?: string | null
          id: string
          order: number
          title: string
          type?: string
          updated_at?: string
        }
        Update: {
          course_id?: string
          created_at?: string
          description?: string | null
          id?: string
          order?: number
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          courses_enrolled: Json | null
          created_at: string
          full_name: string | null
          id: string
          last_course_visited_id: string | null
          skills: Json | null
          textual_points: number | null
          updated_at: string
          visual_points: number | null
        }
        Insert: {
          avatar_url?: string | null
          courses_enrolled?: Json | null
          created_at?: string
          full_name?: string | null
          id: string
          last_course_visited_id?: string | null
          skills?: Json | null
          textual_points?: number | null
          updated_at?: string
          visual_points?: number | null
        }
        Update: {
          avatar_url?: string | null
          courses_enrolled?: Json | null
          created_at?: string
          full_name?: string | null
          id?: string
          last_course_visited_id?: string | null
          skills?: Json | null
          textual_points?: number | null
          updated_at?: string
          visual_points?: number | null
        }
        Relationships: []
      }
      quizzes: {
        Row: {
          created_at: string
          id: string
          module_id: string
          questions: Json | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          module_id: string
          questions?: Json | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          module_id?: string
          questions?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      user_course_progress: {
        Row: {
          completed_module_ids: string[] | null
          completed_modules: Json | null
          course_id: string
          created_at: string
          id: string
          last_accessed: string
          personalized_content: Json | null
          quiz_scores: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_module_ids?: string[] | null
          completed_modules?: Json | null
          course_id: string
          created_at?: string
          id?: string
          last_accessed?: string
          personalized_content?: Json | null
          quiz_scores?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_module_ids?: string[] | null
          completed_modules?: Json | null
          course_id?: string
          created_at?: string
          id?: string
          last_accessed?: string
          personalized_content?: Json | null
          quiz_scores?: Json | null
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
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
