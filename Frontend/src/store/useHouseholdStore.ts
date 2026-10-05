import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ChoreQuestTask,
  FamilyMember,
  HouseholdState,
  PerkItem,
  StickyNote,
  DailyHeatmapDay,
  TaskCategory,
} from '../types/household';
import { AuthUser, LoginRequest, RegisterRequest } from '../types/auth';
import {
  INITIAL_HOUSEHOLD,
  INITIAL_MEMBERS,
  INITIAL_STICKY_NOTES,
  INITIAL_PERKS,
  generateInitialHeatmap,
  LEVEL_MILESTONES,
} from '../services/mockData';
import { SubscriptionTier, SUBSCRIPTION_PLANS, canAddMember, getLevelCap } from '../config/plans.config';
import { triggerTaskCelebration, triggerPerkCelebration } from '../services/celebration';
import { api } from '../services/api';

interface HouseholdStoreState {
  household: HouseholdState;
  members: FamilyMember[];
  currentMemberId: string;
  activeMemberFilterId: string; // 'all' or member ID
  tasks: ChoreQuestTask[];
  notes: StickyNote[];
  perks: PerkItem[];
  heatmap: DailyHeatmapDay[];
  activeCategory: TaskCategory;
  searchQuery: string;
  filterStatus: 'all' | 'pending' | 'completed';
  selectedGroupFilter: string; // 'all' or group name
  groupByRoom: boolean;
  notificationsEnabled: boolean;
  isBackendConnected: boolean;

  // Authentication State
  authUser: AuthUser | null;
  authInitialized: boolean;
  authLoading: boolean;
  authError: string | null;

  // Auth Actions
  login: (credentials: LoginRequest) => Promise<boolean>;
  register: (credentials: RegisterRequest) => Promise<boolean>;
  logout: () => Promise<void>;
  restoreAuthSession: () => Promise<void>;
  clearAuthError: () => void;

  // UI Actions
  setActiveCategory: (cat: TaskCategory) => void;
  setActiveMemberFilterId: (id: string) => void;
  setSearchQuery: (query: string) => void;
  setFilterStatus: (status: 'all' | 'pending' | 'completed') => void;
  setSelectedGroupFilter: (group: string) => void;
  setGroupByRoom: (enabled: boolean) => void;
  setCurrentMemberId: (id: string) => void;
  toggleNotifications: (enabled: boolean) => void;

  // Task Actions
  toggleTask: (taskId: string) => Promise<void>;
  toggleSubtask: (taskId: string, subtaskId: string) => Promise<void>;
  addTask: (task: Omit<ChoreQuestTask, 'id' | 'createdAt' | 'isCompleted'>) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  updateTask: (task: ChoreQuestTask) => Promise<void>;

  // Family Member Actions
  addMember: (member: Omit<FamilyMember, 'id' | 'xpContributed' | 'tasksCompleted' | 'level'>) => { success: boolean; message?: string };
  updateMember: (member: FamilyMember) => void;

  // Perk / Skill Tree Actions
  unlockPerk: (perkId: string) => Promise<boolean>;

  // Sticky Notes Actions
  addNote: (note: Omit<StickyNote, 'id' | 'createdAt'>) => void;
  deleteNote: (id: string) => void;
  togglePinNote: (id: string) => void;

  // Subscription Actions
  upgradeTier: (tier: SubscriptionTier) => void;

  // Backend Sync
  refreshFromBackend: () => Promise<void>;
}

