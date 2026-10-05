import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSkin } from '../../theme/SkinProvider';
import { useHouseholdStore } from '../../store/useHouseholdStore';

export function UnlockablesShowcase() {
  const { skin } = useSkin();
  const household = useHouseholdStore((s) => s.household);

  const unlockables = [
    {
      type: 'Avatar Frame',
      name: 'Bronze Star Frame',
      icon: 'star-outline',
      requiredLevel: 3,
      isUnlocked: household.level >= 3,
      rewardText: 'Level 3 Reward',
    },
    {
      type: 'Avatar Frame',
      name: 'Silver Star Frame',
      icon: 'ribbon-outline',
      requiredLevel: 5,
      isUnlocked: household.level >= 5,
      rewardText: 'Level 5 Reward',
    },
    {
      type: 'UI Theme',
      name: 'Cyberpunk Neon',
      icon: 'color-palette-outline',
      requiredLevel: 10,
      isUnlocked: household.unlockedSkinIds.includes('cyberpunk'),
      rewardText: 'Basic Tier or Lv 10',
    },
    {
      type: 'Task Icon Pack',
      name: 'Bonus Chore Badges',
      icon: 'shapes-outline',
      requiredLevel: 8,
      isUnlocked: household.level >= 8,
      rewardText: 'Level 8 Reward',
    },
    {
      type: 'UI Theme',
      name: 'Golden Royal Edition',
      icon: 'sparkles',
      requiredLevel: 25,
      isUnlocked: household.unlockedSkinIds.includes('golden_royal'),
      rewardText: 'Premium Tier Unlock',
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: skin.colors.textPrimary }]}>
        Family Level Milestones
      </Text>
      <Text style={[styles.sectionSub, { color: skin.colors.textSecondary }]}>
        Earned automatically as your family completes tasks and reaches new levels
      </Text>

      <View style={styles.grid}>
        {unlockables.map((item, idx) => {
          return (
            <View
              key={idx}
              style={[
                styles.itemCard,
                {
                  backgroundColor: item.isUnlocked ? skin.colors.surface : skin.colors.surfaceElevated,
                  borderColor: item.isUnlocked ? skin.colors.accent : skin.colors.surfaceBorder,
                  opacity: item.isUnlocked ? 1 : 0.65,
                },
              ]}>
              <View
                style={[
                  styles.iconCircle,
                  {
                    backgroundColor: item.isUnlocked ? skin.colors.accentLight : skin.colors.surfaceBorder,
                  },
                ]}>
                <Ionicons
                  name={item.icon as any}
                  size={20}
                  color={item.isUnlocked ? skin.colors.accentDark : skin.colors.textMuted}
                />
              </View>

              <Text style={[styles.itemType, { color: skin.colors.textMuted }]}>
                {item.type}
              </Text>
              <Text style={[styles.itemName, { color: skin.colors.textPrimary }]} numberOfLines={1}>
                {item.name}
              </Text>

              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor: item.isUnlocked ? skin.colors.success + '20' : skin.colors.surfaceBorder,
                  },
                ]}>
                <Ionicons
                  name={item.isUnlocked ? 'checkmark-circle' : 'lock-closed'}
                  size={11}
                  color={item.isUnlocked ? skin.colors.success : skin.colors.textMuted}
                />
                <Text
                  style={[
                    styles.statusText,
                    {
                      color: item.isUnlocked ? skin.colors.success : skin.colors.textMuted,
                    },
                  ]}>
                  {item.isUnlocked ? 'UNLOCKED' : item.rewardText}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2,
    marginBottom: 4,
  },
  sectionSub: {
    fontSize: 12,
    marginBottom: 14,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  itemCard: {
    width: '48%',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemType: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  itemName: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
    marginBottom: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: 6,
    gap: 4,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 9,
    fontWeight: '800',
  },
});
