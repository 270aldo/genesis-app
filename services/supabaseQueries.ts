import { supabaseClient, hasSupabaseConfig } from './supabaseClient';
import { useAuthStore } from '../stores/useAuthStore';
import type { Json } from '../types/supabase';

type AgentId = 'genesis' | 'train' | 'fuel' | 'mind' | 'track' | 'vision' | 'coach_bridge';

// ── Helpers ──

export function getCurrentUserId(): string | null {
  return useAuthStore.getState().user?.id ?? null;
}

function today(): string {
  return new Date().toISOString().split('T')[0];
}

// ── Seasons ──

export async function fetchActiveSeason(userId: string) {
  if (!hasSupabaseConfig) return null;
  const { data, error } = await supabaseClient
    .from('seasons')
    .select('*, phases(*, weeks(*))')
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
  if (error) {
    console.warn('fetchActiveSeason:', error.message);
    return null;
  }
  return data;
}

// ── Sessions ──

export async function fetchTodaySession(userId: string) {
  if (!hasSupabaseConfig) return null;
  const { data, error } = await supabaseClient
    .from('sessions')
    .select('*')
    .eq('user_id', userId)
    .eq('scheduled_date', today())
    .is('completed_at', null)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) {
    console.warn('fetchTodaySession:', error.message);
    return null;
  }
  if (!data) return null;

  // Fetch exercise logs separately (relationship not typed in schema)
  const { data: logs } = await supabaseClient
    .from('exercise_logs')
    .select('*, exercises(name)')
    .eq('session_id', data.id);

  return { ...data, exercise_logs: logs ?? [] };
}

export async function fetchPreviousSessions(userId: string, limit = 10) {
  if (!hasSupabaseConfig) return null;
  const { data, error } = await supabaseClient
    .from('sessions')
    .select('*')
    .eq('user_id', userId)
    .not('completed_at', 'is', null)
    .order('completed_at', { ascending: false })
    .limit(limit);
  if (error) {
    console.warn('fetchPreviousSessions:', error.message);
    return null;
  }
  if (!data || data.length === 0) return data;

  // Fetch exercise logs for all sessions (relationship not typed in schema)
  const sessionIds = data.map((s) => s.id);
  const { data: allLogs } = await supabaseClient
    .from('exercise_logs')
    .select('*, exercises(name)')
    .in('session_id', sessionIds);

  const logsBySession = new Map<string, any[]>();
  for (const log of allLogs ?? []) {
    const existing = logsBySession.get(log.session_id) ?? [];
    existing.push(log);
    logsBySession.set(log.session_id, existing);
  }

  return data.map((s) => ({ ...s, exercise_logs: logsBySession.get(s.id) ?? [] }));
}

export async function completeSession(sessionId: string) {
  if (!hasSupabaseConfig) return null;
  const { data, error } = await supabaseClient
    .from('sessions')
    .update({ completed_at: new Date().toISOString() })
    .eq('id', sessionId)
    .select()
    .single();
  if (error) {
    console.warn('completeSession:', error.message);
    return null;
  }
  return data;
}

// ── Exercise Logs ──

export async function insertExerciseLogs(
  sessionId: string,
  logs: Array<{ exercise_id: string; sets: Json; rpe: number; notes?: string }>
) {
  if (!hasSupabaseConfig) return null;
  const rows = logs.map((log) => ({
    session_id: sessionId,
    exercise_id: log.exercise_id,
    sets: log.sets,
    rpe: log.rpe,
    notes: log.notes ?? null,
  }));
  const { data, error } = await supabaseClient
    .from('exercise_logs')
    .insert(rows)
    .select();
  if (error) {
    console.warn('insertExerciseLogs:', error.message);
    return null;
  }
  return data;
}

// ── Check-ins ──

export async function fetchCheckIns(userId: string, dateRange?: { from?: string; to?: string }) {
  if (!hasSupabaseConfig) return null;
  let query = supabaseClient
    .from('check_ins')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false });
  if (dateRange?.from) query = query.gte('date', dateRange.from);
  if (dateRange?.to) query = query.lte('date', dateRange.to);
  const { data, error } = await query;
  if (error) {
    console.warn('fetchCheckIns:', error.message);
    return null;
  }
  return data;
}

export async function upsertCheckIn(
  userId: string,
  checkIn: {
    date: string;
    sleep_hours: number;
    sleep_quality: number;
    energy: number;
    mood: number;
    stress: number;
    soreness: number;
    nutrition_quality?: number | null;
    hydration?: number | null;
    notes?: string | null;
  }
) {
  if (!hasSupabaseConfig) return null;
  const { data, error } = await supabaseClient
    .from('check_ins')
    .upsert(
      { user_id: userId, ...checkIn },
      { onConflict: 'user_id,date' }
    )
    .select()
    .single();
  if (error) {
    console.warn('upsertCheckIn:', error.message);
    return null;
  }
  return data;
}

// ── Meals ──

export async function fetchMealsForDate(userId: string, date?: string) {
  if (!hasSupabaseConfig) return null;
  const { data, error } = await supabaseClient
    .from('meals')
    .select('*')
    .eq('user_id', userId)
    .eq('date', date ?? today())
    .order('logged_at', { ascending: true });
  if (error) {
    console.warn('fetchMealsForDate:', error.message);
    return null;
  }
  return data;
}

