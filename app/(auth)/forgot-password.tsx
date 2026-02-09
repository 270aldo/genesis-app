import { useState } from 'react';
import { Dimensions, KeyboardAvoidingView, Platform, Pressable, Text, TextInput, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { ArrowLeft, Mail, CheckCircle } from 'lucide-react-native';
import { GENESIS_COLORS } from '../../constants/colors';
import { useAuth } from '../../hooks';

const HERO_IMAGE = 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=900&q=80';
const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [focused, setFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const isValid = email.includes('@') && email.includes('.');

  const handleReset = async () => {
    if (!isValid) return;
    setError('');
    setLoading(true);
    try {
      await resetPassword(email);
      setSent(true);
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

            {sent ? (
              /* ── Success state ── */
              <View style={{ alignItems: 'center', gap: 20, paddingVertical: 20 }}>
                <View style={{
                  width: 72,
                  height: 72,
                  borderRadius: 36,
                  backgroundColor: GENESIS_COLORS.success + '18',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <CheckCircle size={40} color={GENESIS_COLORS.success} />
                </View>

                <Text style={{
                  color: '#FFFFFF',
                  fontSize: 24,
                  fontFamily: 'InterBold',
                  textAlign: 'center',
                }}>
                  Check Your Email
                </Text>

                <Text style={{
                  color: GENESIS_COLORS.textSecondary,
                  fontSize: 14,
                  fontFamily: 'Inter',
                  lineHeight: 20,
                  textAlign: 'center',
                  paddingHorizontal: 16,
                }}>
                  We sent recovery instructions to{'\n'}
                  <Text style={{ color: '#FFFFFF', fontFamily: 'InterBold' }}>{email}</Text>
                </Text>

                <Pressable
                  onPress={() => router.push('/(auth)/login')}
                  style={{ marginTop: 12 }}
                >
                  <LinearGradient
                    colors={[GENESIS_COLORS.primary, GENESIS_COLORS.primaryDark]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{
                      borderRadius: 14,
                      paddingVertical: 16,
                      paddingHorizontal: 40,
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
                      BACK TO LOGIN
                    </Text>
                  </LinearGradient>
                </Pressable>
              </View>
            ) : (
              /* ── Form state ── */
              <>
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
                    RESET PASSWORD
                  </Text>
                  <Text style={{
                    color: GENESIS_COLORS.textSecondary,
                    fontSize: 14,
                    fontFamily: 'Inter',
                    lineHeight: 20,
                  }}>
                    Enter your email and we'll send recovery instructions.
                  </Text>
                </View>

                {/* Email field */}
                <View style={{ gap: 16 }}>
                  <View style={{ gap: 6 }}>
                    <Text style={{
                      color: GENESIS_COLORS.textTertiary,
                      fontSize: 10,
                      fontFamily: 'JetBrainsMonoMedium',
                      letterSpacing: 1.5,
                      textTransform: 'uppercase',
                    }}>
                      Email Address
                    </Text>
                    <View style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      borderWidth: 1,
                      borderColor: focused ? GENESIS_COLORS.borderActive : GENESIS_COLORS.borderSubtle,
                      borderRadius: 14,
                      paddingHorizontal: 16,
                      backgroundColor: 'rgba(255,255,255,0.04)',
                      gap: 10,
                    }}>
                      <Mail size={16} color={GENESIS_COLORS.textMuted} />
                      <TextInput
                        value={email}
                        onChangeText={setEmail}
                        onFocus={() => setFocused(true)}
                        onBlur={() => setFocused(false)}
                        placeholder="you@example.com"
                        placeholderTextColor={GENESIS_COLORS.textMuted}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                        style={{
                          flex: 1,
                          paddingVertical: 14,
                          color: '#FFFFFF',
                          fontFamily: 'Inter',
                          fontSize: 15,
                        }}
                      />
                    </View>
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

                  {/* Send Button */}
                  <Pressable
                    onPress={handleReset}
                    disabled={!isValid || loading}
                    style={{ opacity: isValid && !loading ? 1 : 0.5 }}
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
                        {loading ? 'SENDING...' : 'SEND INSTRUCTIONS'}
                      </Text>
                    </LinearGradient>
                  </Pressable>
                </View>

                {/* Back to login link */}
                <Pressable
                  onPress={() => router.push('/(auth)/login')}
                  style={{ alignItems: 'center', marginTop: 20, paddingVertical: 8 }}
                >
                  <Text style={{
                    color: GENESIS_COLORS.textSecondary,
                    fontSize: 13,
                    fontFamily: 'Inter',
                  }}>
                    Remember your password?{' '}
                    <Text style={{ color: GENESIS_COLORS.primary, fontFamily: 'InterBold' }}>Log in</Text>
                  </Text>
                </Pressable>
              </>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
