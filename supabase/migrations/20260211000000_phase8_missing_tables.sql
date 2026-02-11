-- Phase 8: Missing tables migration
-- Idempotent — safe to re-run

----------------------------------------------------------------------
-- 1. profiles
----------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS profiles (
  id          uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  full_name   text,
  age         int,
  weight_kg   numeric(5,1),
  height_cm   numeric(5,1),
  goal        text,
  experience_level text DEFAULT 'intermediate',
  timezone    text DEFAULT 'UTC',
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'profiles_select_own'
  ) THEN
    CREATE POLICY profiles_select_own ON profiles FOR SELECT USING (id = auth.uid());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'profiles_insert_own'
  ) THEN
    CREATE POLICY profiles_insert_own ON profiles FOR INSERT WITH CHECK (id = auth.uid());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'profiles_update_own'
  ) THEN
    CREATE POLICY profiles_update_own ON profiles FOR UPDATE USING (id = auth.uid());
  END IF;
END $$;

----------------------------------------------------------------------
-- 2. coach_assignments
----------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS coach_assignments (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id    uuid NOT NULL REFERENCES auth.users,
  user_id     uuid NOT NULL REFERENCES auth.users,
  status      text DEFAULT 'pending' CHECK (status IN ('pending','active','ended')),
  mode        text DEFAULT 'ai' CHECK (mode IN ('ai','human','hybrid')),
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

ALTER TABLE coach_assignments ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'coach_assignments' AND policyname = 'coach_assignments_select_own'
  ) THEN
    CREATE POLICY coach_assignments_select_own ON coach_assignments FOR SELECT
      USING (coach_id = auth.uid() OR user_id = auth.uid());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'coach_assignments' AND policyname = 'coach_assignments_update_own'
  ) THEN
    CREATE POLICY coach_assignments_update_own ON coach_assignments FOR UPDATE
      USING (coach_id = auth.uid() OR user_id = auth.uid());
  END IF;
END $$;

----------------------------------------------------------------------
-- 3. widget_states
----------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS widget_states (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  widget_type  text NOT NULL,
  widget_data  jsonb DEFAULT '{}',
  updated_at   timestamptz DEFAULT now()
);

ALTER TABLE widget_states ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'widget_states' AND policyname = 'widget_states_select_own'
  ) THEN
    CREATE POLICY widget_states_select_own ON widget_states FOR SELECT USING (user_id = auth.uid());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'widget_states' AND policyname = 'widget_states_insert_own'
  ) THEN
    CREATE POLICY widget_states_insert_own ON widget_states FOR INSERT WITH CHECK (user_id = auth.uid());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'widget_states' AND policyname = 'widget_states_update_own'
  ) THEN
    CREATE POLICY widget_states_update_own ON widget_states FOR UPDATE USING (user_id = auth.uid());
  END IF;
END $$;

----------------------------------------------------------------------
-- 4. notification_settings
----------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notification_settings (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  channel          text NOT NULL CHECK (channel IN ('push','email','sms')),
  category         text NOT NULL CHECK (category IN ('training','nutrition','check_in','coach','system')),
  enabled          boolean DEFAULT true,
  quiet_hours_start time,
  quiet_hours_end   time,
  updated_at       timestamptz DEFAULT now(),
  UNIQUE(user_id, channel, category)
);

ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'notification_settings' AND policyname = 'notification_settings_select_own'
  ) THEN
    CREATE POLICY notification_settings_select_own ON notification_settings FOR SELECT USING (user_id = auth.uid());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'notification_settings' AND policyname = 'notification_settings_insert_own'
  ) THEN
    CREATE POLICY notification_settings_insert_own ON notification_settings FOR INSERT WITH CHECK (user_id = auth.uid());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'notification_settings' AND policyname = 'notification_settings_update_own'
  ) THEN
    CREATE POLICY notification_settings_update_own ON notification_settings FOR UPDATE USING (user_id = auth.uid());
  END IF;
END $$;

----------------------------------------------------------------------
-- 5. progress_photos
----------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS progress_photos (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  date            date NOT NULL,
  category        text DEFAULT 'front' CHECK (category IN ('front','side','back','other')),
  storage_path    text NOT NULL,
  thumbnail_path  text,
  notes           text,
  created_at      timestamptz DEFAULT now()
);

ALTER TABLE progress_photos ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'progress_photos' AND policyname = 'progress_photos_select_own'
  ) THEN
    CREATE POLICY progress_photos_select_own ON progress_photos FOR SELECT USING (user_id = auth.uid());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'progress_photos' AND policyname = 'progress_photos_insert_own'
  ) THEN
    CREATE POLICY progress_photos_insert_own ON progress_photos FOR INSERT WITH CHECK (user_id = auth.uid());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'progress_photos' AND policyname = 'progress_photos_delete_own'
  ) THEN
    CREATE POLICY progress_photos_delete_own ON progress_photos FOR DELETE USING (user_id = auth.uid());
  END IF;
END $$;

----------------------------------------------------------------------
-- 6. update_updated_at() trigger function + triggers
----------------------------------------------------------------------
DO $$ BEGIN
  CREATE OR REPLACE FUNCTION update_updated_at()
  RETURNS trigger AS $fn$
  BEGIN
    NEW.updated_at = now();
    RETURN NEW;
  END;
  $fn$ LANGUAGE plpgsql;
EXCEPTION
  WHEN duplicate_function THEN NULL;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_profiles_updated_at'
  ) THEN
    CREATE TRIGGER trg_profiles_updated_at
      BEFORE UPDATE ON profiles
      FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_coach_assignments_updated_at'
  ) THEN
    CREATE TRIGGER trg_coach_assignments_updated_at
      BEFORE UPDATE ON coach_assignments
      FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_widget_states_updated_at'
  ) THEN
    CREATE TRIGGER trg_widget_states_updated_at
      BEFORE UPDATE ON widget_states
      FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_notification_settings_updated_at'
  ) THEN
    CREATE TRIGGER trg_notification_settings_updated_at
      BEFORE UPDATE ON notification_settings
      FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  END IF;
END $$;

----------------------------------------------------------------------
-- 7. Indexes
----------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_profiles_id ON profiles (id);
CREATE INDEX IF NOT EXISTS idx_coach_assignments_user_id ON coach_assignments (user_id);
CREATE INDEX IF NOT EXISTS idx_coach_assignments_coach_id ON coach_assignments (coach_id);
CREATE INDEX IF NOT EXISTS idx_widget_states_user_id ON widget_states (user_id);
CREATE INDEX IF NOT EXISTS idx_notification_settings_user_id ON notification_settings (user_id);
CREATE INDEX IF NOT EXISTS idx_progress_photos_user_id ON progress_photos (user_id);
CREATE INDEX IF NOT EXISTS idx_progress_photos_user_date ON progress_photos (user_id, date);
