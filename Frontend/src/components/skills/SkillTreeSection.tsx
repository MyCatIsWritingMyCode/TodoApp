import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSkin } from '../../theme/SkinProvider';
import { useHouseholdStore } from '../../store/useHouseholdStore';
import { PerkItem } from '../../types/household';

export function SkillTreeSection() {
  const { skin } = useSkin();
  const perks = useHouseholdStore((s) => s.perks);
  const household = useHouseholdStore((s) => s.household);
  const unlockPerk = useHouseholdStore((s) => s.unlockPerk);

  const tiers: { tier: 1 | 2 | 3; name: string; reqTitle: string }[] = [
    { tier: 1, name: 'Tier 1 • Starter Perks', reqTitle: 'Requires Household Level 2–4' },
    { tier: 2, name: 'Tier 2 • Teamwork Perks', reqTitle: 'Requires Household Level 5–8' },
    { tier: 3, name: 'Tier 3 • Household Mastery', reqTitle: 'Requires Household Level 10+' },
  ];

  const handleUnlock = async (perk: PerkItem) => {
    if (perk.unlocked) return;
    if (household.level < perk.requiredLevel) return;
    if (household.skillPoints < perk.cost) return;

    await unlockPerk(perk.id);
  };

  return (
    <View style={styles.container}>
      {/* Skill Points Header Hero */}
      <View
        style={[
          styles.heroCard,
          {
            backgroundColor: skin.colors.surface,
            borderColor: skin.colors.surfaceBorder,
            shadowColor: skin.colors.cardShadow,
          },
        ]}>
        <View style={styles.heroLeft}>
          <View style={[styles.starBadge, { backgroundColor: skin.colors.accentLight }]}>
            <Text style={styles.heroStarIcon}>⭐</Text>
          </View>
          <View>
            <Text style={[styles.heroPoints, { color: skin.colors.textPrimary }]}>
              {household.skillPoints} Perk Points
            </Text>
            <Text style={[styles.heroSub, { color: skin.colors.textSecondary }]}>
              Earn +1 point each time your household levels up
            </Text>
          </View>
        </View>

        <View style={[styles.activePerksBadge, { backgroundColor: skin.colors.surfaceElevated }]}>
          <Text style={[styles.activePerksCount, { color: skin.colors.accent }]}>
            {household.unlockedPerkIds.length} Active
          </Text>
        </View>
      </View>

      {/* Perk Tiers */}
      {tiers.map((t) => {
        const tierPerks = perks.filter((p) => p.tierLevel === t.tier);

        return (
          <View key={t.tier} style={styles.tierSection}>
            <View style={styles.tierHeader}>
              <Text style={[styles.tierTitle, { color: skin.colors.textPrimary }]}>
                {t.name}
              </Text>
              <Text style={[styles.tierSub, { color: skin.colors.textMuted }]}>
                {t.reqTitle}
              </Text>
            </View>

            <View style={styles.perksList}>
              {tierPerks.map((perk) => {
                const isLevelMet = household.level >= perk.requiredLevel;
                const canAfford = household.skillPoints >= perk.cost;
                const isAvailable = isLevelMet && canAfford && !perk.unlocked;

                return (
                  <View
                    key={perk.id}
                    style={[
                      styles.perkCard,
                      {
                        backgroundColor: perk.unlocked
                          ? skin.colors.surfaceElevated
                          : isAvailable
                          ? skin.colors.surface
                          : skin.colors.surfaceElevated,
                        borderColor: perk.unlocked
                          ? skin.colors.success
                          : isAvailable
                          ? skin.colors.accent
                          : skin.colors.surfaceBorder,
                        opacity: isLevelMet ? 1 : 0.6,
                      },
                    ]}>
                    {/* Perk Icon */}
                    <View
                      style={[
                        styles.perkIconBox,
                        {
                          backgroundColor: perk.unlocked
                            ? skin.colors.success + '20'
                            : isAvailable
                            ? skin.colors.accentLight
                            : skin.colors.surfaceBorder,
                        },
                      ]}>
                      <Ionicons
                        name={perk.icon as any}
                        size={22}
                        color={
                          perk.unlocked
                            ? skin.colors.success
                            : isAvailable
                            ? skin.colors.accentDark
                            : skin.colors.textMuted
                        }
                      />
                    </View>

                    {/* Perk Info */}
                    <View style={styles.perkInfo}>
                      <View style={styles.perkTitleRow}>
                        <Text style={[styles.perkTitle, { color: skin.colors.textPrimary }]}>
                          {perk.title}
                        </Text>
                        {perk.unlocked && (
                          <View
                            style={[
                              styles.unlockedPill,
                              { backgroundColor: skin.colors.success + '20' },
                            ]}>
                            <Ionicons name="checkmark-circle" size={12} color={skin.colors.success} />
                            <Text style={[styles.unlockedPillText, { color: skin.colors.success }]}>
                              ACTIVE
                            </Text>
                          </View>
                        )}
                      </View>

                      <Text style={[styles.perkDescription, { color: skin.colors.textSecondary }]}>
                        {perk.description}
                      </Text>

                      <View style={styles.perkBottomRow}>
                        <View style={styles.effectTag}>
                          <Ionicons name="flash-outline" size={11} color={skin.colors.accent} />
                          <Text style={[styles.effectText, { color: skin.colors.accent }]}>
                            {perk.effect}
                          </Text>
                        </View>

                        {/* Status / Action Button */}
                        {!perk.unlocked && (
                          <Pressable
                            disabled={!isAvailable}
                            onPress={() => handleUnlock(perk)}
                            style={({ pressed }) => [
                              styles.unlockButton,
                              {
                                backgroundColor: isAvailable
                                  ? skin.colors.accent
                                  : skin.colors.surfaceBorder,
                                opacity: pressed ? 0.8 : 1,
                              },
                            ]}>
                            {!isLevelMet ? (
                              <Text style={[styles.unlockButtonText, { color: skin.colors.textMuted }]}>
                                Lv {perk.requiredLevel} Req
                              </Text>
                            ) : (
                              <Text
                                style={[
                                  styles.unlockButtonText,
                                  { color: isAvailable ? '#FFFFFF' : skin.colors.textMuted },
                                ]}>
                                Unlock ({perk.cost} Pt{perk.cost > 1 ? 's' : ''})
                              </Text>
                            )}
                          </Pressable>
                        )}
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 24,
  },
  heroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 20,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  heroLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  starBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroStarIcon: {
    fontSize: 22,
  },
  heroPoints: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  heroSub: {
    fontSize: 11,
    marginTop: 2,
  },
  activePerksBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  activePerksCount: {
    fontSize: 12,
    fontWeight: '700',
  },
  tierSection: {
    marginBottom: 22,
  },
  tierHeader: {
    marginBottom: 10,
  },
  tierTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  tierSub: {
    fontSize: 11,
    marginTop: 2,
  },
  perksList: {
    gap: 10,
  },
  perkCard: {
    flexDirection: 'row',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    gap: 12,
  },
  perkIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  perkInfo: {
    flex: 1,
  },
  perkTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  perkTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  unlockedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 6,
    gap: 4,
  },
  unlockedPillText: {
    fontSize: 10,
    fontWeight: '800',
  },
  perkDescription: {
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 8,
  },
  perkBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  effectTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
    marginRight: 8,
  },
  effectText: {
    fontSize: 11,
    fontWeight: '600',
  },
  unlockButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  unlockButtonText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
