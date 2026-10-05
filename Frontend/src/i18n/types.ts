// ChoreQuest i18n Localization Types

export type Language = 'en' | 'de';

export interface LanguageOption {
  code: Language;
  name: string;
  nativeName: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
];

export interface Translations {
  // Navigation / Tabs
  tabs: {
    tasks: string;
    calendar: string;
    rewards: string;
    settings: string;
    tasksHeader: string;
    calendarHeader: string;
    rewardsHeader: string;
    settingsHeader: string;
  };

  // Common & Generic
  common: {
    all: string;
    pending: string;
    done: string;
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    search: string;
    loading: string;
    success: string;
    error: string;
    close: string;
    level: string;
    points: string;
    streak: string;
    perks: string;
  };

  // Dashboard / Tasks
  tasks: {
    dailyTasks: string;
    weeklyGoals: string;
    recurringChores: string;
    newTask: string;
    createFirstTask: string;
    noTasksFound: string;
    allTasksCompleted: string;
    emptyCompletedSub: string;
    familyMembers: string;
    allFamily: string;
    sharedWithFamily: string;
    assignedTo: string;
    subtasks: string;
    addSubtask: string;
    subtasksProgress: string; // e.g. "{completed} of {total} done"
    groupByRoom: string;
    flatList: string;
    allRooms: string;
    roomGroup: string;
    priority: {
      low: string;
      medium: string;
      high: string;
    };
    recurrence: {
      none: string;
      daily: string;
      weekdays: string;
      weekly: string;
    };
  };

  // Task Groups / Rooms
  groups: {
    kitchen: string;
    living_room: string;
    bedroom: string;
    bathroom: string;
    garden: string;
    garage: string;
    general: string;
    other: string;
  };

  // Add Task Modal
  addTaskModal: {
    title: string;
    subtitle: string;
    taskTitlePlaceholder: string;
    descriptionPlaceholder: string;
    taskTitleLabel: string;
    descriptionLabel: string;
    categoryLabel: string;
    priorityLabel: string;
    roomGroupLabel: string;
    assigneeLabel: string;
    recurrenceLabel: string;
    checklistLabel: string;
    addChecklistItem: string;
    enterSubtaskPlaceholder: string;
    saveButton: string;
    xpRewardLabel: string;
  };

  // Calendar & Memos
  calendar: {
    title: string;
    subtitle: string;
    consistencyScore: string;
    last30Days: string;
    stickyNotesTitle: string;
    stickyNotesSub: string;
    addNote: string;
    pinned: string;
    unpinned: string;
    colorYellow: string;
    colorPink: string;
    colorBlue: string;
    colorGreen: string;
  };

  // Rewards & Perks
  rewards: {
    title: string;
    subtitle: string;
    perkPoints: string;
    perkPointsSub: string;
    activePerks: string;
    tier1Title: string;
    tier1Req: string;
    tier2Title: string;
    tier2Req: string;
    tier3Title: string;
    tier3Req: string;
    unlockPerk: string;
    unlockedBadge: string;
    needPoints: string;
    milestonesTitle: string;
    milestonesSub: string;
  };

  // Settings
  settings: {
    title: string;
    subtitle: string;
    familyAccount: string;
    signedInAs: string;
    notSignedIn: string;
    offlineMode: string;
    signInOrRegister: string;
    signOut: string;
    activeTheme: string;
    activeThemeSub: string;
    language: string;
    languageSub: string;
    reminders: string;
    remindersSub: string;
    systemSync: string;
    backendStatus: string;
    connected: string;
    offlineLocal: string;
    familyMembersSection: string;
    addMemberBtn: string;
    subscriptionSection: string;
    oneTimeUpgrade: string;
    aboutSection: string;
    version: string;
  };

  // Authentication
  auth: {
    welcomeTitle: string;
    welcomeSubtitle: string;
    signInTab: string;
    registerTab: string;
    usernameOrEmailLabel: string;
    usernameOrEmailPlaceholder: string;
    passwordLabel: string;
    passwordPlaceholder: string;
    usernameLabel: string;
    usernamePlaceholder: string;
    emailLabel: string;
    emailPlaceholder: string;
    signInButton: string;
    registerButton: string;
    quickDemoHint: string;
    alreadyHaveAccount: string;
    needAccount: string;
    backendConnected: string;
    backendDisconnected: string;
  };
}
