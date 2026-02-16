import { useEffect } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Sparkles } from 'lucide-react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ImageCard } from '../../components/cards';
import { GlassCard } from '../../components/ui';
import { GENESIS_COLORS } from '../../constants/colors';
import { PHASE_CONFIG } from '../../data';
import { useEducationStore, useSeasonStore } from '../../stores';
import type { PhaseType } from '../../types';

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: GENESIS_COLORS.success,
  intermediate: GENESIS_COLORS.warning,
  advanced: GENESIS_COLORS.error,
};

export default function EducationDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { currentPhase } = useSeasonStore();
  const phase = (currentPhase || 'hypertrophy') as PhaseType;
  const phaseConfig = PHASE_CONFIG[phase];

  const { articles, isLoading, currentArticle, fetchArticles, fetchArticleDetail } = useEducationStore();

  // Ensure article list is loaded (may already be cached from education screen)
  useEffect(() => {
    if (articles.length === 0) {
      fetchArticles();
    }
  }, []);

  // Fetch full article detail (body + genesis tip)
  useEffect(() => {
    if (id) {
      fetchArticleDetail(id);
      useEducationStore.getState().markArticleAsRead(id);
    }
  }, [id]);

  const content = articles.find((e) => e.id === id);

  if (!content && !isLoading) {
    return (
      <LinearGradient colors={[GENESIS_COLORS.bgGradientStart, GENESIS_COLORS.bgGradientEnd]} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: GENESIS_COLORS.textTertiary, fontFamily: 'Inter', fontSize: 16 }}>Content not found</Text>
      </LinearGradient>
    );
  }

  if (!content || isLoading) {
    return (
      <LinearGradient colors={[GENESIS_COLORS.bgGradientStart, GENESIS_COLORS.bgGradientEnd]} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color={phaseConfig.color} />
      </LinearGradient>
    );
  }

  const paragraphs = currentArticle?.body
    ? currentArticle.body.split('\n\n').filter((p) => p.trim().length > 0)
    : ['This educational content provides in-depth coverage of the topic. Check back for the full article.'];
  const genesisTip = currentArticle?.genesisTip || 'Stay consistent and trust the process. GENESIS is adapting your plan in real time.';

  return (
    <LinearGradient colors={[GENESIS_COLORS.bgGradientStart, GENESIS_COLORS.bgGradientEnd]} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero */}
          <View>
            <ImageCard imageUrl={content.imageUrl} height={240} />
            <Pressable
              onPress={() => router.back()}
              hitSlop={12}
              style={{
                position: 'absolute',
                top: 12,
                left: 16,
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: 'rgba(0,0,0,0.7)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ArrowLeft size={20} color="#FFFFFF" />
            </Pressable>
          </View>

          <View style={{ paddingHorizontal: 20, paddingTop: 16, gap: 24 }}>
            {/* Title + meta */}
            <View style={{ gap: 10 }}>
              <Text style={{ color: '#FFFFFF', fontSize: 22, fontFamily: 'InterBold' }}>
                {content.title}
              </Text>
              <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                <View style={{ backgroundColor: phaseConfig.color + '20', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5 }}>
                  <Text style={{ color: phaseConfig.accentColor, fontSize: 11, fontFamily: 'JetBrainsMonoMedium' }}>
                    {content.category}
                  </Text>
                </View>
                <View style={{ backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5 }}>
                  <Text style={{ color: GENESIS_COLORS.textSecondary, fontSize: 11, fontFamily: 'JetBrainsMonoMedium' }}>
                    {content.duration}
                  </Text>
                </View>
                <View style={{ backgroundColor: DIFFICULTY_COLORS[content.difficulty] + '20', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5 }}>
                  <Text style={{ color: DIFFICULTY_COLORS[content.difficulty], fontSize: 11, fontFamily: 'JetBrainsMonoMedium' }}>
                    {content.difficulty}
                  </Text>
                </View>
              </View>
            </View>

            {/* Body */}
            <View style={{ gap: 16 }}>
              {paragraphs.map((p, i) => (
                <Text key={i} style={{ color: GENESIS_COLORS.textSecondary, fontSize: 14, fontFamily: 'Inter', lineHeight: 22 }}>
                  {p}
                </Text>
              ))}
            </View>

            {/* GENESIS Tip */}
            <GlassCard shine>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <Sparkles size={14} color={phaseConfig.accentColor} />
                <Text style={{ color: phaseConfig.accentColor, fontSize: 11, fontFamily: 'JetBrainsMonoSemiBold' }}>
                  GENESIS INSIGHT
                </Text>
              </View>
              <Text style={{ color: GENESIS_COLORS.textSecondary, fontSize: 13, fontFamily: 'Inter', lineHeight: 19 }}>
                {genesisTip}
              </Text>
            </GlassCard>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}
