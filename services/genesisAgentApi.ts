import type {
  CheckIn,
  CheckInPayload,
  ExerciseLog,
  ExerciseLogPayload,
  GenesisMessageInput,
  GenesisResponse,
  GetSessionsParams,
  SessionResponse,
  StrengthProgressResponse,
  TodayPlanResponse,
  TrackStatsResponse,
  User,
} from '../types';
import { useAuthStore } from '../stores/useAuthStore';
import { supabaseClient, hasSupabaseConfig } from './supabaseClient';

const bffUrl = process.env.EXPO_PUBLIC_BFF_URL ?? 'http://localhost:8000';

function getAccessToken(): string | undefined {
  return useAuthStore.getState().session?.access_token;
}

async function refreshSession(): Promise<string | null> {
  if (!hasSupabaseConfig) return null;
  try {
    const { data, error } = await supabaseClient.auth.refreshSession();
    if (error || !data.session) {
      console.warn('Session refresh failed:', error?.message);
      return null;
    }
    // Update auth store with fresh session
    useAuthStore.getState().setSession(data.session);
    return data.session.access_token;
  } catch (err: any) {
    console.warn('Session refresh error:', err?.message);
    return null;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getAccessToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init?.headers as Record<string, string> ?? {}),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${bffUrl}${path}`, {
    ...init,
    headers,
  });

  // Handle 401 — attempt token refresh and retry once
  if (response.status === 401) {
    let reason: string | undefined;
    try {
      const body = await response.clone().json();
      reason = body?.detail?.reason;
    } catch {
      // body wasn't JSON
    }

    if (reason === 'expired' || reason === 'missing_token') {
      const newToken = await refreshSession();
      if (newToken) {
        // Retry with fresh token
        headers.Authorization = `Bearer ${newToken}`;
        const retryResponse = await fetch(`${bffUrl}${path}`, {
          ...init,
          headers,
        });
        if (retryResponse.ok) {
          return (await retryResponse.json()) as T;
        }
        // Retry also failed
        const retryBody = await retryResponse.text();
        throw new Error(`BFF ${retryResponse.status}: ${retryBody}`);
      }

      // Refresh failed — redirect to login
      useAuthStore.getState().logout();
      throw new Error('Session expired — please log in again');
    }

    // Invalid token (not expired) — force logout
    useAuthStore.getState().logout();
    const body = await response.text();
    throw new Error(`BFF 401: ${body}`);
  }

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`BFF ${response.status}: ${body}`);
  }

  return (await response.json()) as T;
}

export const genesisAgentApi = {
  async sendMessage(input: GenesisMessageInput): Promise<GenesisResponse> {
    return request<GenesisResponse>('/mobile/chat', {
      method: 'POST',
      body: JSON.stringify({
        message: input.message,
        agent_id: input.agentId,
        conversation_id: input.conversationId ?? undefined,
      }),
    });
  },

  async getProfile(): Promise<User> {
    const payload = await request<{ profile: User } | User>('/mobile/profile');
    return 'profile' in payload ? payload.profile : payload;
  },

  async createCheckIn(payload: CheckInPayload): Promise<CheckIn> {
    return request<CheckIn>('/mobile/check-in', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async getSessions(params?: GetSessionsParams): Promise<SessionResponse> {
    const query = params?.range
      ? `?from=${encodeURIComponent(params.range.from ?? '')}&to=${encodeURIComponent(params.range.to ?? '')}`
      : '';
    const payload = await request<SessionResponse | { data: SessionResponse }>(`/mobile/sessions${query}`);
    return 'data' in payload ? payload.data : payload;
  },

  async logExercise(payload: ExerciseLogPayload): Promise<ExerciseLog> {
    return request<ExerciseLog>('/mobile/exercise-log', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async getTodayPlan(): Promise<TodayPlanResponse> {
    return request<TodayPlanResponse>('/mobile/training/today');
  },

  async getTrackStats(): Promise<TrackStatsResponse> {
    return request<TrackStatsResponse>('/mobile/track/stats');
  },

  async getStrengthProgress(exerciseName?: string): Promise<StrengthProgressResponse> {
    const query = exerciseName ? `?exercise_name=${encodeURIComponent(exerciseName)}` : '';
    return request<StrengthProgressResponse>(`/mobile/track/strength-progress${query}`);
  },

  async getExercises(params?: { muscleGroup?: string; search?: string }): Promise<{ exercises: any[] }> {
    const query = new URLSearchParams();
    if (params?.muscleGroup) query.set('muscle_group', params.muscleGroup);
    if (params?.search) query.set('search', params.search);
    const qs = query.toString();
    return request<{ exercises: any[] }>(`/mobile/exercises${qs ? `?${qs}` : ''}`);
  },

  async getEducation(category?: string): Promise<{ articles: any[] }> {
    const query = category ? `?category=${encodeURIComponent(category)}` : '';
    return request<{ articles: any[] }>(`/mobile/education${query}`);
  },

  async getEducationDetail(articleId: string): Promise<any> {
    return request<any>(`/mobile/education/${articleId}`);
  },
};
