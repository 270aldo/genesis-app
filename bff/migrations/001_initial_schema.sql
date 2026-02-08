-- ============================================================================
-- GENESIS App — Initial Schema Migration
-- Run this in Supabase Dashboard > SQL Editor
-- ============================================================================
-- Creates all 15 tables, RLS policies, indexes, and seed data.
-- Tables derived from types/supabase.ts
-- ============================================================================

-- ============================================================================
-- 1. profiles
-- ============================================================================
CREATE TABLE IF NOT EXISTS profiles (
    id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name   TEXT,
    age         INTEGER,
    weight_kg   NUMERIC(5,1),
    height_cm   NUMERIC(5,1),
    goal        TEXT CHECK (goal IN ('strength', 'endurance', 'aesthetics', 'longevity')),
    experience_level TEXT CHECK (experience_level IN ('beginner', 'intermediate', 'advanced')),
    timezone    TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own profile"  ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- ============================================================================
-- 2. coach_assignments
-- ============================================================================
CREATE TABLE IF NOT EXISTS coach_assignments (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coach_id    UUID NOT NULL REFERENCES auth.users(id),
    user_id     UUID NOT NULL REFERENCES auth.users(id),
    status      TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'ended')),
    mode        TEXT NOT NULL DEFAULT 'hybrid' CHECK (mode IN ('hybrid', 'ascend')),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_coach_assignments_user_id ON coach_assignments(user_id);
CREATE INDEX idx_coach_assignments_coach_id ON coach_assignments(coach_id);

ALTER TABLE coach_assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own assignments" ON coach_assignments FOR SELECT USING (auth.uid() = user_id OR auth.uid() = coach_id);
CREATE POLICY "Users update own assignments" ON coach_assignments FOR UPDATE USING (auth.uid() = user_id OR auth.uid() = coach_id);

-- ============================================================================
-- 3. seasons
-- ============================================================================
CREATE TABLE IF NOT EXISTS seasons (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name        TEXT NOT NULL,
    goal        TEXT NOT NULL CHECK (goal IN ('build', 'cut', 'maintain', 'peak')),
    start_date  DATE NOT NULL,
    end_date    DATE NOT NULL,
    status      TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'active', 'completed')),
    created_by  TEXT NOT NULL DEFAULT 'ai' CHECK (created_by IN ('coach', 'ai', 'hybrid')),
    notes       TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_seasons_user_id ON seasons(user_id);

ALTER TABLE seasons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own seasons"  ON seasons FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own seasons" ON seasons FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own seasons" ON seasons FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================================
-- 4. phases
-- ============================================================================
CREATE TABLE IF NOT EXISTS phases (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    season_id   UUID NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,
    name        TEXT NOT NULL,
    focus       TEXT NOT NULL CHECK (focus IN ('hypertrophy', 'strength', 'power', 'endurance', 'deload')),
    order_index INTEGER NOT NULL,
    start_date  DATE NOT NULL,
    end_date    DATE NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_phases_season_id ON phases(season_id);

ALTER TABLE phases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own phases" ON phases FOR SELECT
    USING (EXISTS (SELECT 1 FROM seasons WHERE seasons.id = phases.season_id AND seasons.user_id = auth.uid()));
CREATE POLICY "Users insert own phases" ON phases FOR INSERT
    WITH CHECK (EXISTS (SELECT 1 FROM seasons WHERE seasons.id = phases.season_id AND seasons.user_id = auth.uid()));
CREATE POLICY "Users update own phases" ON phases FOR UPDATE
    USING (EXISTS (SELECT 1 FROM seasons WHERE seasons.id = phases.season_id AND seasons.user_id = auth.uid()));

-- ============================================================================
-- 5. weeks
-- ============================================================================
CREATE TABLE IF NOT EXISTS weeks (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phase_id    UUID NOT NULL REFERENCES phases(id) ON DELETE CASCADE,
    week_number INTEGER NOT NULL,
    focus       TEXT NOT NULL,
    deload      BOOLEAN NOT NULL DEFAULT false,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_weeks_phase_id ON weeks(phase_id);

ALTER TABLE weeks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own weeks" ON weeks FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM phases
        JOIN seasons ON seasons.id = phases.season_id
        WHERE phases.id = weeks.phase_id AND seasons.user_id = auth.uid()
    ));
