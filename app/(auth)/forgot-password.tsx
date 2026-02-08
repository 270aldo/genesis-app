import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Mail, CheckCircle } from 'lucide-react-native';
import { GlassCard } from '../../components/ui';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const isValid = email.includes('@') && email.includes('.');

  const handleReset = async () => {
    if (!isValid) return;
    setError('');
    setLoading(true);
    try {
      // TODO: Connect to Supabase Auth resetPasswordForEmail
      setSent(true);
    } catch (err: any) {
      setError(err?.message ?? 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#0D0D2B', '#1A0A30']} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1, paddingHorizontal: 20, paddingTop: 16, gap: 24 }}>
        {/* Back */}
        <Pressable
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center rounded-full bg-[#FFFFFF0A]"
        >
          <ArrowLeft size={20} color="#FFFFFF" />
        </Pressable>

        {/* Title */}
        <View className="gap-2">
          <Text className="font-inter-bold text-[28px] text-white">Reset Password</Text>
          <Text className="font-inter text-[14px] text-[#827a89]">
            Enter your email and we'll send you recovery instructions.
          </Text>
        </View>

        {sent ? (
          <GlassCard shine className="items-center gap-4 py-8">
            <CheckCircle size={48} color="#22ff73" />
            <Text className="font-inter-bold text-[18px] text-white">Check Your Email</Text>
            <Text className="text-center font-inter text-[13px] text-[#827a89]">
              We sent recovery instructions to {email}. Check your inbox and follow the link.
            </Text>
            <Pressable onPress={() => router.push('/(auth)/login')}>
              <Text className="font-jetbrains-semibold text-[13px] text-[#b39aff]">Back to Login</Text>
            </Pressable>
          </GlassCard>
        ) : (
          <>
            <GlassCard shine className="gap-4">
              <View className="gap-2">
                <Text className="font-jetbrains-medium text-[11px] tracking-[1px] text-[#827a89]">
                  EMAIL ADDRESS
                </Text>
                <View className="flex-row items-center rounded-[12px] border border-[#FFFFFF14] bg-[#0D0D2B] px-4">
                  <Mail size={16} color="#6b6b7b" />
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder="you@example.com"
                    placeholderTextColor="#6b6b7b"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    className="flex-1 py-3 pl-3 font-inter text-[14px] text-white"
                  />
                </View>
              </View>
            </GlassCard>

            {error ? <Text className="font-inter text-[13px] text-[#ff6b6b]">{error}</Text> : null}

            <Pressable
              onPress={handleReset}
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
                  {loading ? 'Sending...' : 'SEND INSTRUCTIONS'}
                </Text>
              </LinearGradient>
            </Pressable>
          </>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}
