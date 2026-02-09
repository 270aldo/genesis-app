import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Dimensions, KeyboardAvoidingView, Platform, Pressable, Text, TextInput, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react-native';
import { GENESIS_COLORS } from '../../constants/colors';
import { useAuth } from '../../hooks';

const HERO_IMAGE = 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=900&q=80';
const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function SignUpScreen() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);
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
    <View style={{ flex: 1, backgroundColor: '#000000' }}>
      {/* Hero background image */}
      <Image
        source={{ uri: HERO_IMAGE }}
        contentFit="cover"
        style={{ position: 'absolute', width: '100%', height: SCREEN_HEIGHT * 0.38 }}
        transition={400}
      />

      {/* Gradient overlay fading into black */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.4)', 'rgba(0,0,0,0.95)', '#000000']}
        locations={[0, 0.2, 0.4, 0.5]}
        style={{ position: 'absolute', width: '100%', height: SCREEN_HEIGHT * 0.5 }}
      />

      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-end', paddingHorizontal: 24, paddingBottom: 32 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Back button */}
            <Pressable
              onPress={() => router.back()}
              hitSlop={12}
              style={{
                position: 'absolute',
                top: 8,
                left: 24,
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: 'rgba(0,0,0,0.5)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ArrowLeft size={20} color="#FFFFFF" />
            </Pressable>

            {/* Branding */}
            <View style={{ gap: 6, marginBottom: 32 }}>
              <Text style={{
                color: GENESIS_COLORS.primary,
                fontSize: 12,
                fontFamily: 'JetBrainsMonoBold',
                letterSpacing: 4,
              }}>
                NGX
              </Text>
              <Text style={{
                color: '#FFFFFF',
                fontSize: 30,
                fontFamily: 'InterBold',
                letterSpacing: -0.5,
              }}>
                CREATE ACCOUNT
              </Text>
              <Text style={{
                color: GENESIS_COLORS.textSecondary,
                fontSize: 14,
                fontFamily: 'Inter',
                lineHeight: 20,
              }}>
                Start your performance journey.
              </Text>
            </View>

            {/* Form */}
            <View style={{ gap: 14 }}>
              {/* Full Name */}
              <View style={{ gap: 6 }}>
                <Text style={{
                  color: GENESIS_COLORS.textTertiary,
                  fontSize: 10,
                  fontFamily: 'JetBrainsMonoMedium',
                  letterSpacing: 1.5,
                  textTransform: 'uppercase',
                }}>
                  Full Name
                </Text>
                <TextInput
                  value={fullName}
                  onChangeText={setFullName}
                  onFocus={() => setFocused('name')}
                  onBlur={() => setFocused(null)}
                  autoCapitalize="words"
                  placeholder="John Doe"
                  placeholderTextColor={GENESIS_COLORS.textMuted}
                  style={{
                    borderWidth: 1,
                    borderColor: focused === 'name' ? GENESIS_COLORS.borderActive : GENESIS_COLORS.borderSubtle,
                    borderRadius: 14,
                    paddingHorizontal: 16,
                    paddingVertical: 14,
                    color: '#FFFFFF',
                    fontFamily: 'Inter',
                    fontSize: 15,
                    backgroundColor: 'rgba(255,255,255,0.04)',
                  }}
                />
              </View>

              {/* Email */}
              <View style={{ gap: 6 }}>
                <Text style={{
                  color: GENESIS_COLORS.textTertiary,
                  fontSize: 10,
                  fontFamily: 'JetBrainsMonoMedium',
                  letterSpacing: 1.5,
                  textTransform: 'uppercase',
                }}>
                  Email
                </Text>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  onFocus={() => setFocused('email')}
                  onBlur={() => setFocused(null)}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoCorrect={false}
                  placeholder="you@example.com"
                  placeholderTextColor={GENESIS_COLORS.textMuted}
                  style={{
                    borderWidth: 1,
                    borderColor: focused === 'email' ? GENESIS_COLORS.borderActive : GENESIS_COLORS.borderSubtle,
                    borderRadius: 14,
                    paddingHorizontal: 16,
                    paddingVertical: 14,
                    color: '#FFFFFF',
                    fontFamily: 'Inter',
                    fontSize: 15,
                    backgroundColor: 'rgba(255,255,255,0.04)',
                  }}
                />
              </View>

              {/* Password */}
              <View style={{ gap: 6 }}>
                <Text style={{
                  color: GENESIS_COLORS.textTertiary,
                  fontSize: 10,
                  fontFamily: 'JetBrainsMonoMedium',
                  letterSpacing: 1.5,
                  textTransform: 'uppercase',
                }}>
                  Password
                </Text>
                <View>
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    onFocus={() => setFocused('password')}
                    onBlur={() => setFocused(null)}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    placeholder="Min. 8 characters"
                    placeholderTextColor={GENESIS_COLORS.textMuted}
                    style={{
                      borderWidth: 1,
                      borderColor: focused === 'password' ? GENESIS_COLORS.borderActive : GENESIS_COLORS.borderSubtle,
                      borderRadius: 14,
                      paddingHorizontal: 16,
                      paddingVertical: 14,
                      paddingRight: 48,
                      color: '#FFFFFF',
                      fontFamily: 'Inter',
                      fontSize: 15,
                      backgroundColor: 'rgba(255,255,255,0.04)',
                    }}
                  />
                  <Pressable
                    onPress={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: 14, top: 14 }}
                  >
                    {showPassword
                      ? <EyeOff size={18} color={GENESIS_COLORS.textMuted} />
                      : <Eye size={18} color={GENESIS_COLORS.textMuted} />
                    }
                  </Pressable>
                </View>
              </View>

              {/* Confirm Password */}
              <View style={{ gap: 6 }}>
                <Text style={{
                  color: GENESIS_COLORS.textTertiary,
                  fontSize: 10,
                  fontFamily: 'JetBrainsMonoMedium',
                  letterSpacing: 1.5,
                  textTransform: 'uppercase',
                }}>
                  Confirm Password
                </Text>
                <TextInput
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  onFocus={() => setFocused('confirm')}
                  onBlur={() => setFocused(null)}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  placeholder="Re-enter password"
                  placeholderTextColor={GENESIS_COLORS.textMuted}
                  style={{
                    borderWidth: 1,
                    borderColor: focused === 'confirm' ? GENESIS_COLORS.borderActive : GENESIS_COLORS.borderSubtle,
                    borderRadius: 14,
                    paddingHorizontal: 16,
                    paddingVertical: 14,
                    color: '#FFFFFF',
                    fontFamily: 'Inter',
                    fontSize: 15,
                    backgroundColor: 'rgba(255,255,255,0.04)',
                  }}
                />
                {confirmPassword.length > 0 && password !== confirmPassword && (
                  <Text style={{
                    color: GENESIS_COLORS.error,
                    fontSize: 11,
                    fontFamily: 'Inter',
                    marginTop: 4,
                  }}>
                    Passwords do not match
                  </Text>
                )}
              </View>

              {/* Error */}
              {error ? (
                <View style={{
                  backgroundColor: GENESIS_COLORS.error + '15',
                  borderRadius: 10,
                  padding: 12,
                  borderWidth: 1,
                  borderColor: GENESIS_COLORS.error + '30',
                }}>
                  <Text style={{ color: GENESIS_COLORS.error, fontSize: 12, fontFamily: 'Inter' }}>{error}</Text>
                </View>
              ) : null}

              {/* Create Account Button */}
              <Pressable
                onPress={handleSignUp}
                disabled={!isValid || loading}
                style={{ opacity: isValid && !loading ? 1 : 0.5, marginTop: 4 }}
              >
                <LinearGradient
                  colors={[GENESIS_COLORS.primary, GENESIS_COLORS.primaryDark]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{
                    borderRadius: 14,
                    paddingVertical: 16,
                    alignItems: 'center',
                    shadowColor: GENESIS_COLORS.primary,
                    shadowOpacity: 0.4,
                    shadowRadius: 12,
                    shadowOffset: { width: 0, height: 4 },
                    elevation: 8,
                  }}
                >
                  <Text style={{
                    color: '#FFFFFF',
                    fontSize: 14,
                    fontFamily: 'JetBrainsMonoSemiBold',
                    letterSpacing: 1,
                  }}>
                    {loading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
                  </Text>
                </LinearGradient>
              </Pressable>
            </View>

            {/* Login link */}
            <Pressable
              onPress={() => router.push('/(auth)/login')}
              style={{ alignItems: 'center', marginTop: 20, paddingVertical: 8 }}
            >
              <Text style={{
                color: GENESIS_COLORS.textSecondary,
                fontSize: 13,
                fontFamily: 'Inter',
              }}>
                Already have an account?{' '}
                <Text style={{ color: GENESIS_COLORS.primary, fontFamily: 'InterBold' }}>Log in</Text>
              </Text>
            </Pressable>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
