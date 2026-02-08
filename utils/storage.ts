import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Typed AsyncStorage helpers. Auth tokens use SecureStore (in useAuthStore).
 * This module is for non-sensitive data only.
 */

/** Read a JSON value from AsyncStorage */
export async function getStoredValue<T>(key: string): Promise<T | null> {
  const raw = await AsyncStorage.getItem(key);
  if (raw === null) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

/** Write a JSON value to AsyncStorage */
export async function setStoredValue<T>(key: string, value: T): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

/** Remove a key from AsyncStorage */
export async function removeStoredValue(key: string): Promise<void> {
  await AsyncStorage.removeItem(key);
}

/** Clear all AsyncStorage (dangerous — only for dev/debug) */
export async function clearAllStorage(): Promise<void> {
  await AsyncStorage.clear();
}