export async function insertMeal(
  userId: string,
  meal: {
    date: string;
    meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    food_items: Json;
    total_macros: Json;
  }
) {
  if (!hasSupabaseConfig) return null;
  const { data, error } = await supabaseClient
    .from('meals')
    .insert({ user_id: userId, ...meal })
    .select()
    .single();
  if (error) {
    console.warn('insertMeal:', error.message);
    return null;
  }
  return data;
}

// ── Water Logs ──

export async function fetchWaterLog(userId: string, date?: string) {
  if (!hasSupabaseConfig) return null;
  const { data, error } = await supabaseClient
    .from('water_logs')
    .select('*')
    .eq('user_id', userId)
    .eq('date', date ?? today())
    .maybeSingle();
  if (error) {
    console.warn('fetchWaterLog:', error.message);
    return null;
  }
  return data;
}

export async function upsertWaterLog(userId: string, date: string, glasses: number) {
  if (!hasSupabaseConfig) return null;
  const { data, error } = await supabaseClient
    .from('water_logs')
    .upsert({ user_id: userId, date, glasses }, { onConflict: 'user_id,date' })
    .select()
    .single();
  if (error) {
    console.warn('upsertWaterLog:', error.message);
    return null;
  }
  return data;
}

// ── Biomarkers ──

export async function fetchBiomarkers(userId: string) {
  if (!hasSupabaseConfig) return null;
  const { data, error } = await supabaseClient
    .from('biomarkers')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })
    .limit(50);
  if (error) {
    console.warn('fetchBiomarkers:', error.message);
    return null;
  }
  return data;
}

export async function insertBiomarker(
  userId: string,
  biomarker: {
    date: string;
    type: 'weight' | 'body_fat' | 'hrv' | 'resting_hr' | 'blood_pressure' | 'vo2max';
    value: number;
    unit: string;
    source: 'manual' | 'wearable';
  }
) {
  if (!hasSupabaseConfig) return null;
  const { data, error } = await supabaseClient
    .from('biomarkers')
    .insert({ user_id: userId, ...biomarker })
    .select()
    .single();
  if (error) {
    console.warn('insertBiomarker:', error.message);
    return null;
  }
  return data;
}

// ── Personal Records ──

export async function fetchExistingPRMap(
  userId: string,
  exerciseIds: string[]
): Promise<Record<string, { weight?: number; reps?: number }>> {
  if (!hasSupabaseConfig || exerciseIds.length === 0) return {};
  const { data, error } = await supabaseClient
    .from('personal_records')
    .select('exercise_id, type, value')
    .eq('user_id', userId)
    .in('exercise_id', exerciseIds);
  if (error || !data) return {};

  const map: Record<string, { weight?: number; reps?: number }> = {};
  for (const row of data as Array<{ exercise_id: string; type: string; value: number }>) {
    if (!map[row.exercise_id]) map[row.exercise_id] = {};
    if (row.type === 'weight') map[row.exercise_id].weight = row.value;
    if (row.type === 'reps') map[row.exercise_id].reps = row.value;
  }
  return map;
}

export async function fetchPersonalRecords(userId: string) {
  if (!hasSupabaseConfig) return null;
  const { data, error } = await supabaseClient
    .from('personal_records')
    .select('*, exercises(name, muscle_groups)')
    .eq('user_id', userId)
    .order('achieved_at', { ascending: false });
  if (error) {
    console.warn('fetchPersonalRecords:', error.message);
    return null;
  }
  return data;
}

export async function insertPersonalRecord(
  userId: string,
  record: {
    exercise_id: string;
    type: 'weight' | 'reps' | 'time' | 'distance';
    value: number;
    session_id?: string | null;
    previous_value?: number | null;
  }
) {
  if (!hasSupabaseConfig) return null;
  const { data, error } = await supabaseClient
    .from('personal_records')
    .insert({ user_id: userId, ...record })
    .select()
    .single();
  if (error) {
    console.warn('insertPersonalRecord:', error.message);
    return null;
  }
  return data;
}

// ── Season / Phase / Plan Creation ──

export async function createSeason(
  userId: string,
  data: { name: string; goal: 'build' | 'cut' | 'maintain' | 'peak'; start_date: string; end_date: string },
) {
  if (!hasSupabaseConfig) return null;
  const { data: row, error } = await supabaseClient
    .from('seasons')
    .insert({ user_id: userId, ...data, status: 'active' as const })
    .select()
    .single();
  if (error) {
    console.warn('createSeason:', error.message);
    return null;
  }
  return row;
}

export async function createPhase(
  seasonId: string,
  data: { name: string; focus: 'hypertrophy' | 'strength' | 'power' | 'endurance' | 'deload'; order_index: number; start_date: string; end_date: string },
) {
  if (!hasSupabaseConfig) return null;
  const { data: row, error } = await supabaseClient
    .from('phases')
    .insert({ season_id: seasonId, ...data })
    .select()
    .single();
  if (error) {
    console.warn('createPhase:', error.message);
    return null;
  }
  return row;
}

