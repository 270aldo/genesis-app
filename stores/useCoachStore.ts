import { create } from 'zustand';
import { supabaseClient, hasSupabaseConfig } from '../services/supabaseClient';

export interface CoachNote {
  id: string;
  user_id: string;
  message: string;
  type: 'observation' | 'encouragement' | 'adjustment' | 'milestone';
  read: boolean;
  created_at: string;
}

interface CoachState {
  latestNote: CoachNote | null;
  notes: CoachNote[];
  isRead: boolean;
  isLoading: boolean;
  fetchLatestNote: () => Promise<void>;
  fetchAllNotes: () => Promise<void>;
  markAsRead: (noteId: string) => Promise<void>;
}

export function filterNotesByType(notes: CoachNote[], type: string): CoachNote[] {
  if (!type || type === 'all') return notes;
  return notes.filter((n) => n.type === type);
}

// coach_notes table is not in generated Supabase types (migration pending).
// Typed helper minimizes unsafe cast surface until types are regenerated.
function coachNotesQuery() {
  return (supabaseClient as unknown as { from: (table: string) => ReturnType<typeof supabaseClient.from> }).from('coach_notes');
}

export const useCoachStore = create<CoachState>((set, get) => ({
  latestNote: null,
  notes: [],
  isRead: true,
  isLoading: false,

  fetchLatestNote: async () => {
    if (!hasSupabaseConfig) return;
    set({ isLoading: true });
    try {
      const { data: { user } } = await supabaseClient.auth.getUser();
      if (!user) return;

      const { data, error } = await coachNotesQuery()
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error || !data) {
        set({ latestNote: null, isRead: true });
        return;
      }

      const note = data as CoachNote;
      set({ latestNote: note, isRead: note.read });
    } catch (e) {
      console.warn('Failed to fetch coach note:', e);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchAllNotes: async () => {
    if (!hasSupabaseConfig) return;
    set({ isLoading: true });
    try {
      const { data: { user } } = await supabaseClient.auth.getUser();
      if (!user) return;

      const { data, error } = await coachNotesQuery()
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error || !data) {
        set({ notes: [] });
        return;
      }

      set({ notes: data as CoachNote[] });
    } catch (e) {
      console.warn('Failed to fetch coach notes:', e);
    } finally {
      set({ isLoading: false });
    }
  },

  markAsRead: async (noteId: string) => {
    if (!hasSupabaseConfig) return;
    try {
      await coachNotesQuery()
        .update({ read: true })
        .eq('id', noteId);

      set((state) => ({
        isRead: state.latestNote?.id === noteId ? true : state.isRead,
        notes: state.notes.map((n) => n.id === noteId ? { ...n, read: true } : n),
      }));
    } catch (e) {
      console.warn('Failed to mark note as read:', e);
    }
  },
}));
