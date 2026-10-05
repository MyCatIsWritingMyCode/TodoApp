import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ChoreQuestTask, FamilyMember, HouseholdState, PerkItem, StickyNote, DailyHeatmapDay, TaskPriority } from '../types/household';
import { AuthUser, LoginRequest, RegisterRequest, UserProfileResponse } from '../types/auth';
import { INITIAL_HOUSEHOLD, INITIAL_MEMBERS, INITIAL_STICKY_NOTES, INITIAL_PERKS, generateInitialHeatmap } from './mockData';

// Port 5287 matches the ASP.NET Core launchSettings.json profile
const getBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:5287/api';
  }
  return 'http://localhost:5287/api';
};

const BASE_URL = getBaseUrl();
const TIMEOUT_MS = 3000;
const TOKEN_KEY = '@chorequest_jwt_token';
const USER_KEY = '@chorequest_auth_user';

let cachedToken: string | null = null;

// Initialize token from storage
async function getStoredToken(): Promise<string | null> {
  if (cachedToken) return cachedToken;
  try {
    cachedToken = await AsyncStorage.getItem(TOKEN_KEY);
    return cachedToken;
  } catch {
    return null;
  }
}

async function fetchWithTimeout(url: string, options: RequestInit = {}): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), TIMEOUT_MS);

  // Automatically inject Bearer token if available
  const token = await getStoredToken();
  const headers = new Headers(options.headers || {});
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  try {
    const res = await fetch(url, { ...options, headers, signal: controller.signal });
    clearTimeout(id);
    return res;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

// Convert Backend Todo item to ChoreQuestTask
function mapBackendTodoToChoreQuest(item: any): ChoreQuestTask {
  const priorityMap: Record<number, TaskPriority> = {
    0: 'Low',
    1: 'Medium',
    2: 'High',
  };

  return {
    id: String(item.id),
    title: item.title,
    description: item.description ?? '',
    isCompleted: !!item.isCompleted,
    priority: priorityMap[item.priority] ?? 'Medium',
    dueDate: item.dueDate ? item.dueDate.split('T')[0] : undefined,
    category: item.category ?? 'daily',
    xpReward: item.xpReward ?? (item.priority === 2 ? 25 : item.priority === 1 ? 20 : 15),
    createdAt: item.createdAt ?? new Date().toISOString(),
    completedAt: item.completedAt,
    assignedMemberId: item.userId ? String(item.userId) : undefined,
  };
}

export const api = {
  /**
   * Health Check to see if ASP.NET Core backend is reachable
   */
  async checkBackendHealth(): Promise<boolean> {
    try {
      // Check /health endpoint
      const healthUrl = BASE_URL.replace('/api', '/health');
      const res = await fetchWithTimeout(healthUrl, { method: 'GET' });
      return res.ok;
    } catch {
      try {
        const res = await fetchWithTimeout(`${BASE_URL}/todos`, { method: 'GET' });
        return res.ok || res.status === 401; // 401 confirms API server is up and enforcing auth
      } catch {
        return false;
      }
    }
  },

  // =========================================================================
  // AUTHENTICATION & IDENTITY ENDPOINTS (Backend/Endpoints/AuthEndpoints.cs)
  // =========================================================================

  /**
   * Log in with username/email and password against ASP.NET Core
   */
  async login(credentials: LoginRequest): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
    try {
      const res = await fetchWithTimeout(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      if (res.ok) {
        const user: AuthUser = await res.json();
        cachedToken = user.token;
        await AsyncStorage.setItem(TOKEN_KEY, user.token);
        await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
        return { success: true, user };
      }

      if (res.status === 401) {
        return { success: false, error: 'Invalid username, email, or password.' };
      }

      const errBody = await res.json().catch(() => null);
      return { success: false, error: errBody?.detail ?? errBody?.title ?? 'Login failed. Please check your credentials.' };
    } catch {
      return { success: false, error: 'Unable to connect to the cloud service. Please check your connection.' };
    }
  },

  /**
   * Register a new user account against ASP.NET Core
   */
  async register(credentials: RegisterRequest): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
    try {
      const res = await fetchWithTimeout(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      if (res.ok || res.status === 201) {
        const user: AuthUser = await res.json();
        cachedToken = user.token;
        await AsyncStorage.setItem(TOKEN_KEY, user.token);
        await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
        return { success: true, user };
      }

      if (res.status === 409) {
        return { success: false, error: 'Username or email already in use.' };
      }

      const errBody = await res.json().catch(() => null);
      return { success: false, error: errBody?.detail ?? errBody?.title ?? 'Registration failed. Check requirements.' };
    } catch {
      return { success: false, error: 'Unable to connect to the cloud service. Please check your connection.' };
    }
  },

  /**
   * Fetch current authenticated user profile
   */
  async getMe(): Promise<UserProfileResponse | null> {
    try {
      const res = await fetchWithTimeout(`${BASE_URL}/auth/me`);
      if (res.ok) {
        return await res.json();
      }
    } catch {}
    return null;
  },

  /**
   * Log out and clear saved token
   */
  async logout(): Promise<void> {
    cachedToken = null;
    await AsyncStorage.removeItem(TOKEN_KEY);
    await AsyncStorage.removeItem(USER_KEY);
  },

  /**
   * Get cached or stored user session
   */
  async getStoredSession(): Promise<AuthUser | null> {
    try {
      const userStr = await AsyncStorage.getItem(USER_KEY);
      if (userStr) {
        const user: AuthUser = JSON.parse(userStr);
        cachedToken = user.token;
        return user;
      }
    } catch {}
    return null;
  },

  // =========================================================================
  // TASK ENDPOINTS (Backend/Endpoints/TodoEndpoints.cs)
  // =========================================================================

  /**
   * Fetch Todos from backend for authenticated user
   */
  async getTasks(): Promise<ChoreQuestTask[]> {
    try {
      const res = await fetchWithTimeout(`${BASE_URL}/todos`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          return data.map(mapBackendTodoToChoreQuest);
        }
      }
    } catch {
      // Backend offline or endpoint not yet reachable
    }
    return [];
  },

  /**
   * Toggle task completion on backend
   */
  async toggleTaskCompletion(taskId: string, isCompleted: boolean): Promise<boolean> {
    try {
      const numId = parseInt(taskId, 10);
      if (!isNaN(numId)) {
        const res = await fetchWithTimeout(`${BASE_URL}/todos/${numId}/toggle`, {
          method: 'PATCH',
        });
        return res.ok;
      }
    } catch {}
    return true;
  },

  /**
   * Create task on backend
   */
  async createTask(task: Partial<ChoreQuestTask>): Promise<{ success: boolean; data?: ChoreQuestTask }> {
    try {
      const priorityMap: Record<TaskPriority, number> = {
        Low: 0,
        Medium: 1,
        High: 2,
      };

      const payload = {
        title: task.title,
        description: task.description ?? null,
        priority: task.priority ? priorityMap[task.priority] : 1,
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString() : null,
        category: task.category ?? 'daily',
        xpReward: task.xpReward ?? 15,
        recurrence: task.recurrence ?? null,
      };

      const res = await fetchWithTimeout(`${BASE_URL}/todos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const created = await res.json();
        return { success: true, data: mapBackendTodoToChoreQuest(created) };
      }
    } catch {}
    return { success: false };
  },

  /**
   * Delete task on backend
   */
  async deleteTask(taskId: string): Promise<boolean> {
    try {
      const numId = parseInt(taskId, 10);
      if (!isNaN(numId)) {
        const res = await fetchWithTimeout(`${BASE_URL}/todos/${numId}`, {
          method: 'DELETE',
        });
        return res.ok;
      }
    } catch {}
    return true;
  },

  // =========================================================================
  // HOUSEHOLD GAMIFICATION ENDPOINTS (Local / Mock / Backend)
  // =========================================================================

  async getHousehold(): Promise<HouseholdState> {
    try {
      const res = await fetchWithTimeout(`${BASE_URL}/household`);
      if (res.ok) return await res.json();
    } catch {}
    return INITIAL_HOUSEHOLD;
  },

  async getMembers(): Promise<FamilyMember[]> {
    try {
      const res = await fetchWithTimeout(`${BASE_URL}/household/members`);
      if (res.ok) return await res.json();
    } catch {}
    return INITIAL_MEMBERS;
  },

  async getStickyNotes(): Promise<StickyNote[]> {
    try {
      const res = await fetchWithTimeout(`${BASE_URL}/household/notes`);
      if (res.ok) return await res.json();
    } catch {}
    return INITIAL_STICKY_NOTES;
  },

  async getPerks(): Promise<PerkItem[]> {
    try {
      const res = await fetchWithTimeout(`${BASE_URL}/household/skills`);
      if (res.ok) return await res.json();
    } catch {}
    return INITIAL_PERKS;
  },

  async getHeatmapHistory(): Promise<DailyHeatmapDay[]> {
    try {
      const res = await fetchWithTimeout(`${BASE_URL}/household/heatmap`);
      if (res.ok) return await res.json();
    } catch {}
    return generateInitialHeatmap();
  },
};