export const useHouseholdStore = create<HouseholdStoreState>()(
  persist(
    (set, get) => ({
      household: INITIAL_HOUSEHOLD,
      members: INITIAL_MEMBERS,
      currentMemberId: 'mem-1',
      activeMemberFilterId: 'all',
      tasks: [],
      notes: INITIAL_STICKY_NOTES,
      perks: INITIAL_PERKS,
      heatmap: generateInitialHeatmap(),
      activeCategory: 'daily',
      searchQuery: '',
      filterStatus: 'all',
      selectedGroupFilter: 'all',
      groupByRoom: true,
      notificationsEnabled: true,
      isBackendConnected: false,

      authUser: null,
      authInitialized: false,
      authLoading: false,
      authError: null,

      clearAuthError: () => set({ authError: null }),

      login: async (credentials) => {
        set({ authLoading: true, authError: null });
        const result = await api.login(credentials);
        if (result.success && result.user) {
          const state = get();
          const ownerName = result.user.username;
          const updatedMembers = state.members.map((m, idx) =>
            idx === 0 ? { ...m, name: `${ownerName} (You)` } : m
          );

          set({
            authUser: result.user,
            authLoading: false,
            authError: null,
            members: updatedMembers,
            household: {
              ...state.household,
              name: `${ownerName}'s Family`,
            },
            tasks: [],
          });

          // Refresh user's todos from ASP.NET Core
          await get().refreshFromBackend();
          return true;
        } else {
          set({
            authLoading: false,
            authError: result.error ?? 'Login failed. Please check credentials.',
          });
          return false;
        }
      },

      register: async (credentials) => {
        set({ authLoading: true, authError: null });
        const result = await api.register(credentials);
        if (result.success && result.user) {
          const ownerName = result.user.username;
          const defaultMember: FamilyMember = {
            id: String(result.user.id),
            name: `${ownerName} (You)`,
            avatar: '🦁',
            color: '#3B82F6',
            role: 'owner',
            activeSkinId: 'vanilla',
            xpContributed: 0,
            tasksCompleted: 0,
            level: 1,
          };

          set({
            authUser: result.user,
            authLoading: false,
            authError: null,
            members: [defaultMember],
            currentMemberId: String(result.user.id),
            household: {
              ...INITIAL_HOUSEHOLD,
              name: `${ownerName}'s Family`,
              level: 1,
              currentXp: 0,
              xpToNextLevel: 100,
              levelTitle: 'Level 1: Starter Nest',
              streakDays: 1,
              totalTasksCompleted: 0,
            },
            tasks: [],
          });

          await get().refreshFromBackend();
          return true;
        } else {
          set({
            authLoading: false,
            authError: result.error ?? 'Registration failed.',
          });
          return false;
        }
      },

      logout: async () => {
        await api.logout();
        set({
          authUser: null,
          tasks: [],
          authError: null,
        });
      },

      restoreAuthSession: async () => {
        try {
          const user = await api.getStoredSession();
          if (user) {
            set({ authUser: user });
            const profile = await api.getMe();
            if (profile) {
              set({ isBackendConnected: true });
              await get().refreshFromBackend();
            } else {
              // Session expired or invalid
              await api.logout();
              set({ authUser: null, tasks: [] });
            }
          } else {
            set({ authUser: null, tasks: [] });
          }
        } catch {
          set({ authUser: null, tasks: [] });
        } finally {
          set({ authInitialized: true });
        }
      },

      setActiveCategory: (activeCategory) => set({ activeCategory }),
      setActiveMemberFilterId: (activeMemberFilterId) => set({ activeMemberFilterId }),
      setSearchQuery: (searchQuery) => set({ searchQuery }),
      setFilterStatus: (filterStatus) => set({ filterStatus }),
      setSelectedGroupFilter: (selectedGroupFilter) => set({ selectedGroupFilter }),
      setGroupByRoom: (groupByRoom) => set({ groupByRoom }),
      setCurrentMemberId: (currentMemberId) => set({ currentMemberId }),
      toggleNotifications: (notificationsEnabled) => set({ notificationsEnabled }),

      toggleTask: async (taskId: string) => {
        const state = get();
        const task = state.tasks.find((t) => t.id === taskId);
        if (!task) return;

        const willBeCompleted = !task.isCompleted;
        const nowStr = new Date().toISOString();
        const todayStr = nowStr.split('T')[0];

        if (willBeCompleted) {
          const isMajor = task.category === 'weekly' || task.priority === 'High' || task.xpReward >= 30;
          triggerTaskCelebration(isMajor);
        }

        const xpDelta = willBeCompleted ? task.xpReward : -task.xpReward;
        let currentXp = Math.max(0, state.household.currentXp + xpDelta);
        let level = state.household.level;
        let xpToNextLevel = state.household.xpToNextLevel;
        let skillPoints = state.household.skillPoints;
        let levelTitle = state.household.levelTitle;
        const cap = getLevelCap(state.household.tier);

        if (willBeCompleted && currentXp >= xpToNextLevel && level < cap) {
          level += 1;
          currentXp -= xpToNextLevel;
          xpToNextLevel = Math.round(xpToNextLevel * 1.25);
          skillPoints += 1;

          const milestone = LEVEL_MILESTONES.find((m) => m.level === level);
          if (milestone) {
            levelTitle = `Level ${level}: ${milestone.title}`;
          } else {
            levelTitle = `Level ${level}: Master Homestead`;
          }
        }

        const updatedTasks = state.tasks.map((t) => {
          if (t.id === taskId) {
            return {
              ...t,
              isCompleted: willBeCompleted,
              completedAt: willBeCompleted ? nowStr : undefined,
              completedByMemberId: willBeCompleted ? state.currentMemberId : undefined,
            };
          }
          return t;
        });

        const effectiveMemberId = task.assignedMemberId ?? state.currentMemberId;
        const updatedMembers = state.members.map((m) => {
          if (m.id === effectiveMemberId) {
            return {
              ...m,
              xpContributed: Math.max(0, m.xpContributed + xpDelta),
              tasksCompleted: Math.max(0, m.tasksCompleted + (willBeCompleted ? 1 : -1)),
            };
          }
          return m;
        });

        const updatedHeatmap = state.heatmap.map((day) => {
          if (day.date === todayStr) {
            const completedCount = Math.max(0, day.completedTasks + (willBeCompleted ? 1 : -1));
            return {
              ...day,
              completedTasks: completedCount,
              ratio: day.totalTasks > 0 ? Math.min(1, completedCount / day.totalTasks) : 0,
            };
          }
          return day;
        });

        const totalCompleted = state.household.totalTasksCompleted + (willBeCompleted ? 1 : -1);

        set({
          tasks: updatedTasks,
          members: updatedMembers,
          heatmap: updatedHeatmap,
          household: {
            ...state.household,
            level,
            currentXp,
            xpToNextLevel,
            skillPoints,
            levelTitle,
            totalTasksCompleted: Math.max(0, totalCompleted),
          },
        });

        api.toggleTaskCompletion(taskId, willBeCompleted);
      },

      toggleSubtask: async (taskId: string, subtaskId: string) => {
        const state = get();
        const task = state.tasks.find((t) => t.id === taskId);
        if (!task || !task.subtasks) return;

        const updatedSubtasks = task.subtasks.map((st) =>
          st.id === subtaskId ? { ...st, isCompleted: !st.isCompleted } : st
        );

        set({
          tasks: state.tasks.map((t) =>
            t.id === taskId ? { ...t, subtasks: updatedSubtasks } : t
          ),
        });
      },

      addTask: async (taskData) => {
        const state = get();
        const newTask: ChoreQuestTask = {
          ...taskData,
          id: `task-${Date.now()}`,
          isCompleted: false,
          createdAt: new Date().toISOString(),
        };

        const todayStr = new Date().toISOString().split('T')[0];
        const updatedHeatmap = state.heatmap.map((day) => {
          if (day.date === todayStr) {
            const newTotal = day.totalTasks + 1;
            return {
              ...day,
              totalTasks: newTotal,
              ratio: day.completedTasks / newTotal,
            };
          }
          return day;
        });

        set({
          tasks: [newTask, ...state.tasks],
          heatmap: updatedHeatmap,
        });

        const res = await api.createTask(newTask);
        if (res.success && res.data) {
          set({
            tasks: get().tasks.map((t) => (t.id === newTask.id ? res.data! : t)),
          });
        }
      },

      deleteTask: async (taskId) => {
        const state = get();
        set({
          tasks: state.tasks.filter((t) => t.id !== taskId),
        });
        api.deleteTask(taskId);
      },

      updateTask: async (task) => {
        const state = get();
        set({
          tasks: state.tasks.map((t) => (t.id === task.id ? task : t)),
        });
      },

      addMember: (memberData) => {
        const state = get();
        if (!canAddMember(state.members.length, state.household.tier)) {
          const plan = SUBSCRIPTION_PLANS[state.household.tier];
          return {
            success: false,
            message: `Your current ${plan.name} allows up to ${plan.maxMembers} members. Upgrade to invite more family members!`,
          };
        }

        const newMember: FamilyMember = {
          ...memberData,
          id: `mem-${Date.now()}`,
          xpContributed: 0,
          tasksCompleted: 0,
          level: 1,
        };

        set({
          members: [...state.members, newMember],
        });

        return { success: true };
      },

      updateMember: (member) => {
        const state = get();
        set({
          members: state.members.map((m) => (m.id === member.id ? member : m)),
        });
      },

      unlockPerk: async (perkId) => {
        const state = get();
        const perk = state.perks.find((p) => p.id === perkId);
        if (!perk || perk.unlocked) return false;

        if (state.household.skillPoints < perk.cost) {
          return false;
        }

        await triggerPerkCelebration();

        set({
          household: {
            ...state.household,
            skillPoints: state.household.skillPoints - perk.cost,
            unlockedPerkIds: [...state.household.unlockedPerkIds, perkId],
          },
          perks: state.perks.map((p) => (p.id === perkId ? { ...p, unlocked: true } : p)),
        });

        return true;
      },

      addNote: (noteData) => {
        const state = get();
        const newNote: StickyNote = {
          ...noteData,
          id: `note-${Date.now()}`,
          createdAt: new Date().toISOString(),
        };
        set({ notes: [newNote, ...state.notes] });
      },

      deleteNote: (id) => {
        const state = get();
        set({ notes: state.notes.filter((n) => n.id !== id) });
      },

      togglePinNote: (id) => {
        const state = get();
        set({
          notes: state.notes.map((n) => (n.id === id ? { ...n, isPinned: !n.isPinned } : n)),
        });
      },

      upgradeTier: (newTier) => {
        const state = get();
        const plan = SUBSCRIPTION_PLANS[newTier];
        const combinedSkins = Array.from(new Set([...state.household.unlockedSkinIds, ...plan.unlockedSkinIds]));

        set({
          household: {
            ...state.household,
            tier: newTier,
            unlockedSkinIds: combinedSkins,
          },
        });
      },

      refreshFromBackend: async () => {
        const isHealthy = await api.checkBackendHealth();
        set({ isBackendConnected: isHealthy });
        if (isHealthy && get().authUser) {
          const backendTasks = await api.getTasks();
          set({ tasks: backendTasks });
        }
      },
    }),
    {
      name: 'chorequest-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        household: state.household,
        members: state.members,
        currentMemberId: state.currentMemberId,
        tasks: state.tasks,
        notes: state.notes,
        perks: state.perks,
        heatmap: state.heatmap,
        notificationsEnabled: state.notificationsEnabled,
        authUser: state.authUser,
      }),
    }
  )
);
