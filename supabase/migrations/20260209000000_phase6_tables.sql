-- Phase 6: Additional tables for training pipeline, water tracking, and education
-- Migration: 20260209000000_phase6_tables.sql

-- ============================================================
-- TABLES
-- ============================================================

-- weekly_plans: workout day templates per phase
CREATE TABLE weekly_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phase_id uuid NOT NULL REFERENCES phases(id) ON DELETE CASCADE,
  day_of_week integer NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  name text NOT NULL,
  muscle_groups text[] NOT NULL DEFAULT '{}',
  exercises jsonb NOT NULL DEFAULT '[]',
  -- exercises format: [{ "exercise_id": "uuid", "sets": 4, "reps": 10, "rest_seconds": 75, "order": 1 }]
  estimated_duration integer NOT NULL DEFAULT 45,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(phase_id, day_of_week)
);

-- water_logs: daily water intake tracking
CREATE TABLE water_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date date NOT NULL,
  glasses integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);

-- education_content: articles and lessons (shared content, no user_id)
CREATE TABLE education_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  subtitle text,
  category text NOT NULL CHECK (category IN ('training', 'nutrition', 'recovery', 'mindset')),
  body_md text NOT NULL DEFAULT '',
  image_url text,
  difficulty text NOT NULL DEFAULT 'beginner' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  duration_min integer NOT NULL DEFAULT 5,
  phase_tags text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- weekly_plans (inherit via phase -> season -> user_id)
ALTER TABLE weekly_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own weekly_plans" ON weekly_plans FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM phases
    JOIN seasons ON seasons.id = phases.season_id
    WHERE phases.id = weekly_plans.phase_id AND seasons.user_id = auth.uid()
  )
);
CREATE POLICY "Users insert own weekly_plans" ON weekly_plans FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM phases
    JOIN seasons ON seasons.id = phases.season_id
    WHERE phases.id = weekly_plans.phase_id AND seasons.user_id = auth.uid()
  )
);
CREATE POLICY "Users update own weekly_plans" ON weekly_plans FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM phases
    JOIN seasons ON seasons.id = phases.season_id
    WHERE phases.id = weekly_plans.phase_id AND seasons.user_id = auth.uid()
  )
);

-- water_logs (has user_id)
ALTER TABLE water_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own water_logs" ON water_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own water_logs" ON water_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own water_logs" ON water_logs FOR UPDATE USING (auth.uid() = user_id);

-- education_content (public read for authenticated users)
ALTER TABLE education_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users read education_content" ON education_content FOR SELECT TO authenticated USING (true);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_weekly_plans_phase_id ON weekly_plans(phase_id);
CREATE INDEX idx_water_logs_user_date ON water_logs(user_id, date);
