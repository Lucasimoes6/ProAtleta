import { api } from './client';
import type {
  Anamnesis, Athlete, AuthResponse, CreateAnamnesisRequest, Injury, LibraryExercise,
  LibraryExerciseCategory, LibraryExerciseStage, OnboardingStatus,
  PARQResponse, Role, TrainingPlan,
} from '@/types/domain';

export interface MeResponse {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  createdAt: string;
}

export const authApi = {
  login: (email: string, password: string) =>
    api.post<AuthResponse>('/auth/login', { email, password }).then((r) => r.data),
  register: (data: { email: string; password: string; fullName: string; role?: string }) =>
    api.post<AuthResponse>('/auth/register', data).then((r) => r.data),

  me: () => api.get<MeResponse>('/auth/me').then((r) => r.data),
  updateProfile: (data: { fullName: string; email: string }) =>
    api.patch<AuthResponse>('/auth/me', data).then((r) => r.data),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.put<void>('/auth/me/password', data),
  deleteAccount: () => api.delete<void>('/auth/me'),

  requestPasswordReset: (email: string) =>
    api.post<{ ok: boolean; token?: string; expiresAt?: string; message?: string }>(
      '/auth/password-reset/request', { email },
    ).then((r) => r.data),
  confirmPasswordReset: (token: string, newPassword: string) =>
    api.post<void>('/auth/password-reset/confirm', { token, newPassword }),

  onboardingStatus: () =>
    api.get<OnboardingStatus>('/auth/onboarding-status').then((r) => r.data),
};

export const athleteApi = {
  me: () => api.get<Athlete>('/athletes/me').then((r) => r.data),
  upsertMe: (data: Partial<Athlete>) =>
    api.put<Athlete>('/athletes/me', data).then((r) => r.data),
  list: () => api.get<Athlete[]>('/athletes').then((r) => r.data),
  acceptTerms: (data: { responsibilityTerm: boolean; dataUsageTerm: boolean }) =>
    api.post<Athlete>('/athletes/me/terms', data).then((r) => r.data),
};

export const parqApi = {
  submit: (data: {
    q1: boolean; q2: boolean; q3: boolean; q4: boolean;
    q5: boolean; q6: boolean; q7: boolean; acceptedRisk?: boolean;
  }) => api.post<PARQResponse>('/parq', data).then((r) => r.data),
  latest: () => api.get<PARQResponse>('/parq/me/latest').then((r) => r.data),
};

export const exerciseLibraryApi = {
  list: (filters?: {
    category?: LibraryExerciseCategory; stage?: LibraryExerciseStage; region?: string;
  }) => api.get<LibraryExercise[]>('/exercises', { params: filters }).then((r) => r.data),
  get: (id: string) => api.get<LibraryExercise>(`/exercises/${id}`).then((r) => r.data),
};

export const anamnesisApi = {
  create: (data: CreateAnamnesisRequest) =>
    api.post<Anamnesis>('/anamnesis', data).then((r) => r.data),
  latest: () => api.get<Anamnesis>('/anamnesis/me/latest').then((r) => r.data),
  history: () => api.get<Anamnesis[]>('/anamnesis/me').then((r) => r.data),
};

export const trainingApi = {
  generate: () =>
    api.post<TrainingPlan>('/training/plans/generate').then((r) => r.data),
  current: () =>
    api.get<TrainingPlan>('/training/plans/me/current').then((r) => r.data),
  completeSession: (sessionId: string) =>
    api.patch(`/training/sessions/${sessionId}/complete`),
};

export const injuryApi = {
  list: () => api.get<Injury[]>('/injuries/me').then((r) => r.data),
  create: (data: Partial<Injury>) =>
    api.post<Injury>('/injuries', data).then((r) => r.data),
  resolve: (id: string) =>
    api.patch<Injury>(`/injuries/${id}/resolve`).then((r) => r.data),
};
