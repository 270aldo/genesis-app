-- Coach Notes table — stores observations from GENESIS BRAIN coach app
CREATE TABLE IF NOT EXISTS coach_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'observation' CHECK (type IN ('observation', 'encouragement', 'adjustment', 'milestone')),
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fetching latest note per user
CREATE INDEX IF NOT EXISTS idx_coach_notes_user_created
  ON coach_notes (user_id, created_at DESC);

-- RLS
ALTER TABLE coach_notes ENABLE ROW LEVEL SECURITY;

-- Users can read their own notes
CREATE POLICY "Users can read own coach notes"
  ON coach_notes FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update read status on their own notes
CREATE POLICY "Users can mark own notes as read"
  ON coach_notes FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Service role can insert notes (for GENESIS BRAIN)
CREATE POLICY "Service role can insert coach notes"
  ON coach_notes FOR INSERT
  WITH CHECK (true);
