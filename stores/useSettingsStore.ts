import { create } from 'zustand';
import { hasSupabaseConfig } from '../services/supabaseClient';

type NotificationCategory = 'training' | 'nutrition' | 'check_in' | 'coach';

type NotificationPreference = {
  category: NotificationCategory;
  enabled: boolean;
};

type SettingsState = {
  notifications: NotificationPreference[];
  quietHoursStart: number; // hour 0-23
  quietHoursEnd: number;
  isLoading: boolean;
  fetchNotificationPreferences: () => Promise<void>;
  updateNotificationPreference: (category: NotificationCategory, enabled: boolean) => Promise<void>;
  updateQuietHours: (start: number, end: number) => Promise<void>;
};

const DEFAULT_NOTIFICATIONS: NotificationPreference[] = [
  { category: 'training', enabled: true },
  { category: 'nutrition', enabled: true },
  { category: 'check_in', enabled: true },
  { category: 'coach', enabled: true },
];

export const useSettingsStore = create<SettingsState>((set, get) => ({
  notifications: DEFAULT_NOTIFICATIONS,
  quietHoursStart: 22,
  quietHoursEnd: 7,
  isLoading: false,

  fetchNotificationPreferences: async () => {
    if (!hasSupabaseConfig) return;

    set({ isLoading: true });
    try {
      const { supabaseClient } = await import('../services/supabaseClient');
      const { getCurrentUserId } = await import('../services/supabaseQueries');
      const userId = getCurrentUserId();
      if (!userId) return;

      const { data, error } = await supabaseClient
        .from('notification_settings' as any)
        .select('*')
        .eq('user_id', userId)
        .eq('channel', 'push');

      if (error) throw error;

      if (!data || data.length === 0) {
        // Create defaults
        const defaults = DEFAULT_NOTIFICATIONS.map((n) => ({
          user_id: userId,
          channel: 'push',
          category: n.category,
          enabled: n.enabled,
          quiet_hours_start: 22,
          quiet_hours_end: 7,
        }));
        await (supabaseClient.from('notification_settings' as any) as any).insert(defaults);
        return;
      }

      const prefs: NotificationPreference[] = (data as any[]).map((row: any) => ({
        category: row.category as NotificationCategory,
        enabled: row.enabled,
      }));

      const firstRow = data[0] as any;
      set({
        notifications: prefs.length > 0 ? prefs : DEFAULT_NOTIFICATIONS,
        quietHoursStart: firstRow?.quiet_hours_start ?? 22,
        quietHoursEnd: firstRow?.quiet_hours_end ?? 7,
      });
    } catch (err: any) {
      console.warn('fetchNotificationPreferences failed:', err?.message);
    } finally {
      set({ isLoading: false });
    }
  },

  updateNotificationPreference: async (category, enabled) => {
    // Optimistic update
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.category === category ? { ...n, enabled } : n,
      ),
    }));

    if (!hasSupabaseConfig) {
      import('../services/pushNotifications').then((m) => m.scheduleDailyReminders());
      return;
    }

    try {
      const { supabaseClient } = await import('../services/supabaseClient');
      const { getCurrentUserId } = await import('../services/supabaseQueries');
      const userId = getCurrentUserId();
      if (!userId) return;

      await (supabaseClient.from('notification_settings' as any) as any)
        .update({ enabled })
        .eq('user_id', userId)
        .eq('channel', 'push')
        .eq('category', category);

      import('../services/pushNotifications').then((m) => m.scheduleDailyReminders());
    } catch (err: any) {
      console.warn('updateNotificationPreference failed:', err?.message);
      // Revert
      get().fetchNotificationPreferences();
    }
  },

  updateQuietHours: async (start, end) => {
    set({ quietHoursStart: start, quietHoursEnd: end });

    if (!hasSupabaseConfig) {
      import('../services/pushNotifications').then((m) => m.scheduleDailyReminders());
      return;
    }

    try {
      const { supabaseClient } = await import('../services/supabaseClient');
      const { getCurrentUserId } = await import('../services/supabaseQueries');
      const userId = getCurrentUserId();
      if (!userId) return;

      await (supabaseClient.from('notification_settings' as any) as any)
        .update({ quiet_hours_start: start, quiet_hours_end: end })
        .eq('user_id', userId)
        .eq('channel', 'push');

      import('../services/pushNotifications').then((m) => m.scheduleDailyReminders());
    } catch (err: any) {
      console.warn('updateQuietHours failed:', err?.message);
    }
  },
}));
