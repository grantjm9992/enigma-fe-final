// User Types
export type UserRole = 'admin' | 'trainer' | 'user';

export interface User {
  _id: string;
  name: string;
  surname: string;
  email: string;
  phone: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserDto {
  name: string;
  surname: string;
  email: string;
  phone: string;
  role?: UserRole;
  password: string;
}

export interface UpdateUserDto {
  name?: string;
  surname?: string;
  email?: string;
  phone?: string;
  role?: UserRole;
  password?: string;
  isActive?: boolean;
}

// Auth Types
export interface LoginDto {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  user: User;
}

// Exercise Category Types
export interface ExerciseCategory {
  _id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateExerciseCategoryDto {
  name: string;
  description?: string;
}

export interface UpdateExerciseCategoryDto {
  name?: string;
  description?: string;
}

// Tag Types
export interface Tag {
  _id: string;
  name: string;
  color?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTagDto {
  name: string;
  color?: string;
}

export interface UpdateTagDto {
  name?: string;
  color?: string;
}

// Exercise Types
export interface Exercise {
  _id: string;
  name: string;
  categoryId: string;
  category?: ExerciseCategory;
  tagIds: string[];
  tags?: Tag[];
  duration: number;
  description?: string;
  videoUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateExerciseDto {
  name: string;
  categoryId: string;
  tagIds?: string[];
  duration: number;
  description?: string;
  videoUrl?: string;
}

export interface UpdateExerciseDto {
  name?: string;
  categoryId?: string;
  tagIds?: string[];
  duration?: number;
  description?: string;
  videoUrl?: string;
}

// Embedded Exercise (for Routines)
export interface EmbeddedExercise {
  name: string;
  categoryId: string;
  category: string;
  tagIds: string[];
  tags: string[];
  duration: number;
  description?: string;
  videoUrl?: string;
  sets?: number;
  reps?: number;
  restTime?: number;
  notes?: string;
}

// Routine Types
export interface Routine {
  _id: string;
  name: string;
  description?: string;
  exercises: EmbeddedExercise[];
  totalDuration: number;
  difficulty?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRoutineDto {
  name: string;
  description?: string;
  exercises: EmbeddedExercise[];
  difficulty?: string;
}

export interface UpdateRoutineDto {
  name?: string;
  description?: string;
  exercises?: EmbeddedExercise[];
  difficulty?: string;
}

// Session Types
export interface Session {
  _id: string;
  name: string;
  description?: string;
  date: string;
  duration?: number;
  instructorId: string;
  participantIds: string[];
  routines: Routine[];
  location?: string;
  maxParticipants?: number;
  status?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSessionDto {
  name: string;
  description?: string;
  date: string;
  duration?: number;
  instructorId: string;
  participantIds?: string[];
  routines: Routine[];
  location?: string;
  maxParticipants?: number;
  status?: string;
}

export interface UpdateSessionDto {
  name?: string;
  description?: string;
  date?: string;
  duration?: number;
  instructorId?: string;
  participantIds?: string[];
  routines?: Routine[];
  location?: string;
  maxParticipants?: number;
  status?: string;
}

// API Response Types
export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}
