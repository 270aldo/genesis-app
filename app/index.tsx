import { Redirect } from 'expo-router';
import { useAuthStore } from '../stores';

export default function Index() {
  const session = useAuthStore((state) => state.session);

  if (!session) return <Redirect href="/(auth)/login" />;

  return <Redirect href="/(tabs)/home" />;
}
