// ChoreQuest Core Domain Models & Types

export type TaskPriority = 'Low' | 'Medium' | 'High';

export type TaskCategory = 'daily' | 'weekly' | 'recurring';

export type RecurrencePattern = 'none' | 'daily' | 'weekdays' | 'weekly';

export interface FamilyMember {
  id: string;
  name: string;
  avatar: string; // Emoji, e.g. 🦁, 🦊, 🦉, 🐼, 🚀
  color: string; // HEX accent for avatar ring/tag
  role: 'owner' | 'admin' | 'member';
  activeSkinId?: string; // Each family member can select their own skin independently!
  xpContributed: number;
  tasksCompleted: number;
  level: number;
}

export interface TaskSubtask {
  id: string;
  title: string;
  isCompleted: boolean;
}

export interface TaskGroupOption {
  id: string;
  name: string;
  emoji: string;
  icon: string;
}

export const PRESET_TASK_GROUPS: TaskGroupOption[] = [
  { id: 'kitchen', name: 'Kitchen', emoji: '🍳', icon: 'restaurant-outline' },
  { id: 'living_room', name: 'Living Room', emoji: '🛋️', icon: 'tv-outline' },
  { id: 'bedroom', name: 'Bedroom', emoji: '🛏️', icon: 'bed-outline' },
  { id: 'bathroom', name: 'Bathroom', emoji: '🚿', icon: 'water-outline' },
  { id: 'garden', name: 'Garden & Patio', emoji: '🌿', icon: 'leaf-outline' },
  { id: 'garage', name: 'Garage & Storage', emoji: '🚗', icon: 'construct-outline' },
  { id: 'general', name: 'General Household', emoji: '📦', icon: 'home-outline' },
];

export interface ChoreQuestTask {
  id: string;
  title: string;
  description?: string;
  isCompleted: boolean;
  priority: TaskPriority;
  dueDate?: string; // ISO date string YYYY-MM-DD
  category: TaskCategory;
  assignedMemberId?: string; // ID of assigned family member or undefined for "Any/Family"
  xpReward: number; // e.g. 10 for normal, 25 for high, 50 for daily goal bonus
  recurrence?: RecurrencePattern;
  createdAt: string;
  completedAt?: string;
  completedByMemberId?: string;
  tags?: string[];
  group?: string; // e.g. 'Kitchen', 'Living Room', 'Garden', etc.
  subtasks?: TaskSubtask[]; // e.g. checklist subtasks: 'swipe', 'cook', etc.
}

export interface HouseholdState {
  id: string;
  name: string;
  level: number;
  currentXp: number;
  xpToNextLevel: number;
  levelTitle: string; // e.g. "Level 1: Novice Nook", "Level 5: Cozy Cottage"
  streakDays: number;
  lastStreakDate?: string; // YYYY-MM-DD
  skillPoints: number;
  totalSkillPointsEarned: number;
  tier: 'free' | 'basic' | 'premium';
  unlockedPerkIds: string[];
  unlockedSkinIds: string[];
  totalTasksCompleted: number;
}

export interface PerkItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'streak' | 'xp' | 'cosmetic' | 'household';
  cost: number;
  requiredLevel: number;
  tierLevel: 1 | 2 | 3;
  unlocked: boolean;
  effect: string;
}

export interface StickyNote {
  id: string;
  title?: string;
  content: string;
  color: string; // Soft pastel note color
  authorId: string;
  authorName: string;
  authorAvatar: string;
  isPinned: boolean;
  createdAt: string;
  tags?: string[];
}

export interface DailyHeatmapDay {
  date: string; // YYYY-MM-DD
  totalTasks: number;
  completedTasks: number;
  ratio: number; // 0 to 1
  levelUpOccurred?: boolean;
}

export interface LevelInfo {
  level: number;
  title: string;
  requiredXp: number;
  perkReward: number;
  unlockedFeature?: string;
}
