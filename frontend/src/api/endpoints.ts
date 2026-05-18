import { api } from './client';
import type {
  Anamnesis, Athlete, AuthResponse, Injury, TrainingPlan,
} from '@/types/domain';

export const authApi = {
  login: (email: string, password: string) =>
    api.post<AuthResponse>('/auth/login', { email, password }).then((r) => r.data),
  register: (data: { email: string; password: string; fullName: string; role?: string }) =>
    api.post<AuthResponse>('/auth/register', data).then((r) => r.data),
};

export const athleteApi = {
  me: () => api.get<Athlete>('/athletes/me').then((r) => r.data),
  upsertMe: (data: Partial<Athlete>) =>
    api.put<Athlete>('/athletes/me', data).then((r) => r.data),
  list: () => api.get<Athlete[]>('/athletes').then((r) => r.data),
};

export const anamnesisApi = {
  create: (data: Partial<Anamnesis>) =>
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
