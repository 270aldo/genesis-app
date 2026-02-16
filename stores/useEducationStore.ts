import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { EducationContent, PhaseType } from '../types';

type ArticleDetail = {
  body: string;
  genesisTip: string;
};

type EducationState = {
  articles: EducationContent[];
  isLoading: boolean;
  currentArticle: ArticleDetail | null;
  readArticleIds: string[];
  fetchArticles: (category?: string) => Promise<void>;
  fetchArticleDetail: (id: string) => Promise<void>;
  loadReadArticles: () => Promise<void>;
  markArticleAsRead: (articleId: string) => Promise<void>;
};

const READ_ARTICLES_KEY = 'genesis_readArticles';

/**
 * Ranks articles: phase-relevant first, unread before read, then original order.
 */
export function getPhaseRankedArticles(
  articles: EducationContent[],
  currentPhase: string | null,
  readArticleIds: string[],
): EducationContent[] {
  const readSet = new Set(readArticleIds);
  return [...articles].sort((a, b) => {
    const aRelevant = currentPhase && a.relevantPhases.includes(currentPhase as PhaseType) ? 0 : 1;
    const bRelevant = currentPhase && b.relevantPhases.includes(currentPhase as PhaseType) ? 0 : 1;
    if (aRelevant !== bRelevant) return aRelevant - bRelevant;

    const aRead = readSet.has(a.id) ? 1 : 0;
    const bRead = readSet.has(b.id) ? 1 : 0;
    return aRead - bRead;
  });
}

/**
 * Maps a Supabase education_content row to the app's EducationContent type.
 */
function mapRowToEducationContent(row: any): EducationContent {
  return {
    id: row.id,
    title: row.title,
    subtitle: row.subtitle ?? '',
    type: row.type ?? 'micro_lesson',
    category: row.category,
    imageUrl: row.image_url ?? '',
    duration: row.duration_min != null ? `${row.duration_min} min` : '',
    relevantPhases: (row.phase_tags ?? []) as PhaseType[],
    difficulty: row.difficulty ?? 'beginner',
    completed: false,
    progress: 0,
  };
}

export const useEducationStore = create<EducationState>((set, get) => ({
  articles: [],
  isLoading: false,
  currentArticle: null,
  readArticleIds: [],

  fetchArticles: async (category?: string) => {
    set({ isLoading: true });
    try {
      const { genesisAgentApi } = await import('../services/genesisAgentApi');
      const data = await genesisAgentApi.getEducation(category);
      const articles = (data.articles || []).map(mapRowToEducationContent);
      set({ articles, isLoading: false });
    } catch (err: any) {
      console.warn('fetchArticles failed:', err?.message);
      set({ articles: [], isLoading: false });
    }
  },

  fetchArticleDetail: async (id: string) => {
    set({ currentArticle: null, isLoading: true });
    try {
      const { genesisAgentApi } = await import('../services/genesisAgentApi');
      const data = await genesisAgentApi.getEducationDetail(id);
      set({
        currentArticle: {
          body: data?.body_md ?? '',
          genesisTip: data?.genesis_tip ?? 'Stay consistent and trust the process. GENESIS is adapting your plan in real time.',
        },
        isLoading: false,
      });
    } catch (err: any) {
      console.warn('fetchArticleDetail failed:', err?.message);
      set({ currentArticle: null, isLoading: false });
    }
  },

  loadReadArticles: async () => {
    try {
      const stored = await AsyncStorage.getItem(READ_ARTICLES_KEY);
      if (stored) {
        set({ readArticleIds: JSON.parse(stored) });
      }
    } catch (e) {
      console.warn('Failed to load read articles:', e);
    }
  },

  markArticleAsRead: async (articleId: string) => {
    const { readArticleIds } = get();
    if (readArticleIds.includes(articleId)) return;
    const updated = [...readArticleIds, articleId];
    set({ readArticleIds: updated });
    try {
      await AsyncStorage.setItem(READ_ARTICLES_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save read articles:', e);
    }
  },
}));
