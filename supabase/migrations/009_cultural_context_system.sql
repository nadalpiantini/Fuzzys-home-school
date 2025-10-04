-- Cultural Context System - Migration
-- Objetivo: Sistema configurable para diferentes contextos culturales y países
-- Permite escalabilidad global manteniendo relevancia local

-- Tabla de contextos culturales
CREATE TABLE IF NOT EXISTS public.cultural_contexts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code TEXT NOT NULL, -- ISO 3166-1 alpha-2 (DO, US, MX, etc.)
  country_name TEXT NOT NULL,
  language_code TEXT NOT NULL, -- ISO 639-1 (es, en, fr, etc.)
  region TEXT, -- Norte, Sur, Caribe, etc.
  cultural_elements JSONB NOT NULL DEFAULT '{}', -- Elementos culturales específicos
  educational_context JSONB NOT NULL DEFAULT '{}', -- Contexto educativo
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(country_code, language_code)
);

-- Tabla de elementos culturales por contexto
CREATE TABLE IF NOT EXISTS public.cultural_elements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  context_id UUID NOT NULL REFERENCES public.cultural_contexts(id) ON DELETE CASCADE,
  category TEXT NOT NULL, -- 'food', 'places', 'traditions', 'sports', 'music', etc.
  elements JSONB NOT NULL DEFAULT '[]', -- Array de elementos culturales
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de preferencias culturales de usuario
CREATE TABLE IF NOT EXISTS public.user_cultural_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  preferred_context_id UUID REFERENCES public.cultural_contexts(id),
  auto_detect BOOLEAN DEFAULT true, -- Auto-detectar contexto
  manual_override BOOLEAN DEFAULT false, -- Usuario eligió manualmente
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Función para obtener contexto cultural por país
CREATE OR REPLACE FUNCTION get_cultural_context(p_country_code TEXT DEFAULT 'DO')
RETURNS cultural_contexts AS $$
DECLARE
  context_record cultural_contexts;
BEGIN
  -- Buscar contexto específico del país
  SELECT * INTO context_record 
  FROM cultural_contexts 
  WHERE country_code = p_country_code 
    AND is_active = true
  LIMIT 1;
  
  -- Si no se encuentra, usar contexto por defecto
  IF NOT FOUND THEN
    SELECT * INTO context_record 
    FROM cultural_contexts 
    WHERE is_default = true 
      AND is_active = true
    LIMIT 1;
  END IF;
  
  RETURN context_record;
END;
$$ LANGUAGE plpgsql;

