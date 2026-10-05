import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSkin } from '../../theme/SkinProvider';
import { useTranslation } from '../../i18n/LanguageProvider';
import { useHouseholdStore } from '../../store/useHouseholdStore';
import { SUBSCRIPTION_PLANS, getLevelCap } from '../../config/plans.config';

interface HouseholdHeaderProps {
  onPressPerks?: () => void;
  onPressUpgrade?: () => void;
  onPressAuth?: () => void;
}

export function HouseholdHeader({ onPressPerks, onPressUpgrade, onPressAuth }: HouseholdHeaderProps) {
  const { skin } = useSkin();
  const { t } = useTranslation();
  const household = useHouseholdStore((s) => s.household);
  const authUser = useHouseholdStore((s) => s.authUser);

  const levelCap = getLevelCap(household.tier);
  const isCapped = household.level >= levelCap;
  const progressRatio = Math.min(1, Math.max(0, household.currentXp / household.xpToNextLevel));
  const progressPercent = Math.round(progressRatio * 100);

  const currentPlan = SUBSCRIPTION_PLANS[household.tier];

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: skin.colors.surface,
          borderColor: skin.colors.surfaceBorder,
          shadowColor: skin.colors.cardShadow,
        },
      ]}>
      {/* Top Row: Household Name & Quick Badges */}
      <View style={styles.topRow}>
        <View style={styles.nameBlock}>
          <Text style={[styles.householdName, { color: skin.colors.textPrimary }]}>
            {household.name}
          </Text>
          <View style={styles.subTitleRow}>
            <View
              style={[
                styles.tierBadge,
                { backgroundColor: skin.colors.accentLight },
              ]}>
              <Text style={[styles.tierBadgeText, { color: skin.colors.accentDark }]}>
                {currentPlan.badge} Tier
              </Text>
            </View>

            {/* Account / Login Badge */}
            <Pressable
              onPress={onPressAuth}
              style={[
                styles.authPill,
                {
                  backgroundColor: authUser ? skin.colors.surfaceElevated : skin.colors.accentLight,
                  borderColor: authUser ? skin.colors.surfaceBorder : skin.colors.accent,
                },
              ]}>
              <Ionicons
                name={authUser ? 'person-circle' : 'log-in-outline'}
                size={12}
                color={authUser ? skin.colors.textPrimary : skin.colors.accentDark}
              />
              <Text
                style={[
                  styles.authPillText,
                  { color: authUser ? skin.colors.textPrimary : skin.colors.accentDark },
                ]}>
                {authUser ? authUser.username : 'Sign In'}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Action Badges: Streak & Skill Points */}
        <View style={styles.statsBadgesRow}>
          <View style={[styles.statPill, { backgroundColor: skin.colors.surfaceElevated, borderColor: skin.colors.surfaceBorder }]}>
            <Text style={styles.statIcon}>🔥</Text>
            <View>
              <Text style={[styles.statValue, { color: skin.colors.textPrimary }]}>{household.streakDays}</Text>
              <Text style={[styles.statLabel, { color: skin.colors.textMuted }]}>{t.common.streak}</Text>
            </View>
          </View>

          <Pressable
            onPress={onPressPerks}
            style={({ pressed }) => [
              styles.statPill,
              {
                backgroundColor: skin.colors.badgeBackground,
                borderColor: skin.colors.accent,
                opacity: pressed ? 0.8 : 1,
              },
            ]}>
            <Text style={styles.statIcon}>⭐</Text>
            <View>
              <Text style={[styles.statValue, { color: skin.colors.badgeText }]}>{household.skillPoints}</Text>
              <Text style={[styles.statLabel, { color: skin.colors.badgeText }]}>{t.common.perks}</Text>
            </View>
          </Pressable>
        </View>
      </View>

      {/* Level Title & Badge */}
      <View style={styles.levelBanner}>
        <View style={styles.levelLeft}>
          <View
            style={[
              styles.levelCircle,
              { backgroundColor: skin.colors.accent, shadowColor: skin.colors.accentGlow },
            ]}>
            <Text style={styles.levelNumber}>{household.level}</Text>
          </View>
          <View style={styles.levelDetails}>
            <Text style={[styles.levelTitleText, { color: skin.colors.textPrimary }]}>
              {household.levelTitle}
            </Text>
            <Text style={[styles.xpText, { color: skin.colors.textSecondary }]}>
              {household.currentXp} / {household.xpToNextLevel} XP
              {isCapped && ` • (Cap: Lv ${levelCap})`}
            </Text>
          </View>
        </View>

        <View style={styles.percentBadge}>
          <Text style={[styles.percentText, { color: skin.colors.accent }]}>
            {progressPercent}%
          </Text>
        </View>
      </View>

      {/* XP Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={[styles.progressTrack, { backgroundColor: skin.colors.progressBarTrack }]}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${progressRatio * 100}%`,
                backgroundColor: skin.colors.progressBarFill,
              },
            ]}
          />
        </View>
      </View>

      {/* Level Cap Notice for Free Tier */}
      {isCapped && household.tier === 'free' && (
        <Pressable
          onPress={onPressUpgrade}
          style={[styles.capWarning, { backgroundColor: skin.colors.accentLight }]}>
          <Ionicons name="sparkles" size={14} color={skin.colors.accentDark} />
          <Text style={[styles.capWarningText, { color: skin.colors.accentDark }]}>
            Level 10 reached! Upgrade to Basic or Premium to unlock Level 25+
          </Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 14,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  nameBlock: {
    flex: 1,
    marginRight: 8,
  },
  householdName: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  subTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  tierBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  tierBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  authPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    gap: 4,
  },
  authPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  statsBadgesRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1,
    gap: 5,
  },
  statIcon: {
    fontSize: 16,
  },
  statValue: {
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 14,
  },
  statLabel: {
    fontSize: 9,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  levelBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  levelLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  levelCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  levelNumber: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 16,
  },
  levelDetails: {
    flex: 1,
  },
  levelTitleText: {
    fontSize: 15,
    fontWeight: '700',
  },
  xpText: {
    fontSize: 12,
    marginTop: 1,
    fontWeight: '500',
  },
  percentBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  percentText: {
    fontSize: 14,
    fontWeight: '700',
  },
  progressContainer: {
    width: '100%',
  },
  progressTrack: {
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 5,
  },
  capWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 8,
    borderRadius: 8,
    marginTop: 10,
  },
  capWarningText: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
});
