-- Fuzzy's Home School - Hooked System Tables
-- Implementación del modelo Hooked de Nir Eyal

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_cron";

-- Tabla de retos diarios (Daily Quests)
CREATE TABLE IF NOT EXISTS public.quests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  prompt TEXT, -- Instrucciones del reto
  payload JSONB NOT NULL, -- Datos específicos del reto (ej: items para DnD)
  type TEXT CHECK (type IN ('drag_drop', 'quiz', 'memory', 'puzzle', 'exploration')) DEFAULT 'drag_drop',
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')) DEFAULT 'medium',
  points INTEGER DEFAULT 100,
  time_limit INTEGER, -- en segundos, null = sin límite
  available_on DATE NOT NULL, -- fecha de disponibilidad
  expires_at TIMESTAMPTZ, -- cuándo expira (opcional)
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de progreso de retos por usuario
CREATE TABLE IF NOT EXISTS public.quest_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  quest_id UUID REFERENCES public.quests(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('started', 'completed', 'abandoned')) DEFAULT 'started',
  score INTEGER DEFAULT 0,
  max_score INTEGER,
  time_spent INTEGER, -- en segundos
  attempts INTEGER DEFAULT 1,
  answers JSONB, -- respuestas del usuario
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  UNIQUE(user_id, quest_id)
);

-- Tabla de rachas (streaks)
CREATE TABLE IF NOT EXISTS public.streaks (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE,
  total_days_active INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de insignias/badges (Open Badges 3.0 compatible)
CREATE TABLE IF NOT EXISTS public.badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL, -- identificador único del badge
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT NOT NULL, -- emoji o URL del icono
  category TEXT, -- 'quest', 'streak', 'achievement', 'special'
  criteria JSONB, -- condiciones para obtenerlo
  points INTEGER DEFAULT 10,
  rarity TEXT CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')) DEFAULT 'common',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de badges obtenidos por usuarios
CREATE TABLE IF NOT EXISTS public.user_badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id UUID REFERENCES public.badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  assertion JSONB, -- datos Open Badges 3.0 para compartir
  UNIQUE(user_id, badge_id)
);

-- Tabla de mensajes/notificaciones sutiles
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  kind TEXT CHECK (kind IN ('quest', 'badge', 'achievement', 'reminder', 'info')) DEFAULT 'quest',
  title TEXT NOT NULL,
  body TEXT,
  cta_url TEXT, -- URL de acción (ej: /quest/123)
  cta_text TEXT DEFAULT 'Ver más',
  seen_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de diario del progreso (Investment)
