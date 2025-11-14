import axios from 'axios';
import type {
  User, CreateUserDto, UpdateUserDto,
  LoginDto, LoginResponse,
  ExerciseCategory, CreateExerciseCategoryDto, UpdateExerciseCategoryDto,
  Tag, CreateTagDto, UpdateTagDto,
  Exercise, CreateExerciseDto, UpdateExerciseDto,
  Routine, CreateRoutineDto, UpdateRoutineDto,
  Session, CreateSessionDto, UpdateSessionDto,
} from '../types/api';

const API_BASE_URL = 'https://enigma-ts-production.up.railway.app';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authApi = {
  login: (data: LoginDto) =>
    api.post<LoginResponse>('/auth/login', data),

  getProfile: () =>
    api.get<User>('/auth/profile'),

  requestPasswordReset: (email: string) =>
    api.post('/auth/request-password-reset', { email }),

  resetPassword: (token: string, newPassword: string) =>
    api.post('/auth/reset-password', { token, newPassword }),
};

// Users API
export const usersApi = {
  getAll: (role?: string) =>
    api.get<User[]>('/users', { params: { role } }),

  getById: (id: string) =>
    api.get<User>(`/users/${id}`),

  create: (data: CreateUserDto) =>
    api.post<User>('/users', data),

  update: (id: string, data: UpdateUserDto) =>
    api.put<User>(`/users/${id}`, data),

  delete: (id: string) =>
    api.delete(`/users/${id}`),
};

// Exercise Categories API
export const categoriesApi = {
  getAll: () =>
    api.get<ExerciseCategory[]>('/exercise-categories'),

  getById: (id: string) =>
    api.get<ExerciseCategory>(`/exercise-categories/${id}`),

  create: (data: CreateExerciseCategoryDto) =>
    api.post<ExerciseCategory>('/exercise-categories', data),

  update: (id: string, data: UpdateExerciseCategoryDto) =>
    api.put<ExerciseCategory>(`/exercise-categories/${id}`, data),

  delete: (id: string) =>
    api.delete(`/exercise-categories/${id}`),
};

// Tags API
export const tagsApi = {
  getAll: () =>
    api.get<Tag[]>('/tags'),

  getById: (id: string) =>
    api.get<Tag>(`/tags/${id}`),

  create: (data: CreateTagDto) =>
    api.post<Tag>('/tags', data),

  update: (id: string, data: UpdateTagDto) =>
    api.put<Tag>(`/tags/${id}`, data),

  delete: (id: string) =>
    api.delete(`/tags/${id}`),
};

// Exercises API
export const exercisesApi = {
  getAll: (categoryId?: string, tagIds?: string) =>
    api.get<Exercise[]>('/exercises', { params: { categoryId, tagIds } }),

  getById: (id: string) =>
    api.get<Exercise>(`/exercises/${id}`),

  create: (data: CreateExerciseDto) =>
    api.post<Exercise>('/exercises', data),

  update: (id: string, data: UpdateExerciseDto) =>
    api.put<Exercise>(`/exercises/${id}`, data),

  delete: (id: string) =>
    api.delete(`/exercises/${id}`),
};

// Routines API
export const routinesApi = {
  getAll: () =>
    api.get<Routine[]>('/routines'),

  getById: (id: string) =>
    api.get<Routine>(`/routines/${id}`),

  create: (data: CreateRoutineDto) =>
    api.post<Routine>('/routines', data),

  update: (id: string, data: UpdateRoutineDto) =>
    api.put<Routine>(`/routines/${id}`, data),

  delete: (id: string) =>
    api.delete(`/routines/${id}`),
};

// Sessions API
export const sessionsApi = {
  getAll: (startDate?: string, endDate?: string, instructor?: string) =>
    api.get<Session[]>('/sessions', { params: { startDate, endDate, instructor } }),

  getById: (id: string) =>
    api.get<Session>(`/sessions/${id}`),

  create: (data: CreateSessionDto) =>
    api.post<Session>('/sessions', data),

  update: (id: string, data: UpdateSessionDto) =>
    api.put<Session>(`/sessions/${id}`, data),

  delete: (id: string) =>
    api.delete(`/sessions/${id}`),
};

export default api;
