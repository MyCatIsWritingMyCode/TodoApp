import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSkin } from '../../theme/SkinProvider';
import { useHouseholdStore } from '../../store/useHouseholdStore';
import { SUBSCRIPTION_PLANS, getLevelCap, getMaxMembers } from '../../config/plans.config';

interface SubscriptionSectionProps {
  onUpgradePress: () => void;
}

export function SubscriptionSection({ onUpgradePress }: SubscriptionSectionProps) {
  const { skin } = useSkin();
  const household = useHouseholdStore((s) => s.household);
  const members = useHouseholdStore((s) => s.members);

  const plan = SUBSCRIPTION_PLANS[household.tier];
  const maxMembers = getMaxMembers(household.tier);
  const levelCap = getLevelCap(household.tier);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: skin.colors.textPrimary }]}>
          Family Subscription & Tier
        </Text>
        <Text style={[styles.subtitle, { color: skin.colors.textSecondary }]}>
          Friendly one-time lifetime upgrades
        </Text>
      </View>

      <View
        style={[
          styles.planCard,
          {
            backgroundColor: skin.colors.surface,
            borderColor: skin.colors.surfaceBorder,
            shadowColor: skin.colors.cardShadow,
          },
        ]}>
        <View style={styles.cardTop}>
          <View style={styles.planBadgeRow}>
            <View style={[styles.badge, { backgroundColor: skin.colors.accentLight }]}>
              <Text style={[styles.badgeText, { color: skin.colors.accentDark }]}>
                {plan.badge} Tier
              </Text>
            </View>
            <Text style={[styles.planTitle, { color: skin.colors.textPrimary }]}>
              {plan.name}
            </Text>
          </View>

          <Text style={[styles.priceTag, { color: skin.colors.accent }]}>
            {plan.priceFormatted}
          </Text>
        </View>

        {/* Limits Grid */}
        <View style={styles.statsGrid}>
          <View
            style={[
              styles.statBox,
              {
                backgroundColor: skin.colors.surfaceElevated,
                borderColor: skin.colors.surfaceBorder,
              },
            ]}>
            <Ionicons name="people-outline" size={18} color={skin.colors.accent} />
            <View style={styles.statTexts}>
              <Text style={[styles.statValue, { color: skin.colors.textPrimary }]}>
                {members.length} / {maxMembers === Infinity ? '∞' : maxMembers}
              </Text>
              <Text style={[styles.statLabel, { color: skin.colors.textSecondary }]}>
                Family Slots
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.statBox,
              {
                backgroundColor: skin.colors.surfaceElevated,
                borderColor: skin.colors.surfaceBorder,
              },
            ]}>
            <Ionicons name="trophy-outline" size={18} color={skin.colors.accent} />
            <View style={styles.statTexts}>
              <Text style={[styles.statValue, { color: skin.colors.textPrimary }]}>
                {levelCap === Infinity ? 'No Cap' : `Cap: Lv ${levelCap}`}
              </Text>
              <Text style={[styles.statLabel, { color: skin.colors.textSecondary }]}>
                Level Limit
              </Text>
            </View>
          </View>
        </View>

        {/* Upgrade Button if not already premium */}
        {household.tier !== 'premium' ? (
          <Pressable
            onPress={onUpgradePress}
            style={({ pressed }) => [
              styles.upgradeBtn,
              {
                backgroundColor: skin.colors.accent,
                opacity: pressed ? 0.8 : 1,
              },
            ]}>
            <Ionicons name="sparkles" size={16} color="#FFFFFF" />
            <Text style={styles.upgradeBtnText}>Upgrade Family Plan</Text>
          </Pressable>
        ) : (
          <View style={[styles.maxTierNotice, { backgroundColor: skin.colors.accentLight }]}>
            <Ionicons name="checkmark-circle" size={18} color={skin.colors.accentDark} />
            <Text style={[styles.maxTierText, { color: skin.colors.accentDark }]}>
              You hold the Premium Family Lifetime Plan. All themes and unlimited members unlocked!
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginBottom: 20,
  },
  header: {
    marginBottom: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  planCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  planBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  planTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  priceTag: {
    fontSize: 13,
    fontWeight: '700',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  statBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  statTexts: {
    flex: 1,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  upgradeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  upgradeBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  maxTierNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  maxTierText: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
});