-- Función para obtener elementos culturales
CREATE OR REPLACE FUNCTION get_cultural_elements(p_context_id UUID, p_category TEXT DEFAULT NULL)
RETURNS TABLE (
  category TEXT,
  elements JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ce.category,
    ce.elements
  FROM cultural_elements ce
  WHERE ce.context_id = p_context_id
    AND (p_category IS NULL OR ce.category = p_category)
  ORDER BY ce.category;
END;
$$ LANGUAGE plpgsql;

-- Función para generar prompt cultural
CREATE OR REPLACE FUNCTION generate_cultural_prompt(
  p_context_id UUID,
  p_subject TEXT,
  p_grade TEXT
)
RETURNS TEXT AS $$
DECLARE
  context_record cultural_contexts;
  cultural_prompt TEXT;
BEGIN
  -- Obtener contexto cultural
  SELECT * INTO context_record FROM cultural_contexts WHERE id = p_context_id;
  
  IF NOT FOUND THEN
    RETURN 'Genera un juego educativo apropiado para la edad escolar.';
  END IF;
  
  -- Construir prompt cultural
  cultural_prompt := format(
    'Genera un juego educativo para niños de %s en %s (%s). ' ||
    'Debe ser apropiado para la edad escolar, con temas culturales de %s. ' ||
    'Incluye elementos como: %s. ' ||
    'Contexto educativo: %s',
    p_grade,
    context_record.country_name,
    context_record.country_code,
    context_record.country_name,
    COALESCE(context_record.cultural_elements->>'food', 'comida local'),
    COALESCE(context_record.educational_context->>'curriculum', 'currículo estándar')
  );
  
  RETURN cultural_prompt;
END;
$$ LANGUAGE plpgsql;

-- Insertar contextos culturales iniciales
INSERT INTO public.cultural_contexts (country_code, country_name, language_code, cultural_elements, educational_context, is_default) VALUES
-- República Dominicana (contexto por defecto)
('DO', 'República Dominicana', 'es', 
 '{"food": ["colmado", "sancocho", "mangú", "tostones", "habichuelas"], "places": ["Zona Colonial", "Malecón", "Playa Bávaro", "Santiago", "La Vega"], "traditions": ["Carnaval", "Semana Santa", "Día de la Independencia"], "sports": ["béisbol", "basketball", "voleibol"], "music": ["merengue", "bachata", "reggaeton"], "currency": "peso dominicano", "capital": "Santo Domingo"}',
 '{"curriculum": "Currículo dominicano", "subjects": ["matemáticas", "lengua española", "ciencias", "estudios sociales", "geografía"], "grade_system": "K-12", "special_days": ["Día de la Independencia", "Día de la Bandera"]}',
 true),

-- Estados Unidos
('US', 'Estados Unidos', 'en',
 '{"food": ["hamburgers", "pizza", "hot dogs", "apple pie", "BBQ"], "places": ["New York", "Los Angeles", "Chicago", "Miami", "Seattle"], "traditions": ["Thanksgiving", "Halloween", "Independence Day", "Christmas"], "sports": ["football", "basketball", "baseball", "soccer"], "music": ["rock", "pop", "country", "hip-hop"], "currency": "US dollar", "capital": "Washington DC"}',
 '{"curriculum": "Common Core", "subjects": ["math", "english", "science", "social studies", "art"], "grade_system": "K-12", "special_days": ["Independence Day", "Thanksgiving", "Memorial Day"]}',
 false),

-- México
('MX', 'México', 'es',
 '{"food": ["tacos", "burritos", "quesadillas", "tamales", "pozole"], "places": ["Ciudad de México", "Cancún", "Guadalajara", "Tijuana", "Puebla"], "traditions": ["Día de los Muertos", "Cinco de Mayo", "Día de la Independencia"], "sports": ["fútbol", "boxing", "wrestling"], "music": ["mariachi", "ranchera", "corridos"], "currency": "peso mexicano", "capital": "Ciudad de México"}',
 '{"curriculum": "SEP", "subjects": ["matemáticas", "español", "ciencias", "historia", "geografía"], "grade_system": "K-12", "special_days": ["Día de la Independencia", "Día de los Muertos"]}',
 false),

-- España
('ES', 'España', 'es',
 '{"food": ["paella", "tortilla española", "jamón", "gazpacho", "churros"], "places": ["Madrid", "Barcelona", "Sevilla", "Valencia", "Bilbao"], "traditions": ["Feria de Abril", "San Fermín", "Fallas", "Semana Santa"], "sports": ["fútbol", "tennis", "basketball"], "music": ["flamenco", "pop español", "rock"], "currency": "euro", "capital": "Madrid"}',
 '{"curriculum": "LOMLOE", "subjects": ["matemáticas", "lengua castellana", "ciencias", "historia", "geografía"], "grade_system": "Infantil-Primaria-Secundaria", "special_days": ["Día de la Constitución", "Día de la Hispanidad"]}',
 false),

-- Contexto global neutro
('GLOBAL', 'Global', 'en',
 '{"food": ["pizza", "sandwiches", "salad", "fruit", "vegetables"], "places": ["school", "library", "park", "museum", "home"], "traditions": ["birthdays", "holidays", "graduation"], "sports": ["soccer", "basketball", "swimming", "running"], "music": ["children songs", "classical", "pop"], "currency": "local currency", "capital": "capital city"}',
 '{"curriculum": "International", "subjects": ["math", "language", "science", "social studies", "art"], "grade_system": "K-12", "special_days": ["New Year", "graduation"]}',
 false);

-- Insertar elementos culturales para República Dominicana
INSERT INTO public.cultural_elements (context_id, category, elements) 
SELECT 
  cc.id,
  'food',
  '["colmado", "sancocho", "mangú", "tostones", "habichuelas", "arroz con pollo", "la bandera"]'::jsonb
FROM cultural_contexts cc WHERE cc.country_code = 'DO';

INSERT INTO public.cultural_elements (context_id, category, elements) 
SELECT 
  cc.id,
  'places',
  '["Zona Colonial", "Malecón", "Playa Bávaro", "Santiago", "La Vega", "Puerto Plata", "Samaná"]'::jsonb
FROM cultural_contexts cc WHERE cc.country_code = 'DO';

INSERT INTO public.cultural_elements (context_id, category, elements) 
SELECT 
  cc.id,
  'traditions',
  '["Carnaval", "Semana Santa", "Día de la Independencia", "Día de la Bandera", "Navidad"]'::jsonb
FROM cultural_contexts cc WHERE cc.country_code = 'DO';

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_cultural_contexts_country ON public.cultural_contexts(country_code);
CREATE INDEX IF NOT EXISTS idx_cultural_contexts_language ON public.cultural_contexts(language_code);
CREATE INDEX IF NOT EXISTS idx_cultural_contexts_active ON public.cultural_contexts(is_active);
CREATE INDEX IF NOT EXISTS idx_cultural_elements_context ON public.cultural_elements(context_id);
CREATE INDEX IF NOT EXISTS idx_cultural_elements_category ON public.cultural_elements(category);
CREATE INDEX IF NOT EXISTS idx_user_cultural_preferences_user ON public.user_cultural_preferences(user_id);

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_cultural_contexts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
DROP TRIGGER IF EXISTS trg_cultural_contexts_u ON public.cultural_contexts;
CREATE TRIGGER trg_cultural_contexts_u 
  BEFORE UPDATE ON public.cultural_contexts
  FOR EACH ROW EXECUTE FUNCTION update_cultural_contexts_updated_at();

DROP TRIGGER IF EXISTS trg_user_cultural_preferences_u ON public.user_cultural_preferences;
CREATE TRIGGER trg_user_cultural_preferences_u 
  BEFORE UPDATE ON public.user_cultural_preferences
  FOR EACH ROW EXECUTE FUNCTION update_cultural_contexts_updated_at();

-- RLS Policies
ALTER TABLE public.cultural_contexts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cultural_elements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_cultural_preferences ENABLE ROW LEVEL SECURITY;

-- Políticas de acceso
CREATE POLICY cultural_contexts_read_all ON public.cultural_contexts
  FOR SELECT USING (true);

CREATE POLICY cultural_elements_read_all ON public.cultural_elements
  FOR SELECT USING (true);

CREATE POLICY user_cultural_preferences_user_access ON public.user_cultural_preferences
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY cultural_contexts_service_access ON public.cultural_contexts
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY cultural_elements_service_access ON public.cultural_elements
  FOR ALL USING (auth.role() = 'service_role');
