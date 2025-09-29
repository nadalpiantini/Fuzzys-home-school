import { getSupabaseServer } from '@/lib/supabase/server';

export interface CulturalContext {
  id: string;
  country_code: string;
  country_name: string;
  language_code: string;
  region?: string;
  cultural_elements: Record<string, any>;
  educational_context: Record<string, any>;
  is_default: boolean;
  is_active: boolean;
}

export interface CulturalElement {
  category: string;
  elements: any[];
}

export interface UserCulturalPreferences {
  id: string;
  user_id: string;
  preferred_context_id: string;
  auto_detect: boolean;
  manual_override: boolean;
}

export class CulturalContextService {
  private static instance: CulturalContextService;
  private cache: Map<string, CulturalContext> = new Map();
  private userPreferences: Map<string, UserCulturalPreferences> = new Map();

  static getInstance(): CulturalContextService {
    if (!CulturalContextService.instance) {
      CulturalContextService.instance = new CulturalContextService();
    }
    return CulturalContextService.instance;
  }

  /**
   * Detecta el contexto cultural basado en la ubicación del usuario
   */
  async detectCulturalContext(userLocation?: {
    country?: string;
    region?: string;
    language?: string;
  }): Promise<CulturalContext> {
    try {
      // Si tenemos ubicación del usuario, usarla
      if (userLocation?.country) {
        const context = await this.getContextByCountry(userLocation.country);
        if (context) return context;
      }

      // Detectar por IP (fallback)
      const ipContext = await this.detectByIP();
      if (ipContext) return ipContext;

      // Usar contexto por defecto
      return await this.getDefaultContext();
    } catch (error) {
      console.error('Error detecting cultural context:', error);
      return await this.getDefaultContext();
    }
  }

  /**
   * Obtiene contexto por código de país
   */
  async getContextByCountry(
    countryCode: string,
  ): Promise<CulturalContext | null> {
    try {
      const supabase = getSupabaseServer(true); // useServiceRole = true
      const { data, error } = await supabase
        .from('cultural_contexts')
        .select('*')
        .eq('country_code', countryCode.toUpperCase())
        .eq('is_active', true)
        .single();

      if (error) {
        console.error('Error fetching context by country:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error getting context by country:', error);
      return null;
    }
  }

  /**
   * Detecta contexto por IP (usando servicio externo)
   */
  private async detectByIP(): Promise<CulturalContext | null> {
    try {
      // Usar servicio de geolocalización
      const response = await fetch('https://ipapi.co/json/');
      const locationData = await response.json();

      if (locationData.country_code) {
        return await this.getContextByCountry(locationData.country_code);
      }

      return null;
    } catch (error) {
      console.error('Error detecting by IP:', error);
      return null;
    }
  }

  /**
   * Obtiene contexto por defecto
   */
  async getDefaultContext(): Promise<CulturalContext> {
    const supabase = getSupabaseServer(true); // useServiceRole = true

    try {
      const supabase = getSupabaseServer();
      const { data, error } = await supabase
        .from('cultural_contexts')
        .select('*')
        .eq('is_default', true)
        .eq('is_active', true)
        .single();

      if (error) {
        console.error('Error fetching default context:', error);
        throw new Error('No default cultural context found');
      }

      return data;
    } catch (error) {
      console.error('Error getting default context:', error);
      throw error;
    }
  }

  /**
   * Obtiene preferencias culturales del usuario
   */
  async getUserCulturalPreferences(
    userId: string,
  ): Promise<UserCulturalPreferences | null> {
    try {
      // Verificar cache primero
      if (this.userPreferences.has(userId)) {
        return this.userPreferences.get(userId)!;
      }

      const supabase = getSupabaseServer(true); // useServiceRole = true
      const { data, error } = await supabase
        .from('user_cultural_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user cultural preferences:', error);
        return null;
      }

      if (data) {
        this.userPreferences.set(userId, data);
        return data;
      }

      return null;
    } catch (error) {
      console.error('Error getting user cultural preferences:', error);
      return null;
    }
  }

