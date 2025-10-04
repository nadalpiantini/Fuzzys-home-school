import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

// Tipos para la integración con IA
export interface AIStudentProfile {
  id: string;
  student_id: string;
  learning_style: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
  strengths: string[];
  weaknesses: string[];
  preferences: string[];
  confidence_score: number;
  created_at: string;
  updated_at: string;
}

export interface AIContentRecommendation {
  id: string;
  student_id: string;
  content_type: 'game' | 'lesson' | 'activity' | 'quiz';
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimated_time: number;
  learning_objectives: string[];
  prerequisites: string[];
  is_used: boolean;
  created_at: string;
}

export interface AIProgressInsight {
  id: string;
  student_id: string;
  subject: string;
  mastery_level: number;
  trend: 'up' | 'down' | 'stable';
  engagement_level: 'high' | 'medium' | 'low';
  recommendations: string[];
  created_at: string;
}

// Servicios de base de datos para IA
export class AIDatabaseService {
  // Guardar perfil de aprendizaje del estudiante
  static async saveStudentProfile(
    profile: Omit<AIStudentProfile, 'id' | 'created_at' | 'updated_at'>,
  ) {
    const { data, error } = await supabase
      .from('ai_student_profiles')
      .upsert({
        ...profile,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving student profile:', error);
      throw error;
    }

    return data;
  }

  // Obtener perfil de aprendizaje del estudiante
  static async getStudentProfile(
    studentId: string,
  ): Promise<AIStudentProfile | null> {
    const { data, error } = await supabase
      .from('ai_student_profiles')
      .select('*')
      .eq('student_id', studentId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // No se encontró el perfil
      }
      console.error('Error getting student profile:', error);
      throw error;
    }

    return data;
  }

  // Guardar recomendación de contenido
  static async saveContentRecommendation(
    recommendation: Omit<AIContentRecommendation, 'id' | 'created_at'>,
  ) {
    const { data, error } = await supabase
      .from('ai_content_recommendations')
      .insert(recommendation)
      .select()
      .single();

    if (error) {
      console.error('Error saving content recommendation:', error);
      throw error;
    }

    return data;
  }

  // Obtener recomendaciones de contenido para un estudiante
  static async getContentRecommendations(
    studentId: string,
    limit = 10,
  ): Promise<AIContentRecommendation[]> {
    const { data, error } = await supabase
      .from('ai_content_recommendations')
      .select('*')
      .eq('student_id', studentId)
      .eq('is_used', false)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error getting content recommendations:', error);
      throw error;
    }

    return data || [];
  }

  // Marcar recomendación como usada
  static async markRecommendationAsUsed(recommendationId: string) {
    const { error } = await supabase
      .from('ai_content_recommendations')
      .update({ is_used: true })
      .eq('id', recommendationId);

    if (error) {
      console.error('Error marking recommendation as used:', error);
      throw error;
    }
  }

  // Guardar insight de progreso
  static async saveProgressInsight(
    insight: Omit<AIProgressInsight, 'id' | 'created_at'>,
  ) {
    const { data, error } = await supabase
      .from('ai_progress_insights')
      .insert(insight)
      .select()
      .single();

    if (error) {
      console.error('Error saving progress insight:', error);
      throw error;
    }

    return data;
  }

  // Obtener insights de progreso para un estudiante
  static async getProgressInsights(
    studentId: string,
    subject?: string,
  ): Promise<AIProgressInsight[]> {
    let query = supabase
      .from('ai_progress_insights')
      .select('*')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false });

    if (subject) {
      query = query.eq('subject', subject);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error getting progress insights:', error);
      throw error;
    }

    return data || [];
  }

  // Obtener estadísticas de uso de IA
  static async getAIUsageStats(studentId: string) {
    const { data, error } = await supabase
      .from('ai_student_profiles')
      .select(
        `
        *,
        ai_content_recommendations(count),
        ai_progress_insights(count)
      `,
      )
      .eq('student_id', studentId)
      .single();

    if (error) {
      console.error('Error getting AI usage stats:', error);
      throw error;
    }

    return data;
  }
}
