import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { hasSupabaseConfig } from './supabaseClient';

// Configure foreground notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function registerForPushNotifications(): Promise<string | null> {
  if (!Device.isDevice) {
    console.warn('Push notifications require a physical device');
    return null;
  }

  // Check existing permission
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  // Request permission if not granted
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.warn('Push notification permission not granted');
    return null;
  }

  // Android notification channel
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'GENESIS',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#7C3AED',
    });
  }

  // Get push token
  try {
    const tokenData = await Notifications.getExpoPushTokenAsync();
    const token = tokenData.data;

    // Save token to profiles table
    await savePushToken(token);
    return token;
  } catch (err: any) {
    console.warn('Failed to get push token:', err?.message);
    return null;
  }
}

async function savePushToken(token: string): Promise<void> {
  if (!hasSupabaseConfig) return;
  try {
    const { supabaseClient } = await import('./supabaseClient');
    const { getCurrentUserId } = await import('./supabaseQueries');
    const userId = getCurrentUserId();
    if (!userId) return;

    // push_token column may not exist in typed schema yet — cast to bypass
    await (supabaseClient
      .from('profiles') as any)
      .update({ push_token: token })
      .eq('id', userId);
  } catch (err: any) {
    // push_token column may not exist yet — fail silently
    console.warn('savePushToken failed (column may not exist):', err?.message);
  }
}

export async function scheduleLocalNotification(
  title: string,
  body: string,
  trigger: Notifications.NotificationTriggerInput,
): Promise<string> {
  return Notifications.scheduleNotificationAsync({
    content: { title, body, sound: 'default' },
    trigger,
  });
}

export async function scheduleDailyReminders(): Promise<void> {
  await cancelAllScheduled();

  try {
    const { useSettingsStore } = await import('../stores/useSettingsStore');
    const { getSmartNotifications, isInQuietHours } = await import('./smartNotifications');

    const { notifications: prefs, quietHoursStart, quietHoursEnd } = useSettingsStore.getState();
    const smartNotifs = await getSmartNotifications();

    for (const notif of smartNotifs) {
      // Check if category is enabled
      const pref = prefs.find((p) => p.category === notif.category);
      if (pref && !pref.enabled) continue;

      // Check quiet hours
      if (isInQuietHours(notif.hour, quietHoursStart, quietHoursEnd)) continue;

      await scheduleLocalNotification(
        notif.title,
        notif.body,
        { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour: notif.hour, minute: notif.minute },
      );
    }
  } catch (err: any) {
    console.warn('scheduleDailyReminders failed, falling back to defaults:', err?.message);
    // Fallback: schedule basic reminders
    await scheduleLocalNotification(
      'Buenos días, atleta',
      'Registra tu check-in matutino para que GENESIS calibre tu día.',
      { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour: 8, minute: 0 },
    );
    await scheduleLocalNotification(
      'Training time',
      'Tu sesión de hoy te espera. Vamos a entrenar.',
      { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour: 17, minute: 0 },
    );
  }
}

export async function cancelAllScheduled(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