export async function createWeeklyPlans(
  phaseId: string,
  plans: Array<{
    day_of_week: number;
    name: string;
    muscle_groups: string[];
    exercises: any;
    estimated_duration: number;
  }>,
) {
  if (!hasSupabaseConfig) return null;
  const rows = plans.map((p) => ({ phase_id: phaseId, ...p }));
  const { data, error } = await supabaseClient
    .from('weekly_plans')
    .insert(rows)
    .select();
  if (error) {
    console.warn('createWeeklyPlans:', error.message);
    return null;
  }
  return data;
}

export async function fetchExercisesByMuscleGroups(groups: string[]) {
  if (!hasSupabaseConfig) return [];
  const { data, error } = await supabaseClient
    .from('exercises')
    .select('id, name, muscle_groups')
    .overlaps('muscle_groups', groups)
    .limit(8);
  if (error) {
    console.warn('fetchExercisesByMuscleGroups:', error.message);
    return [];
  }
  return data ?? [];
}

// ── Progress Photos ──
// NOTE: Requires a Supabase Storage bucket named 'progress-photos' (public or with RLS).
// Create via Supabase Dashboard > Storage > New bucket.

export async function uploadProgressPhoto(
  userId: string,
  uri: string,
  date: string,
  category: 'front' | 'side' | 'back' | 'other'
): Promise<{ storagePath: string } | null> {
  if (!hasSupabaseConfig) return null;
  try {
    const { readAsStringAsync } = await import('expo-file-system');
    const base64 = await readAsStringAsync(uri, { encoding: 'base64' });
    const timestamp = Date.now();
    const storagePath = `${userId}/${date}_${category}_${timestamp}.jpg`;
    const { error } = await supabaseClient.storage
      .from('progress-photos')
      .upload(storagePath, decode(base64), { contentType: 'image/jpeg', upsert: false });
    if (error) {
      console.warn('uploadProgressPhoto:', error.message);
      return null;
    }
    return { storagePath };
  } catch (err: any) {
    console.warn('uploadProgressPhoto failed:', err?.message);
    return null;
  }
}

export async function insertProgressPhoto(
  userId: string,
  photo: {
    date: string;
    category: 'front' | 'side' | 'back' | 'other';
    storage_path: string;
    thumbnail_path?: string | null;
    notes?: string | null;
  }
) {
  if (!hasSupabaseConfig) return null;
  const { data, error } = await supabaseClient
    .from('progress_photos')
    .insert({ user_id: userId, ...photo })
    .select()
    .single();
  if (error) {
    console.warn('insertProgressPhoto:', error.message);
    return null;
  }
  return data;
}

export async function fetchProgressPhotos(userId: string) {
  if (!hasSupabaseConfig) return null;
  const { data, error } = await supabaseClient
    .from('progress_photos')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })
    .limit(50);
  if (error) {
    console.warn('fetchProgressPhotos:', error.message);
    return null;
  }
  // Generate public URLs for each photo
  return (data ?? []).map((row: any) => {
    const { data: urlData } = supabaseClient.storage
      .from('progress-photos')
      .getPublicUrl(row.storage_path);
    return { ...row, uri: urlData?.publicUrl ?? null };
  });
}

export async function deleteProgressPhoto(photoId: string, storagePath: string) {
  if (!hasSupabaseConfig) return null;
  // Delete from storage
  await supabaseClient.storage.from('progress-photos').remove([storagePath]);
  // Delete metadata row
  const { error } = await supabaseClient
    .from('progress_photos')
    .delete()
    .eq('id', photoId);
  if (error) {
    console.warn('deleteProgressPhoto:', error.message);
    return null;
  }
  return true;
}

// Helper: decode base64 string to Uint8Array for Supabase Storage upload
function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// ── Conversations ──

export async function fetchConversation(userId: string, agentId: AgentId) {
  if (!hasSupabaseConfig) return null;
  const { data, error } = await supabaseClient
    .from('conversations')
    .select('*')
    .eq('user_id', userId)
    .eq('agent_id', agentId)
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) {
    console.warn('fetchConversation:', error.message);
    return null;
  }
  return data;
}

export async function upsertConversation(
  userId: string,
  agentId: AgentId,
  conversationId: string | null,
  messages: Json,
  sessionContext?: Json | null
) {
  if (!hasSupabaseConfig) return null;
  const payload = {
    user_id: userId,
    agent_id: agentId,
    messages,
    session_context: sessionContext ?? null,
    updated_at: new Date().toISOString(),
  };
  if (conversationId) {
    const { data, error } = await supabaseClient
      .from('conversations')
      .update({ messages, session_context: sessionContext ?? null, updated_at: new Date().toISOString() })
      .eq('id', conversationId)
      .select()
      .single();
    if (error) {
      console.warn('upsertConversation (update):', error.message);
      return null;
    }
    return data;
  }
  const { data, error } = await supabaseClient
    .from('conversations')
    .insert(payload)
    .select()
    .single();
  if (error) {
    console.warn('upsertConversation (insert):', error.message);
    return null;
  }
  return data;
}
