-- Phase 5: Core data tables for GENESIS app
-- Migration: 20260208000000_phase5_tables.sql
-- Note: profiles table already exists from auth setup and is NOT created here.

-- ============================================================
-- TABLES
-- ============================================================

-- seasons: top-level periodisation container per user
CREATE TABLE seasons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  goal text NOT NULL CHECK (goal IN ('build', 'cut', 'maintain', 'peak')),
  start_date date NOT NULL,
  end_date date NOT NULL,
  status text NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'active', 'completed')),
  created_by text NOT NULL DEFAULT 'ai' CHECK (created_by IN ('coach', 'ai', 'hybrid')),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- phases: training blocks within a season
CREATE TABLE phases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  season_id uuid NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,
  name text NOT NULL,
  focus text NOT NULL CHECK (focus IN ('hypertrophy', 'strength', 'power', 'endurance', 'deload')),
  order_index integer NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- weeks: individual weeks within a phase
CREATE TABLE weeks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phase_id uuid NOT NULL REFERENCES phases(id) ON DELETE CASCADE,
  week_number integer NOT NULL,
  focus text NOT NULL,
  deload boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- sessions: individual training sessions within a week
CREATE TABLE sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  week_id uuid NOT NULL REFERENCES weeks(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('strength', 'cardio', 'mobility', 'recovery')),
  scheduled_date date NOT NULL,
  completed_at timestamptz,
  source text NOT NULL DEFAULT 'ai' CHECK (source IN ('ai', 'coach', 'user')),
  rating integer CHECK (rating >= 1 AND rating <= 10),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- exercises: shared platform exercise catalogue (no user_id)
CREATE TABLE exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL CHECK (category IN ('compound', 'isolation', 'cardio', 'mobility', 'plyometric')),
  muscle_groups text[] NOT NULL DEFAULT '{}',
  equipment text[] NOT NULL DEFAULT '{}',
  difficulty text NOT NULL DEFAULT 'intermediate' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  video_url text,
  instructions text NOT NULL DEFAULT '',
  cues text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- exercise_logs: recorded sets/reps per exercise in a session
CREATE TABLE exercise_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  exercise_id uuid NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  sets jsonb NOT NULL DEFAULT '[]',
  rpe integer NOT NULL DEFAULT 0,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- check_ins: daily wellness check-ins
CREATE TABLE check_ins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date date NOT NULL,
  sleep_hours numeric NOT NULL,
  sleep_quality integer NOT NULL,
  energy integer NOT NULL,
  mood integer NOT NULL,
  stress integer NOT NULL,
  soreness integer NOT NULL,
  nutrition_quality integer,
  hydration integer,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);

-- meals: nutrition tracking
CREATE TABLE meals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date date NOT NULL,
  meal_type text NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  food_items jsonb NOT NULL DEFAULT '[]',
  total_macros jsonb NOT NULL DEFAULT '{}',
  logged_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- biomarkers: body composition and health metrics
CREATE TABLE biomarkers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date date NOT NULL,
  type text NOT NULL CHECK (type IN ('weight', 'body_fat', 'hrv', 'resting_hr', 'blood_pressure', 'vo2max')),
  value numeric NOT NULL,
  unit text NOT NULL,
  source text NOT NULL DEFAULT 'manual' CHECK (source IN ('manual', 'wearable')),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- personal_records: PR tracking per exercise
CREATE TABLE personal_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exercise_id uuid NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('weight', 'reps', 'time', 'distance')),
  value numeric NOT NULL,
  achieved_at timestamptz NOT NULL DEFAULT now(),
  session_id uuid REFERENCES sessions(id) ON DELETE SET NULL,
  previous_value numeric
);

-- conversations: AI agent chat history
CREATE TABLE conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_id text NOT NULL CHECK (agent_id IN ('genesis', 'train', 'fuel', 'mind', 'track', 'vision', 'coach_bridge')),
  messages jsonb NOT NULL DEFAULT '[]',
  session_context jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- seasons (has user_id)
ALTER TABLE seasons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own seasons" ON seasons FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own seasons" ON seasons FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own seasons" ON seasons FOR UPDATE USING (auth.uid() = user_id);

-- phases (inherit via seasons)
ALTER TABLE phases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own phases" ON phases FOR SELECT USING (
  EXISTS (SELECT 1 FROM seasons WHERE seasons.id = phases.season_id AND seasons.user_id = auth.uid())
);
CREATE POLICY "Users insert own phases" ON phases FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM seasons WHERE seasons.id = phases.season_id AND seasons.user_id = auth.uid())
);

-- weeks (inherit via phases -> seasons)
ALTER TABLE weeks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own weeks" ON weeks FOR SELECT USING (
  EXISTS (SELECT 1 FROM phases JOIN seasons ON seasons.id = phases.season_id WHERE phases.id = weeks.phase_id AND seasons.user_id = auth.uid())
);
CREATE POLICY "Users insert own weeks" ON weeks FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM phases JOIN seasons ON seasons.id = phases.season_id WHERE phases.id = weeks.phase_id AND seasons.user_id = auth.uid())
);

-- sessions (has user_id)
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own sessions" ON sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own sessions" ON sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own sessions" ON sessions FOR UPDATE USING (auth.uid() = user_id);

-- exercises (public read for authenticated users, no user_id)
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users read exercises" ON exercises FOR SELECT TO authenticated USING (true);

-- exercise_logs (inherit via sessions)
ALTER TABLE exercise_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own exercise_logs" ON exercise_logs FOR SELECT USING (
  EXISTS (SELECT 1 FROM sessions WHERE sessions.id = exercise_logs.session_id AND sessions.user_id = auth.uid())
);
CREATE POLICY "Users insert own exercise_logs" ON exercise_logs FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM sessions WHERE sessions.id = exercise_logs.session_id AND sessions.user_id = auth.uid())
);

-- check_ins (has user_id)
ALTER TABLE check_ins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own check_ins" ON check_ins FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own check_ins" ON check_ins FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own check_ins" ON check_ins FOR UPDATE USING (auth.uid() = user_id);

-- meals (has user_id)
ALTER TABLE meals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own meals" ON meals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own meals" ON meals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own meals" ON meals FOR UPDATE USING (auth.uid() = user_id);

-- biomarkers (has user_id)
ALTER TABLE biomarkers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own biomarkers" ON biomarkers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own biomarkers" ON biomarkers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own biomarkers" ON biomarkers FOR UPDATE USING (auth.uid() = user_id);

-- personal_records (has user_id)
ALTER TABLE personal_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own personal_records" ON personal_records FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own personal_records" ON personal_records FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own personal_records" ON personal_records FOR UPDATE USING (auth.uid() = user_id);

-- conversations (has user_id)
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own conversations" ON conversations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own conversations" ON conversations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own conversations" ON conversations FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_seasons_user_id ON seasons(user_id);
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_check_ins_user_date ON check_ins(user_id, date);
CREATE INDEX idx_meals_user_date ON meals(user_id, date);
CREATE INDEX idx_biomarkers_user_date ON biomarkers(user_id, date);
CREATE INDEX idx_personal_records_user_id ON personal_records(user_id);
CREATE INDEX idx_conversations_user_id ON conversations(user_id);
CREATE INDEX idx_exercise_logs_session_id ON exercise_logs(session_id);
CREATE INDEX idx_phases_season_id ON phases(season_id);
CREATE INDEX idx_weeks_phase_id ON weeks(phase_id);
CREATE INDEX idx_sessions_week_id ON sessions(week_id);
