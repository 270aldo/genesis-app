import { create } from 'zustand';
import type { EducationContent, PhaseType } from '../types';

type ArticleDetail = {
  body: string;
  genesisTip: string;
};

type EducationState = {
  articles: EducationContent[];
  isLoading: boolean;
  currentArticle: ArticleDetail | null;
  fetchArticles: (category?: string) => Promise<void>;
  fetchArticleDetail: (id: string) => Promise<void>;
};

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

export const useEducationStore = create<EducationState>((set) => ({
  articles: [],
  isLoading: false,
  currentArticle: null,

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
}));
