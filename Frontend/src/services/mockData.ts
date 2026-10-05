import { FamilyMember, ChoreQuestTask, HouseholdState, PerkItem, StickyNote, DailyHeatmapDay } from '../types/household';

export const INITIAL_HOUSEHOLD: HouseholdState = {
  id: 'hh-001',
  name: 'The Family Home',
  level: 5,
  currentXp: 380,
  xpToNextLevel: 500,
  levelTitle: 'Level 5: Cozy Cottage',
  streakDays: 7,
  lastStreakDate: new Date().toISOString().split('T')[0],
  skillPoints: 3,
  totalSkillPointsEarned: 5,
  tier: 'free',
  unlockedPerkIds: ['perk-streak-shield', 'perk-custom-titles'],
  unlockedSkinIds: ['vanilla', 'berry', 'dark', 'light'],
  totalTasksCompleted: 48,
};

export const INITIAL_MEMBERS: FamilyMember[] = [
  {
    id: 'mem-1',
    name: 'Dad (Alex)',
    avatar: '🦁',
    color: '#3B82F6',
    role: 'owner',
    activeSkinId: 'vanilla',
    xpContributed: 380,
    tasksCompleted: 18,
    level: 5,
  },
  {
    id: 'mem-2',
    name: 'Mom (Sarah)',
    avatar: '🦉',
    color: '#EC4899',
    role: 'admin',
    activeSkinId: 'berry',
    xpContributed: 310,
    tasksCompleted: 15,
    level: 4,
  },
  {
    id: 'mem-3',
    name: 'Leo (Son)',
    avatar: '🚀',
    color: '#10B981',
    role: 'member',
    activeSkinId: 'dark',
    xpContributed: 190,
    tasksCompleted: 9,
    level: 3,
  },
  {
    id: 'mem-4',
    name: 'Maya (Daughter)',
    avatar: '🎨',
    color: '#F59E0B',
    role: 'member',
    activeSkinId: 'light',
    xpContributed: 120,
    tasksCompleted: 6,
    level: 2,
  },
];

const today = new Date().toISOString().split('T')[0];

export const INITIAL_TASKS: ChoreQuestTask[] = [
  // Daily Tasks
  {
    id: 'task-1',
    title: 'Kitchen cleanup & meal prep',
    description: 'Keep the kitchen sparkling and prepare tonight dinner.',
    isCompleted: false,
    priority: 'High',
    dueDate: today,
    category: 'daily',
    assignedMemberId: 'mem-2', // Mom
    group: 'Kitchen',
    xpReward: 30,
    recurrence: 'daily',
    createdAt: new Date().toISOString(),
    subtasks: [
      { id: 'sub-1', title: 'Wipe down countertops & stovetop', isCompleted: true },
      { id: 'sub-2', title: 'Cook dinner & steam veggies', isCompleted: false },
      { id: 'sub-3', title: 'Load dishwasher & run cycle', isCompleted: false },
    ],
  },
  {
    id: 'task-2',
    title: 'Unload dishwasher before school',
    description: 'Stack plates carefully and place silverware in drawer.',
    isCompleted: false,
    priority: 'Medium',
    dueDate: today,
    category: 'daily',
    assignedMemberId: 'mem-3', // Leo
    group: 'Kitchen',
    xpReward: 20,
    recurrence: 'daily',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task-3',
    title: 'Water patio garden & houseplants',
    description: 'Give ferns mist spray and soak tomato planters.',
    isCompleted: false,
    priority: 'Medium',
    dueDate: today,
    category: 'daily',
    assignedMemberId: 'mem-4', // Maya
    group: 'Garden & Patio',
    xpReward: 20,
    recurrence: 'daily',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task-4',
    title: 'Morning walk with Buster around the park',
    description: '30 minute brisk walk, refill his water dish after.',
    isCompleted: true,
    priority: 'Medium',
    dueDate: today,
    category: 'daily',
    assignedMemberId: 'mem-1', // Dad
    group: 'General Household',
    xpReward: 20,
    recurrence: 'daily',
    createdAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
    completedByMemberId: 'mem-1',
  },

  // Weekly Goals
  {
    id: 'task-5',
    title: 'Deep clean garage workbench & organize tools',
    description: 'Hang power drills, sweep wood shavings, sort screw bins.',
    isCompleted: false,
    priority: 'High',
    dueDate: today,
    category: 'weekly',
    assignedMemberId: 'mem-1', // Dad
    group: 'Garage & Storage',
    xpReward: 50,
    createdAt: new Date().toISOString(),
    subtasks: [
      { id: 'sub-4', title: 'Sort screw organizers', isCompleted: true },
      { id: 'sub-5', title: 'Hang cordless drill racks', isCompleted: false },
      { id: 'sub-6', title: 'Sweep workshop floor', isCompleted: false },
    ],
  },
  {
    id: 'task-6',
    title: 'Family board game night setup & treats',
    description: 'Pick two games and prepare popcorn and cocoa.',
    isCompleted: false,
    priority: 'Medium',
    dueDate: today,
    category: 'weekly',
    group: 'Living Room',
    xpReward: 35,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task-7',
    title: 'Sort recycling & breakdown cardboard boxes',
    description: 'Flatten grocery delivery boxes and roll to curb.',
    isCompleted: true,
    priority: 'Low',
    dueDate: today,
    category: 'weekly',
    assignedMemberId: 'mem-3', // Leo
    group: 'Garage & Storage',
    xpReward: 30,
    createdAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
    completedByMemberId: 'mem-3',
  },

  // Recurring Chores
  {
    id: 'task-8',
    title: 'Feed Buster morning & evening meals',
    description: 'Half scoop dry kibble + one spoonful topper.',
    isCompleted: false,
    priority: 'High',
    dueDate: today,
    category: 'recurring',
    assignedMemberId: 'mem-4', // Maya
    group: 'General Household',
    xpReward: 15,
    recurrence: 'daily',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task-9',
    title: 'Take out kitchen compost & sanitize bin',
    description: 'Empty small bucket into outdoor green container.',
    isCompleted: false,
    priority: 'Medium',
    dueDate: today,
    category: 'recurring',
    assignedMemberId: 'mem-3', // Leo
    group: 'Kitchen',
    xpReward: 20,
    recurrence: 'weekdays',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task-10',
    title: 'Fold clean laundry & put away into closets',
    description: 'Three baskets in hallway need sorting.',
    isCompleted: false,
    priority: 'Medium',
    dueDate: today,
    category: 'recurring',
    group: 'Bedroom',
    xpReward: 30,
    recurrence: 'weekly',
    createdAt: new Date().toISOString(),
  },
];

