import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react-native';
import { GlassCard } from '../../components/ui';
import { useAuth } from '../../hooks';

export default function SignUpScreen() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isValid =
    fullName.trim().length > 0 &&
    email.includes('@') &&
    password.length >= 8 &&
    password === confirmPassword;

  const handleSignUp = async () => {
    if (!isValid) return;
    setError('');
    setLoading(true);
    try {
      const { userId } = await signUp(email, password, fullName);
      router.push({ pathname: '/(auth)/onboarding', params: { userId } });
    } catch (err: any) {
      setError(err?.message ?? 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#0D0D2B', '#1A0A30']} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40, gap: 24 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Back */}
          <Pressable
            onPress={() => router.back()}
            className="h-10 w-10 items-center justify-center rounded-full bg-[#FFFFFF0A]"
          >
            <ArrowLeft size={20} color="#FFFFFF" />
          </Pressable>

          {/* Title */}
          <View className="gap-2">
            <Text className="font-inter-bold text-[28px] text-white">Create Account</Text>
            <Text className="font-inter text-[14px] text-[#827a89]">
              Start your performance journey with GENESIS
            </Text>
          </View>

          {/* Form */}
          <GlassCard shine className="gap-4">
            <View className="gap-2">
              <Text className="font-jetbrains-medium text-[11px] tracking-[1px] text-[#827a89]">
                FULL NAME
              </Text>
              <TextInput
                value={fullName}
                onChangeText={setFullName}
                placeholder="John Doe"
                placeholderTextColor="#6b6b7b"
                autoCapitalize="words"
                className="rounded-[12px] border border-[#FFFFFF14] bg-[#0D0D2B] px-4 py-3 font-inter text-[14px] text-white"
              />
            </View>

            <View className="gap-2">
              <Text className="font-jetbrains-medium text-[11px] tracking-[1px] text-[#827a89]">
                EMAIL
              </Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                placeholderTextColor="#6b6b7b"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                className="rounded-[12px] border border-[#FFFFFF14] bg-[#0D0D2B] px-4 py-3 font-inter text-[14px] text-white"
              />
            </View>

            <View className="gap-2">
              <Text className="font-jetbrains-medium text-[11px] tracking-[1px] text-[#827a89]">
                PASSWORD
              </Text>
              <View className="relative">
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Min. 8 characters"
                  placeholderTextColor="#6b6b7b"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  className="rounded-[12px] border border-[#FFFFFF14] bg-[#0D0D2B] px-4 py-3 pr-12 font-inter text-[14px] text-white"
                />
                <Pressable
                  onPress={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3"
                >
                  {showPassword ? (
                    <EyeOff size={18} color="#6b6b7b" />
                  ) : (
                    <Eye size={18} color="#6b6b7b" />
                  )}
                </Pressable>
              </View>
            </View>

            <View className="gap-2">
              <Text className="font-jetbrains-medium text-[11px] tracking-[1px] text-[#827a89]">
                CONFIRM PASSWORD
              </Text>
              <TextInput
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Re-enter password"
                placeholderTextColor="#6b6b7b"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                className="rounded-[12px] border border-[#FFFFFF14] bg-[#0D0D2B] px-4 py-3 font-inter text-[14px] text-white"
              />
              {confirmPassword.length > 0 && password !== confirmPassword && (
                <Text className="font-inter text-[11px] text-[#ff6b6b]">Passwords do not match</Text>
              )}
            </View>
          </GlassCard>

          {/* Error */}
          {error ? <Text className="font-inter text-[13px] text-[#ff6b6b]">{error}</Text> : null}

          {/* Submit */}
          <Pressable
            onPress={handleSignUp}
            disabled={!isValid || loading}
            style={{ opacity: isValid && !loading ? 1 : 0.5 }}
          >
            <LinearGradient
              colors={['#6D00FF', '#5B21B6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ borderRadius: 14, paddingVertical: 16, alignItems: 'center' }}
            >
              <Text className="font-jetbrains-semibold text-[14px] text-white">
                {loading ? 'Creating Account...' : 'CREATE ACCOUNT'}
              </Text>
            </LinearGradient>
          </Pressable>

          {/* Login link */}
          <Pressable onPress={() => router.push('/(auth)/login')} className="items-center py-2">
            <Text className="font-inter text-[13px] text-[#827a89]">
              Already have an account? <Text className="text-[#b39aff]">Log in</Text>
            </Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}
