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

const bffUrl = process.env.EXPO_PUBLIC_BFF_URL ?? 'http://localhost:8000';

function getAuthHeaders(): Record<string, string> {
  const token = useAuthStore.getState().session?.access_token;
  if (token) return { Authorization: `Bearer ${token}` };
  return {};
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${bffUrl}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
      ...(init?.headers ?? {}),
    },
  });

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
};
