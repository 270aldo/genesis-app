import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { theme } from '../../constants/theme';
import { useAuthStore } from '../../stores';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('athlete@genesis.app');
  const [password, setPassword] = useState('');
  const { setSession, setUser } = useAuthStore();

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bgStart, padding: 20, justifyContent: 'center', gap: 14 }}>
      <Text style={{ color: theme.colors.textPrimary, fontSize: 28, fontWeight: '700' }}>GENESIS</Text>
      <Text style={{ color: theme.colors.textSecondary }}>Sign in to continue your training cycle.</Text>

      <TextInput
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        placeholder="Email"
        placeholderTextColor={theme.colors.textTertiary}
        style={{ borderWidth: 1, borderColor: theme.colors.borderSubtle, borderRadius: 14, padding: 12, color: theme.colors.textPrimary, backgroundColor: theme.colors.surface }}
      />
      <TextInput
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholder="Password"
        placeholderTextColor={theme.colors.textTertiary}
        style={{ borderWidth: 1, borderColor: theme.colors.borderSubtle, borderRadius: 14, padding: 12, color: theme.colors.textPrimary, backgroundColor: theme.colors.surface }}
      />

      <Pressable
        onPress={() => {
          setSession('demo-session-token');
          setUser({
            id: 'demo-user',
            email,
            name: 'Demo Athlete',
            plan: 'hybrid',
            subscriptionStatus: 'active',
          });
          router.replace('/(tabs)/home');
        }}
        style={{ borderRadius: 14, paddingVertical: 12, alignItems: 'center', backgroundColor: theme.colors.primary }}
      >
        <Text style={{ color: theme.colors.bgStart, fontWeight: '700' }}>Sign In</Text>
      </Pressable>

      <View style={{ flexDirection: 'row', gap: 14 }}>
        <Pressable onPress={() => router.push('/(auth)/sign-up')}>
          <Text style={{ color: theme.colors.info }}>Create account</Text>
        </Pressable>
        <Pressable onPress={() => router.push('/(auth)/forgot-password')}>
          <Text style={{ color: theme.colors.warning }}>Forgot password</Text>
        </Pressable>
      </View>
    </View>
  );
}
