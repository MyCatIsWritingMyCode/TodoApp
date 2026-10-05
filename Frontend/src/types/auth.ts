// Authentication Domain Types for ChoreQuest & ASP.NET Core Backend

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  role: 'User' | 'Admin' | string;
  token: string;
  expiresAt: string;
}

export interface UserProfileResponse {
  id: number;
  username: string;
  email: string;
  role: string;
  createdAt: string;
  lastLoginAt?: string;
  totalTodos: number;
  completedTodos: number;
}

export interface LoginRequest {
  usernameOrEmail: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
