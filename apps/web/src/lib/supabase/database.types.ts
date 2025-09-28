export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      games: {
        Row: {
          id: string;
          type: string;
          title: string;
          description: string | null;
          subject: string | null;
          level: string | null;
          difficulty: number;
          content: Json;
          points: number;
          time_limit: number | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          type: string;
          title: string;
          description?: string | null;
          subject?: string | null;
          level?: string | null;
          difficulty?: number;
          content: Json;
          points?: number;
          time_limit?: number | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          type?: string;
          title?: string;
          description?: string | null;
          subject?: string | null;
          level?: string | null;
          difficulty?: number;
          content?: Json;
          points?: number;
          time_limit?: number | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      game_sessions: {
        Row: {
          id: string;
          user_id: string;
          game_id: string;
          score: number;
          max_score: number;
          time_spent: number;
          answers: Json | null;
          completed: boolean;
          started_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          game_id: string;
          score?: number;
          max_score: number;
          time_spent: number;
          answers?: Json | null;
          completed?: boolean;
          started_at?: string;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          game_id?: string;
          score?: number;
          max_score?: number;
          time_spent?: number;
          answers?: Json | null;
          completed?: boolean;
          started_at?: string;
          completed_at?: string | null;
        };
      };
      colonial_locations: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          latitude: number;
          longitude: number;
          qr_code: string | null;
          ar_content: Json | null;
          historical_info: Json | null;
          points: number;
          difficulty: string;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          latitude: number;
          longitude: number;
          qr_code?: string | null;
          ar_content?: Json | null;
          historical_info?: Json | null;
          points?: number;
          difficulty?: string;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          latitude?: number;
          longitude?: number;
          qr_code?: string | null;
          ar_content?: Json | null;
          historical_info?: Json | null;
          points?: number;
          difficulty?: string;
          is_active?: boolean;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
