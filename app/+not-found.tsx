import { Link, Stack } from 'expo-router';
import { Text, View } from 'react-native';
import { theme } from '../constants/theme';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Not Found' }} />
      <View style={{ flex: 1, backgroundColor: theme.colors.bgStart, justifyContent: 'center', alignItems: 'center', gap: 10 }}>
        <Text style={{ color: theme.colors.textPrimary, fontSize: 24, fontWeight: '700' }}>Screen not found</Text>
        <Link href="/" style={{ color: theme.colors.primary }}>
          Go to Home
        </Link>
      </View>
    </>
  );
}
