import axios from 'axios';
import { useAuthStore } from '@/store/auth';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    // 401: token inválido/ausente. 403: token estruturalmente válido mas o
    // usuário foi removido (ex.: reset do banco em dev) — efeito é o mesmo.
    const status = err.response?.status;
    if (status === 401 || status === 403) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(err);
  },
);