  /**
   * Actualiza preferencias culturales del usuario
   */
  async updateUserCulturalPreferences(
    userId: string,
    contextId: string,
    autoDetect: boolean = true,
    manualOverride: boolean = false,
  ): Promise<boolean> {
    try {
      const supabase = getSupabaseServer();
      const { data, error } = await supabase
        .from('user_cultural_preferences')
        .upsert({
          user_id: userId,
          preferred_context_id: contextId,
          auto_detect: autoDetect,
          manual_override: manualOverride,
        })
        .select()
        .single();

      if (error) {
        console.error('Error updating user cultural preferences:', error);
        return false;
      }

      // Actualizar cache
      this.userPreferences.set(userId, data);
      return true;
    } catch (error) {
      console.error('Error updating user cultural preferences:', error);
      return false;
    }
  }

  /**
   * Obtiene elementos culturales para un contexto
   */
  async getCulturalElements(
    contextId: string,
    category?: string,
  ): Promise<CulturalElement[]> {
    try {
      const supabase = getSupabaseServer();
      const { data, error } = await supabase
        .from('cultural_elements')
        .select('category, elements')
        .eq('context_id', contextId);

      if (category) {
        data?.filter((element: any) => element.category === category);
      }

      if (error) {
        console.error('Error fetching cultural elements:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error getting cultural elements:', error);
      return [];
    }
  }

  /**
   * Genera prompt cultural para DeepSeek
   */
  async generateCulturalPrompt(
    contextId: string,
    subject: string,
    grade: string,
  ): Promise<string> {
    try {
      const supabase = getSupabaseServer();
      const { data, error } = await supabase.rpc(
        'generate_cultural_prompt',
        {
          p_context_id: contextId,
          p_subject: subject,
          p_grade: grade,
        },
      );

      if (error) {
        console.error('Error generating cultural prompt:', error);
        return 'Genera un juego educativo apropiado para la edad escolar.';
      }

      return (
        data || 'Genera un juego educativo apropiado para la edad escolar.'
      );
    } catch (error) {
      console.error('Error generating cultural prompt:', error);
      return 'Genera un juego educativo apropiado para la edad escolar.';
    }
  }

  /**
   * Obtiene contexto cultural para un usuario
   */
  async getContextForUser(userId: string): Promise<CulturalContext> {
    try {
      // Obtener preferencias del usuario
      const preferences = await this.getUserCulturalPreferences(userId);

      if (
        preferences &&
        !preferences.auto_detect &&
        preferences.preferred_context_id
      ) {
        // Usuario eligió contexto específico
        const supabase = getSupabaseServer();
      const { data, error } = await supabase
          .from('cultural_contexts')
          .select('*')
          .eq('id', preferences.preferred_context_id)
          .single();

        if (data) return data;
      }

      if (preferences && preferences.auto_detect) {
        // Auto-detectar contexto
        return await this.detectCulturalContext();
      }

      // Fallback a contexto por defecto
      return await this.getDefaultContext();
    } catch (error) {
      console.error('Error getting context for user:', error);
      return await this.getDefaultContext();
    }
  }

  /**
   * Obtiene todos los contextos culturales disponibles
   */
  async getAllContexts(): Promise<CulturalContext[]> {
    try {
      const supabase = getSupabaseServer();
      const { data, error } = await supabase
        .from('cultural_contexts')
        .select('*')
        .eq('is_active', true)
        .order('is_default', { ascending: false })
        .order('country_name');

      if (error) {
        console.error('Error fetching all contexts:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error getting all contexts:', error);
      return [];
    }
  }

  /**
   * Limpia cache
   */
  clearCache(): void {
    this.cache.clear();
    this.userPreferences.clear();
  }
}

export const culturalContextService = CulturalContextService.getInstance();