CREATE POLICY "Users insert own weeks" ON weeks FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM phases
        JOIN seasons ON seasons.id = phases.season_id
        WHERE phases.id = weeks.phase_id AND seasons.user_id = auth.uid()
    ));

-- ============================================================================
-- 6. sessions
-- ============================================================================
CREATE TABLE IF NOT EXISTS sessions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    week_id         UUID NOT NULL REFERENCES weeks(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type            TEXT NOT NULL CHECK (type IN ('strength', 'cardio', 'mobility', 'recovery')),
    scheduled_date  DATE NOT NULL,
    completed_at    TIMESTAMPTZ,
    source          TEXT NOT NULL DEFAULT 'ai' CHECK (source IN ('ai', 'coach', 'user')),
    rating          INTEGER CHECK (rating BETWEEN 1 AND 10),
    notes           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_user_date ON sessions(user_id, scheduled_date);
CREATE INDEX idx_sessions_week_id ON sessions(week_id);

ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own sessions"  ON sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own sessions" ON sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own sessions" ON sessions FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================================
-- 7. exercises (public catalog — readable by all authenticated users)
-- ============================================================================
CREATE TABLE IF NOT EXISTS exercises (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        TEXT NOT NULL,
    category    TEXT NOT NULL CHECK (category IN ('compound', 'isolation', 'cardio', 'mobility', 'plyometric')),
    muscle_groups TEXT[] NOT NULL DEFAULT '{}',
    equipment   TEXT[] NOT NULL DEFAULT '{}',
    difficulty  TEXT NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    video_url   TEXT,
    instructions TEXT NOT NULL DEFAULT '',
    cues        TEXT[] NOT NULL DEFAULT '{}',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users read exercises" ON exercises FOR SELECT
    USING (auth.role() = 'authenticated');

-- ============================================================================
-- 8. exercise_logs
-- ============================================================================
CREATE TABLE IF NOT EXISTS exercise_logs (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id  UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    exercise_id UUID NOT NULL REFERENCES exercises(id),
    sets        JSONB NOT NULL DEFAULT '[]',
    rpe         INTEGER NOT NULL DEFAULT 0 CHECK (rpe BETWEEN 0 AND 10),
    notes       TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_exercise_logs_session_id ON exercise_logs(session_id);
CREATE INDEX idx_exercise_logs_exercise_id ON exercise_logs(exercise_id);

ALTER TABLE exercise_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own exercise_logs" ON exercise_logs FOR SELECT
    USING (EXISTS (SELECT 1 FROM sessions WHERE sessions.id = exercise_logs.session_id AND sessions.user_id = auth.uid()));
CREATE POLICY "Users insert own exercise_logs" ON exercise_logs FOR INSERT
    WITH CHECK (EXISTS (SELECT 1 FROM sessions WHERE sessions.id = exercise_logs.session_id AND sessions.user_id = auth.uid()));
CREATE POLICY "Users update own exercise_logs" ON exercise_logs FOR UPDATE
    USING (EXISTS (SELECT 1 FROM sessions WHERE sessions.id = exercise_logs.session_id AND sessions.user_id = auth.uid()));

-- ============================================================================
-- 9. conversations
-- ============================================================================
CREATE TABLE IF NOT EXISTS conversations (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    agent_id        TEXT NOT NULL CHECK (agent_id IN ('genesis', 'train', 'fuel', 'mind', 'track', 'vision', 'coach_bridge')),
    messages        JSONB NOT NULL DEFAULT '[]',
    session_context JSONB,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_conversations_user_id ON conversations(user_id);
CREATE INDEX idx_conversations_user_agent ON conversations(user_id, agent_id);

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own conversations"  ON conversations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own conversations" ON conversations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own conversations" ON conversations FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================================
-- 10. check_ins
-- ============================================================================
CREATE TABLE IF NOT EXISTS check_ins (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date              DATE NOT NULL,
    sleep_hours       NUMERIC(3,1) NOT NULL,
    sleep_quality     INTEGER NOT NULL CHECK (sleep_quality BETWEEN 1 AND 5),
    energy            INTEGER NOT NULL CHECK (energy BETWEEN 1 AND 5),
    mood              INTEGER NOT NULL CHECK (mood BETWEEN 1 AND 5),
    stress            INTEGER NOT NULL CHECK (stress BETWEEN 1 AND 5),
    soreness          INTEGER NOT NULL CHECK (soreness BETWEEN 1 AND 5),
    nutrition_quality INTEGER CHECK (nutrition_quality BETWEEN 1 AND 5),
    hydration         INTEGER CHECK (hydration BETWEEN 1 AND 5),
    notes             TEXT,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id, date)
);

CREATE INDEX idx_check_ins_user_id ON check_ins(user_id);
CREATE INDEX idx_check_ins_user_date ON check_ins(user_id, date);

ALTER TABLE check_ins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own check_ins"  ON check_ins FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own check_ins" ON check_ins FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own check_ins" ON check_ins FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================================
-- 11. meals
-- ============================================================================
CREATE TABLE IF NOT EXISTS meals (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date         DATE NOT NULL,
    meal_type    TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
    food_items   JSONB NOT NULL DEFAULT '[]',
    total_macros JSONB NOT NULL DEFAULT '{}',
    logged_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_meals_user_id ON meals(user_id);
CREATE INDEX idx_meals_user_date ON meals(user_id, date);

ALTER TABLE meals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own meals"  ON meals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own meals" ON meals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own meals" ON meals FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================================
-- 12. widget_states
-- ============================================================================
CREATE TABLE IF NOT EXISTS widget_states (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    widget_type TEXT NOT NULL,
    widget_data JSONB NOT NULL DEFAULT '{}',
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_widget_states_user_id ON widget_states(user_id);

ALTER TABLE widget_states ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own widget_states"  ON widget_states FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own widget_states" ON widget_states FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own widget_states" ON widget_states FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================================
-- 13. biomarkers
-- ============================================================================
CREATE TABLE IF NOT EXISTS biomarkers (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date       DATE NOT NULL,
    type       TEXT NOT NULL CHECK (type IN ('weight', 'body_fat', 'hrv', 'resting_hr', 'blood_pressure', 'vo2max')),
    value      NUMERIC(10,2) NOT NULL,
    unit       TEXT NOT NULL,
    source     TEXT NOT NULL DEFAULT 'manual' CHECK (source IN ('manual', 'wearable')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_biomarkers_user_id ON biomarkers(user_id);
CREATE INDEX idx_biomarkers_user_date ON biomarkers(user_id, date);

ALTER TABLE biomarkers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own biomarkers"  ON biomarkers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own biomarkers" ON biomarkers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own biomarkers" ON biomarkers FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================================
-- 14. personal_records
-- ============================================================================
CREATE TABLE IF NOT EXISTS personal_records (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    exercise_id     UUID NOT NULL REFERENCES exercises(id),
    type            TEXT NOT NULL CHECK (type IN ('weight', 'reps', 'time', 'distance')),
    value           NUMERIC(10,2) NOT NULL,
    achieved_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    session_id      UUID REFERENCES sessions(id),
    previous_value  NUMERIC(10,2)
);

CREATE INDEX idx_personal_records_user_id ON personal_records(user_id);
CREATE INDEX idx_personal_records_user_exercise ON personal_records(user_id, exercise_id);

ALTER TABLE personal_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own personal_records"  ON personal_records FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own personal_records" ON personal_records FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own personal_records" ON personal_records FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================================
-- 15. notification_settings
-- ============================================================================
CREATE TABLE IF NOT EXISTS notification_settings (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    channel           TEXT NOT NULL CHECK (channel IN ('push', 'email', 'sms')),
    category          TEXT NOT NULL CHECK (category IN ('training', 'nutrition', 'check_in', 'coach', 'system')),
    enabled           BOOLEAN NOT NULL DEFAULT true,
    quiet_hours_start TIME,
    quiet_hours_end   TIME,
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id, channel, category)
);

CREATE INDEX idx_notification_settings_user_id ON notification_settings(user_id);

ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own notification_settings"  ON notification_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own notification_settings" ON notification_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own notification_settings" ON notification_settings FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================================
-- updated_at trigger function
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_coach_assignments_updated_at BEFORE UPDATE ON coach_assignments FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_seasons_updated_at BEFORE UPDATE ON seasons FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_conversations_updated_at BEFORE UPDATE ON conversations FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_widget_states_updated_at BEFORE UPDATE ON widget_states FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_notification_settings_updated_at BEFORE UPDATE ON notification_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- Seed: 16 exercises from MOCK_EXERCISE_LIBRARY
-- ============================================================================
INSERT INTO exercises (id, name, category, muscle_groups, equipment, difficulty, video_url, instructions, cues) VALUES
(gen_random_uuid(), 'Bench Press', 'compound', ARRAY['chest', 'triceps', 'front delts'], ARRAY['barbell'], 'intermediate', NULL,
 'Press de banca con barra. Movimiento fundamental para desarrollo de pecho.',
 ARRAY['Retrae escápulas antes de bajar', 'Baja la barra al pecho medio', 'Empuja en arco hacia atrás', 'No bloquees codos completamente arriba']),

(gen_random_uuid(), 'Dumbbell Bench Press', 'compound', ARRAY['chest', 'triceps', 'front delts'], ARRAY['dumbbell'], 'beginner', NULL,
 'Press de banca con mancuernas. Mayor rango de movimiento que barra.',
 ARRAY['Mayor rango de movimiento que barra', 'Baja hasta sentir estiramiento en pecho', 'Mantén muñecas neutras']),

(gen_random_uuid(), 'Incline Bench Press', 'compound', ARRAY['chest', 'front delts', 'triceps'], ARRAY['barbell'], 'intermediate', NULL,
 'Press inclinado con barra. Enfocado en pecho superior.',
 ARRAY['Banco a 30-45 grados', 'Baja al pecho superior', 'Enfócate en la contracción del pecho superior']),

(gen_random_uuid(), 'Incline DB Press', 'compound', ARRAY['chest', 'front delts'], ARRAY['dumbbell'], 'beginner', NULL,
 'Press inclinado con mancuernas. Ideal para hipertrofia de pecho superior.',
 ARRAY['30 grados de inclinación', 'Baja controlado 3 segundos', 'Junta las mancuernas arriba sin chocarlas']),

(gen_random_uuid(), 'Cable Flyes', 'isolation', ARRAY['chest', 'front delts'], ARRAY['cable'], 'beginner', NULL,
 'Aperturas en polea. Excelente para tensión constante en pecho.',
 ARRAY['Ligera flexión de codos constante', 'Siente el estiramiento al abrir', 'Aprieta al centro como abrazando']),

(gen_random_uuid(), 'Back Squat', 'compound', ARRAY['legs', 'glutes', 'core'], ARRAY['barbell'], 'intermediate', NULL,
 'Sentadilla con barra. El rey de los ejercicios de pierna.',
 ARRAY['Pies al ancho de hombros', 'Baja hasta que cadera pase rodilla', 'Empuja con talones', 'Mantén pecho arriba y core tenso']),

(gen_random_uuid(), 'Conventional Deadlift', 'compound', ARRAY['back', 'hamstrings', 'glutes', 'core'], ARRAY['barbell'], 'advanced', NULL,
 'Peso muerto convencional. Movimiento de cadena posterior completa.',
 ARRAY['Barra pegada al cuerpo siempre', 'Empuja el piso con los pies', 'Bloquea cadera y rodilla al mismo tiempo', 'Espalda neutra — nunca redondear']),

(gen_random_uuid(), 'Romanian Deadlift', 'compound', ARRAY['legs', 'hamstrings', 'glutes', 'lower back'], ARRAY['barbell'], 'intermediate', NULL,
 'Peso muerto rumano. Enfocado en isquiotibiales y glúteos.',
 ARRAY['Rodillas semi-flexionadas fijas', 'Baja deslizando barra por los muslos', 'Siente estiramiento en isquios', 'No bajes más allá de media espinilla']),

(gen_random_uuid(), 'Overhead Press', 'compound', ARRAY['shoulders', 'triceps', 'core'], ARRAY['barbell'], 'intermediate', NULL,
 'Press militar. Desarrollo de fuerza de hombros.',
 ARRAY['Empieza desde clavícula', 'Empuja recto hacia arriba', 'Mete la cabeza al pasar la barra', 'Core apretado — no arquees espalda']),

(gen_random_uuid(), 'Lateral Raises', 'isolation', ARRAY['shoulders', 'traps'], ARRAY['dumbbell'], 'beginner', NULL,
 'Elevaciones laterales. Para deltoides laterales y ancho de hombros.',
 ARRAY['Sube hasta paralelo al piso', 'Ligera inclinación hacia adelante', 'Codos ligeramente flexionados', 'Controla la bajada — no dejes caer']),

(gen_random_uuid(), 'Barbell Row', 'compound', ARRAY['back', 'biceps', 'rear delts'], ARRAY['barbell'], 'intermediate', NULL,
 'Remo con barra. Movimiento fundamental para espalda.',
 ARRAY['Torso a 45 grados', 'Jala hacia el ombligo', 'Aprieta escápulas arriba 1 segundo', 'No uses momentum del torso']),

(gen_random_uuid(), 'Pull-ups', 'compound', ARRAY['back', 'biceps', 'core'], ARRAY['bodyweight'], 'intermediate', NULL,
 'Dominadas. El mejor ejercicio de peso corporal para espalda.',
 ARRAY['Agarre prono al ancho de hombros', 'Jala codos hacia la cadera', 'Sube hasta mentón sobre barra', 'Baja controlado — extensión completa']),

(gen_random_uuid(), 'Lat Pulldown', 'compound', ARRAY['back', 'biceps'], ARRAY['cable'], 'beginner', NULL,
 'Jalón al pecho. Alternativa a dominadas para desarrollo de dorsales.',
 ARRAY['Inclina torso ligeramente atrás', 'Jala al pecho superior', 'Aprieta escápulas abajo y atrás', 'Extensión completa arriba']),

(gen_random_uuid(), 'Leg Press', 'compound', ARRAY['legs', 'glutes'], ARRAY['machine'], 'beginner', NULL,
 'Prensa de piernas. Alternativa segura a sentadilla.',
 ARRAY['Pies al ancho de hombros en la plataforma', 'Baja hasta 90 grados de rodilla', 'No bloquees rodillas arriba', 'Mantén espalda baja pegada al respaldo']),

(gen_random_uuid(), 'Barbell Curl', 'isolation', ARRAY['arms', 'forearms'], ARRAY['barbell'], 'beginner', NULL,
 'Curl con barra. Ejercicio clásico para bíceps.',
 ARRAY['Codos pegados al cuerpo', 'Sube sin balancear el torso', 'Aprieta bíceps arriba 1 segundo', 'Baja controlado']),

(gen_random_uuid(), 'Tricep Pushdowns', 'isolation', ARRAY['arms'], ARRAY['cable'], 'beginner', NULL,
 'Empuje de tríceps en polea. Aislamiento efectivo de tríceps.',
 ARRAY['Codos fijos a los costados', 'Extiende completamente abajo', 'No dejes que el peso jale los brazos arriba rápido']);
