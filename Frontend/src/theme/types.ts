// ChoreQuest Skin Engine Theme Types

export type SkinId = 
  | 'vanilla' 
  | 'berry' 
  | 'dark' 
  | 'light' 
  | 'cyberpunk' 
  | 'forest' 
  | 'golden_royal' 
  | string;

export interface SkinColors {
  background: string;
  surface: string;
  surfaceElevated: string;
  surfaceBorder: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  accent: string;
  accentLight: string;
  accentDark: string;
  accentGlow: string;
  success: string;
  warning: string;
  danger: string;
  info: string;
  badgeBackground: string;
  badgeText: string;
  progressBarTrack: string;
  progressBarFill: string;
  tabBarBackground: string;
  tabBarBorder: string;
  tabBarActive: string;
  tabBarInactive: string;
  cardShadow: string;
  chipBackground: string;
  chipActiveBackground: string;
  chipActiveText: string;
}

export interface SkinTheme {
  id: SkinId;
  name: string;
  description: string;
  tag: string;
  isDark: boolean;
  requiredTier: 'free' | 'basic' | 'premium';
  previewColors: {
    bg: string;
    surface: string;
    accent: string;
    text: string;
  };
  colors: SkinColors;
}
