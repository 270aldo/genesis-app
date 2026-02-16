import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

export type SmartNotification = {
  title: string;
  body: string;
  category: 'check_in' | 'training' | 'nutrition' | 'coach';
  hour: number;
  minute: number;
  data?: Record<string, string>;
};

export function isInQuietHours(hour: number, start: number, end: number): boolean {
  if (start <= end) {
    // e.g. 08:00 – 20:00
    return hour >= start && hour < end;
  }
  // Midnight-spanning: e.g. 22:00 – 07:00
  return hour >= start || hour < end;
}

export async function getSmartNotifications(): Promise<SmartNotification[]> {
  const notifications: SmartNotification[] = [];
  const today = new Date().toISOString().split('T')[0];

  // 1. Check-in reminder (8:00 AM) — only if not done today
  const checkedIn = await AsyncStorage.getItem(`genesis_checkin_${today}`);
  if (!checkedIn) {
    notifications.push({
      title: 'Buenos días, atleta',
      body: 'Registra tu check-in matutino para que GENESIS calibre tu día.',
      category: 'check_in',
      hour: 8,
      minute: 0,
      data: { category: 'check_in' },
    });
  }

  // 2. Training reminder (5:00 PM) — only Mon-Fri
  const dayOfWeek = new Date().getDay();
  if (dayOfWeek >= 1 && dayOfWeek <= 5) {
    notifications.push({
      title: 'Training time',
      body: 'Tu sesión de hoy te espera. Vamos a entrenar.',
      category: 'training',
      hour: 17,
      minute: 0,
      data: { category: 'training' },
    });
  }

  // 3. Streak risk (9:00 PM) — if on a streak and workout not done today
  const workoutDone = await AsyncStorage.getItem(`genesis_workoutDone_${today}`);
  if (!workoutDone) {
    notifications.push({
      title: 'No pierdas tu racha',
      body: 'Aún no has entrenado hoy. Completa algo para mantener tu consistencia.',
      category: 'training',
      hour: 21,
      minute: 0,
      data: { category: 'training' },
    });
  }

  // 4. Hydration reminders — every 2 hours from 10 to 20
  for (let hour = 10; hour <= 20; hour += 2) {
    notifications.push({
      title: 'Hydration check',
      body: 'Toma un vaso de agua para mantener tu rendimiento.',
      category: 'nutrition',
      hour,
      minute: 0,
      data: { category: 'nutrition' },
    });
  }

  return notifications;
}
