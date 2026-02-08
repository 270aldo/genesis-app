import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { theme } from '../../constants/theme';
import { useAuth } from '../../hooks';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signIn, isLoading, error } = useAuth();

  const handleSignIn = async () => {
    try {
      await signIn(email, password);
    } catch {
      // error is set in the store
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bgStart, padding: 20, justifyContent: 'center', gap: 14 }}>
      <Text style={{ color: theme.colors.textPrimary, fontSize: 28, fontWeight: '700' }}>GENESIS</Text>
      <Text style={{ color: theme.colors.textSecondary }}>Sign in to continue your training cycle.</Text>

      <TextInput
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
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

      {error ? (
        <Text style={{ color: '#ff6b6b', fontSize: 13 }}>{error}</Text>
      ) : null}

      <Pressable
        onPress={handleSignIn}
        disabled={isLoading}
        style={{ borderRadius: 14, paddingVertical: 12, alignItems: 'center', backgroundColor: theme.colors.primary, opacity: isLoading ? 0.6 : 1 }}
      >
        <Text style={{ color: theme.colors.bgStart, fontWeight: '700' }}>
          {isLoading ? 'Signing In...' : 'Sign In'}
        </Text>
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
