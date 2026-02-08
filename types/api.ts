import type { AgentId, ChatMessage, DateRange, Exercise, User, WellnessCheckIn, WidgetPayload, WorkoutSession } from './models';

export interface GenesisMessageInput {
  message: string;
  agentId?: AgentId;
}

export interface GenesisResponse {
  id: string;
  response: string;
  messages?: ChatMessage[];
  widgets?: WidgetPayload[];
}

export interface CheckInPayload extends WellnessCheckIn {
  notes?: string;
}

export interface CheckIn {
  id: string;
  userId: string;
  createdAt: string;
  payload: CheckInPayload;
}

export interface SessionResponse {
  sessions: WorkoutSession[];
}

export interface ExerciseLogPayload {
  sessionId: string;
  exercise: Exercise;
  notes?: string;
}

export interface ExerciseLog {
  id: string;
  sessionId: string;
  createdAt: string;
  payload: ExerciseLogPayload;
}

export interface ProfileResponse {
  profile: User;
}

export interface GetSessionsParams {
  range?: DateRange;
}