export const INITIAL_STICKY_NOTES: StickyNote[] = [
  {
    id: 'note-1',
    title: '📶 Home Wi-Fi Network',
    content: 'SSID: StarGazer_Home\nPassword: FamilyHome2026!\nGuest WiFi: StarGazer_Guest (no password)',
    color: '#FEF08A', // Pastel yellow
    authorId: 'mem-1',
    authorName: 'Dad (Alex)',
    authorAvatar: '🦁',
    isPinned: true,
    createdAt: '2026-09-27T10:00:00Z',
    tags: ['Tech', 'Important'],
  },
  {
    id: 'note-2',
    title: '🦷 Dentist Checkup',
    content: 'Thursday 3:30 PM at Oakridge Dental for Leo & Maya. Please pack insurance cards and brush beforehand!',
    color: '#FECDD3', // Pastel rose
    authorId: 'mem-2',
    authorName: 'Mom (Sarah)',
    authorAvatar: '🦉',
    isPinned: true,
    createdAt: '2026-09-28T14:30:00Z',
    tags: ['Health', 'Schedule'],
  },
  {
    id: 'note-3',
    title: '🛒 Family Grocery Wishlist',
    content: '• Oat milk barista edition\n• Honeycrisp apples 🍎\n• Buster peanut butter biscuits 🐕\n• Greek yogurt & berries',
    color: '#BAE6FD', // Pastel sky
    authorId: 'mem-4',
    authorName: 'Maya (Daughter)',
    authorAvatar: '🎨',
    isPinned: false,
    createdAt: '2026-09-28T18:15:00Z',
    tags: ['Shopping'],
  },
  {
    id: 'note-4',
    title: '🍿 Friday Movie Night Votes',
    content: 'Vote 1: Spirited Away\nVote 2: Guardians of the Galaxy\nDrop a comment by Thursday dinner!',
    color: '#BBF7D0', // Pastel mint
    authorId: 'mem-3',
    authorName: 'Leo (Son)',
    authorAvatar: '🚀',
    isPinned: false,
    createdAt: '2026-09-29T08:00:00Z',
    tags: ['Fun'],
  },
];