CREATE TABLE IF NOT EXISTS public.progress_journal (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT, -- markdown o rich text
  type TEXT CHECK (type IN ('reflection', 'achievement', 'goal', 'note')) DEFAULT 'reflection',
  tags TEXT[], -- etiquetas para categorizar
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de personalización de avatar (Investment)
CREATE TABLE IF NOT EXISTS public.avatar_customization (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  avatar_type TEXT CHECK (avatar_type IN ('dicebear', 'upload', 'generated')) DEFAULT 'dicebear',
  dicebear_seed TEXT, -- seed para DiceBear API
  dicebear_style TEXT DEFAULT 'bottts', -- estilo de DiceBear
  custom_avatar_url TEXT, -- URL de avatar personalizado
  accessories JSONB, -- accesorios y personalizaciones
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_quests_available_on ON public.quests(available_on);
CREATE INDEX IF NOT EXISTS idx_quest_progress_user_id ON public.quest_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_quest_progress_quest_id ON public.quest_progress(quest_id);
CREATE INDEX IF NOT EXISTS idx_quest_progress_status ON public.quest_progress(status);
CREATE INDEX IF NOT EXISTS idx_messages_user_id ON public.messages(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_seen_at ON public.messages(seen_at);
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON public.user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_journal_user_id ON public.progress_journal(user_id);

-- RLS (Row Level Security) Policies
ALTER TABLE public.quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quest_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress_journal ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.avatar_customization ENABLE ROW LEVEL SECURITY;

-- Políticas para quests (todos pueden ver, solo admins pueden crear)
CREATE POLICY "Anyone can view active quests" ON public.quests
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage quests" ON public.quests
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Políticas para quest_progress (solo el usuario puede ver sus datos)
CREATE POLICY "Users can view own progress" ON public.quest_progress
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own progress" ON public.quest_progress
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own progress" ON public.quest_progress
  FOR UPDATE USING (user_id = auth.uid());

-- Políticas para streaks (solo el usuario puede ver sus datos)
CREATE POLICY "Users can view own streak" ON public.streaks
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own streak" ON public.streaks
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own streak" ON public.streaks
  FOR UPDATE USING (user_id = auth.uid());

-- Políticas para badges (todos pueden ver, solo el usuario puede obtener)
CREATE POLICY "Anyone can view active badges" ON public.badges
  FOR SELECT USING (is_active = true);

CREATE POLICY "Users can view own badges" ON public.user_badges
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own badges" ON public.user_badges
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Políticas para messages (solo el usuario puede ver sus mensajes)
CREATE POLICY "Users can view own messages" ON public.messages
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update own messages" ON public.messages
  FOR UPDATE USING (user_id = auth.uid());

-- Políticas para progress_journal (solo el usuario puede ver sus entradas)
CREATE POLICY "Users can view own journal" ON public.progress_journal
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own journal" ON public.progress_journal
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own journal" ON public.progress_journal
  FOR UPDATE USING (user_id = auth.uid());

-- Políticas para avatar_customization (solo el usuario puede ver sus datos)
CREATE POLICY "Users can view own avatar" ON public.avatar_customization
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own avatar" ON public.avatar_customization
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own avatar" ON public.avatar_customization
  FOR UPDATE USING (user_id = auth.uid());

-- Insertar badges iniciales
INSERT INTO public.badges (code, name, description, icon, category, points, rarity) VALUES
  ('first_quest', 'Primer Reto', 'Completaste tu primer reto', '🎯', 'quest', 10, 'common'),
  ('streak_3', 'Racha de 3', 'Completaste 3 días seguidos', '🔥', 'streak', 25, 'rare'),
  ('streak_7', 'Semana Completa', '7 días de racha', '⭐', 'streak', 50, 'epic'),
  ('streak_30', 'Mes de Aprendizaje', '30 días de racha', '👑', 'streak', 100, 'legendary'),
  ('perfect_score', 'Puntuación Perfecta', 'Obtuviste la máxima puntuación', '💯', 'achievement', 30, 'rare'),
  ('speed_demon', 'Velocidad', 'Completaste un reto muy rápido', '⚡', 'achievement', 20, 'rare'),
  ('explorer', 'Explorador', 'Descubriste algo nuevo', '🗺️', 'special', 15, 'common')
ON CONFLICT (code) DO NOTHING;

-- Función para actualizar streak automáticamente
CREATE OR REPLACE FUNCTION update_user_streak()
RETURNS TRIGGER AS $$
BEGIN
  -- Solo actualizar si el reto se completó
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    INSERT INTO public.streaks (user_id, current_streak, longest_streak, last_activity_date, total_days_active)
    VALUES (NEW.user_id, 1, 1, CURRENT_DATE, 1)
    ON CONFLICT (user_id) DO UPDATE SET
      current_streak = CASE 
        WHEN streaks.last_activity_date = CURRENT_DATE - INTERVAL '1 day' THEN streaks.current_streak + 1
        WHEN streaks.last_activity_date = CURRENT_DATE THEN streaks.current_streak
        ELSE 1
      END,
      longest_streak = GREATEST(streaks.longest_streak, 
        CASE 
          WHEN streaks.last_activity_date = CURRENT_DATE - INTERVAL '1 day' THEN streaks.current_streak + 1
          WHEN streaks.last_activity_date = CURRENT_DATE THEN streaks.current_streak
          ELSE 1
        END
      ),
      last_activity_date = CURRENT_DATE,
      total_days_active = streaks.total_days_active + 
        CASE 
          WHEN streaks.last_activity_date < CURRENT_DATE THEN 1
          ELSE 0
        END,
      updated_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar streak automáticamente
DROP TRIGGER IF EXISTS trigger_update_streak ON public.quest_progress;
CREATE TRIGGER trigger_update_streak
  AFTER UPDATE ON public.quest_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_user_streak();

-- Función para otorgar badges automáticamente
CREATE OR REPLACE FUNCTION check_and_award_badges()
RETURNS TRIGGER AS $$
DECLARE
  badge_record RECORD;
  user_streak RECORD;
  quest_count INTEGER;
  perfect_scores INTEGER;
BEGIN
  -- Solo procesar si el reto se completó
  IF NEW.status = 'completed' THEN
    
    -- Obtener información del usuario
    SELECT * INTO user_streak FROM public.streaks WHERE user_id = NEW.user_id;
    
    -- Contar retos completados
    SELECT COUNT(*) INTO quest_count 
    FROM public.quest_progress 
    WHERE user_id = NEW.user_id AND status = 'completed';
    
    -- Contar puntuaciones perfectas
    SELECT COUNT(*) INTO perfect_scores
    FROM public.quest_progress 
    WHERE user_id = NEW.user_id AND status = 'completed' AND score = max_score;
    
    -- Verificar y otorgar badges
    FOR badge_record IN 
      SELECT * FROM public.badges 
      WHERE is_active = true 
      AND NOT EXISTS (
        SELECT 1 FROM public.user_badges 
        WHERE user_id = NEW.user_id AND badge_id = badges.id
      )
    LOOP
      -- Lógica para otorgar badges basada en criterios
      IF badge_record.code = 'first_quest' AND quest_count = 1 THEN
        INSERT INTO public.user_badges (user_id, badge_id, earned_at)
        VALUES (NEW.user_id, badge_record.id, NOW());
        
        -- Crear mensaje de notificación
        INSERT INTO public.messages (user_id, kind, title, body, cta_url, cta_text)
        VALUES (NEW.user_id, 'badge', '¡Nuevo Badge!', 
                'Has obtenido: ' || badge_record.name, 
                '/profile/badges', 'Ver Badges');
                
      ELSIF badge_record.code = 'streak_3' AND user_streak.current_streak >= 3 THEN
        INSERT INTO public.user_badges (user_id, badge_id, earned_at)
        VALUES (NEW.user_id, badge_record.id, NOW());
        
      ELSIF badge_record.code = 'streak_7' AND user_streak.current_streak >= 7 THEN
        INSERT INTO public.user_badges (user_id, badge_id, earned_at)
        VALUES (NEW.user_id, badge_record.id, NOW());
        
      ELSIF badge_record.code = 'streak_30' AND user_streak.current_streak >= 30 THEN
        INSERT INTO public.user_badges (user_id, badge_id, earned_at)
        VALUES (NEW.user_id, badge_record.id, NOW());
        
      ELSIF badge_record.code = 'perfect_score' AND NEW.score = NEW.max_score THEN
        INSERT INTO public.user_badges (user_id, badge_id, earned_at)
        VALUES (NEW.user_id, badge_record.id, NOW());
        
      ELSIF badge_record.code = 'speed_demon' AND NEW.time_spent IS NOT NULL AND NEW.time_spent < 60 THEN
        INSERT INTO public.user_badges (user_id, badge_id, earned_at)
        VALUES (NEW.user_id, badge_record.id, NOW());
      END IF;
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para otorgar badges automáticamente
DROP TRIGGER IF EXISTS trigger_award_badges ON public.quest_progress;
CREATE TRIGGER trigger_award_badges
  AFTER UPDATE ON public.quest_progress
  FOR EACH ROW
  EXECUTE FUNCTION check_and_award_badges();
