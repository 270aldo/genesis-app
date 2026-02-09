import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Dimensions, KeyboardAvoidingView, Platform, Pressable, Text, TextInput, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Eye, EyeOff } from 'lucide-react-native';
import { GENESIS_COLORS } from '../../constants/colors';
import { useAuth } from '../../hooks';

const HERO_IMAGE = 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=900&q=80';
const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);
  const { signIn, isLoading, error } = useAuth();

  const handleSignIn = async () => {
    try {
      await signIn(email, password);
    } catch {
      // error is set in the store
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#000000' }}>
      {/* Hero background image */}
      <Image
        source={{ uri: HERO_IMAGE }}
        contentFit="cover"
        style={{ position: 'absolute', width: '100%', height: SCREEN_HEIGHT * 0.45 }}
        transition={400}
      />

      {/* Gradient overlay fading into black */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.4)', 'rgba(0,0,0,0.95)', '#000000']}
        locations={[0, 0.25, 0.45, 0.55]}
        style={{ position: 'absolute', width: '100%', height: SCREEN_HEIGHT * 0.55 }}
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
            {/* Branding */}
            <View style={{ gap: 8, marginBottom: 40 }}>
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
                fontSize: 36,
                fontFamily: 'InterBold',
                letterSpacing: -0.5,
              }}>
                GENESIS
              </Text>
              <Text style={{
                color: GENESIS_COLORS.textSecondary,
                fontSize: 14,
                fontFamily: 'Inter',
                lineHeight: 20,
              }}>
                Your AI-powered performance system.
              </Text>
            </View>

            {/* Form */}
            <View style={{ gap: 16 }}>
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
                    placeholder="Enter password"
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

              {/* Forgot password */}
              <Pressable
                onPress={() => router.push('/(auth)/forgot-password')}
                style={{ alignSelf: 'flex-end' }}
              >
                <Text style={{
                  color: GENESIS_COLORS.textSecondary,
                  fontSize: 12,
                  fontFamily: 'Inter',
                }}>
                  Forgot password?
                </Text>
              </Pressable>

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

              {/* Sign In Button */}
              <Pressable
                onPress={handleSignIn}
                disabled={isLoading || !email.includes('@') || password.length < 1}
                style={{ opacity: isLoading ? 0.6 : 1 }}
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
                    {isLoading ? 'SIGNING IN...' : 'SIGN IN'}
                  </Text>
                </LinearGradient>
              </Pressable>
            </View>

            {/* Divider */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 28 }}>
              <View style={{ flex: 1, height: 1, backgroundColor: GENESIS_COLORS.borderSubtle }} />
              <Text style={{ color: GENESIS_COLORS.textMuted, fontSize: 11, fontFamily: 'JetBrainsMonoMedium' }}>OR</Text>
              <View style={{ flex: 1, height: 1, backgroundColor: GENESIS_COLORS.borderSubtle }} />
            </View>

            {/* Sign Up link */}
            <Pressable
              onPress={() => router.push('/(auth)/sign-up')}
              style={{
                marginTop: 20,
                borderRadius: 14,
                paddingVertical: 16,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: GENESIS_COLORS.borderSubtle,
                backgroundColor: 'rgba(255,255,255,0.03)',
              }}
            >
              <Text style={{
                color: '#FFFFFF',
                fontSize: 14,
                fontFamily: 'JetBrainsMonoMedium',
                letterSpacing: 0.5,
              }}>
                CREATE ACCOUNT
              </Text>
            </Pressable>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