export const INITIAL_PERKS: PerkItem[] = [
  // Tier 1 (Starter Perks)
  {
    id: 'perk-streak-shield',
    title: 'Streak Shield',
    description: 'Auto-protects the household streak for 1 missed day without breaking.',
    icon: 'shield-checkmark',
    category: 'streak',
    cost: 1,
    requiredLevel: 2,
    tierLevel: 1,
    unlocked: true,
    effect: '1 Free streak pass per month',
  },
  {
    id: 'perk-custom-titles',
    title: 'Family Nicknames',
    description: 'Unlocks fun family nickname titles next to member avatars (e.g. "Chief Organizer", "Tidy Champion").',
    icon: 'ribbon',
    category: 'cosmetic',
    cost: 1,
    requiredLevel: 3,
    tierLevel: 1,
    unlocked: true,
    effect: 'Unlock 8 custom avatar titles',
  },
  {
    id: 'perk-custom-icons',
    title: 'Bonus Category Icons',
    description: 'Expands the task icon library with 20+ colorful chore and hobby icons.',
    icon: 'sparkles',
    category: 'cosmetic',
    cost: 1,
    requiredLevel: 4,
    tierLevel: 1,
    unlocked: false,
    effect: '+20 task icon badges',
  },

  // Tier 2 (Family Teamwork)
  {
    id: 'perk-double-xp',
    title: 'Double Points Weekend',
    description: 'Every Saturday and Sunday, all completed chores award 2x shared Household points.',
    icon: 'flash',
    category: 'xp',
    cost: 2,
    requiredLevel: 5,
    tierLevel: 2,
    unlocked: false,
    effect: '+100% points bonus on weekends',
  },
  {
    id: 'perk-rainbow-confetti',
    title: 'Rainbow Confetti Blast',
    description: 'Upgrades the checkmark celebration to a deluxe multi-stage rainbow fireworks particle burst.',
    icon: 'color-wand',
    category: 'cosmetic',
    cost: 2,
    requiredLevel: 6,
    tierLevel: 2,
    unlocked: false,
    effect: 'Deluxe confetti celebration',
  },
  {
    id: 'perk-early-bird',
    title: 'Early Bird Points Bonus',
    description: 'Tasks completed before 9:00 AM receive an additional +10 bonus points.',
    icon: 'sunny',
    category: 'xp',
    cost: 2,
    requiredLevel: 7,
    tierLevel: 2,
    unlocked: false,
    effect: '+10 points for morning completions',
  },

  // Tier 3 (Household Mastery)
  {
    id: 'perk-household-crest',
    title: 'Golden Household Badge',
    description: 'Displays an elegant golden family badge on the home dashboard header.',
    icon: 'trophy',
    category: 'household',
    cost: 3,
    requiredLevel: 10,
    tierLevel: 3,
    unlocked: false,
    effect: 'Golden family badge & header',
  },
  {
    id: 'perk-streak-multiplier',
    title: 'Streak Momentum Bonus',
    description: 'For every 7 continuous streak days, permanently boost base points by +5% (up to +25%).',
    icon: 'flame',
    category: 'xp',
    cost: 3,
    requiredLevel: 12,
    tierLevel: 3,
    unlocked: false,
    effect: 'Permanent point scaling with streak',
  },
];

// Generate last 30 days of heatmap history with realistic consistency
export function generateInitialHeatmap(): DailyHeatmapDay[] {
  const result: DailyHeatmapDay[] = [];
  const now = new Date();

  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];

    // Simulate completion ratios:
    // Recent streak has high completion (100% or 80%)
    let total = 4;
    let completed = 4;

    if (i === 0) {
      // Today: 2 completed out of 4
      total = 4;
      completed = 2;
    } else if (i > 18) {
      // Earlier days had some yellow / red days
      total = 3 + (i % 3);
      completed = i % 4 === 0 ? 1 : i % 3 === 0 ? 2 : total;
    } else if (i > 7) {
      // Solid consistency
      total = 4;
      completed = i % 5 === 0 ? 3 : 4;
    } else {
      // Current 7-day streak is 100% completed
      total = 4;
      completed = 4;
    }

    result.push({
      date: dateStr,
      totalTasks: total,
      completedTasks: completed,
      ratio: total > 0 ? completed / total : 0,
    });
  }

  return result;
}

export const LEVEL_MILESTONES = [
  { level: 1, title: 'Starter Nest', xpRequired: 100, perkReward: 1 },
  { level: 2, title: 'Tidy Corner', xpRequired: 200, perkReward: 1 },
  { level: 3, title: 'Cozy Cabin', xpRequired: 300, perkReward: 1 },
  { level: 4, title: 'Bustling Home', xpRequired: 400, perkReward: 1 },
  { level: 5, title: 'Cozy Cottage', xpRequired: 500, perkReward: 1 },
  { level: 6, title: 'Thriving Manor', xpRequired: 650, perkReward: 1 },
  { level: 7, title: 'Harmony Haven', xpRequired: 800, perkReward: 2 },
  { level: 8, title: 'Grand Homestead', xpRequired: 1000, perkReward: 2 },
  { level: 9, title: 'Serene Sanctuary', xpRequired: 1250, perkReward: 2 },
  { level: 10, title: 'Family Champions', xpRequired: 1500, perkReward: 3 },
  { level: 15, title: 'Master Estate', xpRequired: 2500, perkReward: 3 },
  { level: 25, title: 'Legendary Household', xpRequired: 5000, perkReward: 5 },
];
