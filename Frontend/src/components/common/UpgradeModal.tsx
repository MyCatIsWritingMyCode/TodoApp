import React from 'react';
import { View, Text, StyleSheet, Modal, Pressable, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSkin } from '../../theme/SkinProvider';
import { useHouseholdStore } from '../../store/useHouseholdStore';
import { SUBSCRIPTION_PLANS, SubscriptionTier, getUpgradePrice } from '../../config/plans.config';

interface UpgradeModalProps {
  visible: boolean;
  onClose: () => void;
  reason?: string;
}

export function UpgradeModal({ visible, onClose, reason }: UpgradeModalProps) {
  const { skin } = useSkin();
  const household = useHouseholdStore((s) => s.household);
  const upgradeTier = useHouseholdStore((s) => s.upgradeTier);

  const tiers: SubscriptionTier[] = ['basic', 'premium'];

  const handleSelectTier = (tier: SubscriptionTier) => {
    upgradeTier(tier);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable style={styles.dismissOverlay} onPress={onClose} />

        <View
          style={[
            styles.modalCard,
            {
              backgroundColor: skin.colors.surface,
              borderColor: skin.colors.surfaceBorder,
            },
          ]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.badgeRow}>
              <View style={[styles.crownIconCircle, { backgroundColor: skin.colors.accentLight }]}>
                <Ionicons name="sparkles" size={20} color={skin.colors.accentDark} />
              </View>
              <Text style={[styles.title, { color: skin.colors.textPrimary }]}>
                Upgrade Family Plan
              </Text>
            </View>
            <Pressable onPress={onClose} hitSlop={10}>
              <Ionicons name="close" size={24} color={skin.colors.textMuted} />
            </Pressable>
          </View>

          {reason ? (
            <View style={[styles.reasonBox, { backgroundColor: skin.colors.accentLight }]}>
              <Ionicons name="information-circle" size={18} color={skin.colors.accentDark} />
              <Text style={[styles.reasonText, { color: skin.colors.accentDark }]}>
                {reason}
              </Text>
            </View>
          ) : null}

          <Text style={[styles.philosophyNote, { color: skin.colors.textSecondary }]}>
            ✨ <Text style={{ fontWeight: '700' }}>One-Time Lifetime Unlocks</Text>. No recurring monthly subscriptions. Enjoy ChoreQuest together forever!
          </Text>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.tiersScroll}>
            {tiers.map((tierKey) => {
              const plan = SUBSCRIPTION_PLANS[tierKey];
              const isCurrent = household.tier === tierKey;
              const pricing = getUpgradePrice(household.tier, tierKey);

              return (
                <View
                  key={tierKey}
                  style={[
                    styles.planCard,
                    {
                      backgroundColor: skin.colors.surfaceElevated,
                      borderColor: plan.highlight ? skin.colors.accent : skin.colors.surfaceBorder,
                    },
                  ]}>
                  {plan.highlight && (
                    <View style={[styles.popularBadge, { backgroundColor: skin.colors.accent }]}>
                      <Text style={styles.popularText}>MOST POPULAR</Text>
                    </View>
                  )}

                  <View style={styles.planHeader}>
                    <View>
                      <Text style={[styles.planName, { color: skin.colors.textPrimary }]}>
                        {plan.name}
                      </Text>
                      <Text style={[styles.planTagline, { color: skin.colors.textSecondary }]}>
                        {plan.tagline}
                      </Text>
                    </View>
                    <View style={styles.priceContainer}>
                      <Text style={[styles.priceAmount, { color: skin.colors.accent }]}>
                        {pricing.formatted}
                      </Text>
                    </View>
                  </View>

                  {/* Feature Checklist */}
                  <View style={styles.featuresList}>
                    {plan.features.map((feature, idx) => (
                      <View key={idx} style={styles.featureItem}>
                        <Ionicons name="checkmark-circle" size={16} color={skin.colors.success} />
                        <Text style={[styles.featureText, { color: skin.colors.textPrimary }]}>
                          {feature}
                        </Text>
                      </View>
                    ))}
                  </View>

                  {/* Upgrade / Current Button */}
                  <Pressable
                    disabled={isCurrent}
                    onPress={() => handleSelectTier(tierKey)}
                    style={({ pressed }) => [
                      styles.actionBtn,
                      {
                        backgroundColor: isCurrent ? skin.colors.surfaceBorder : skin.colors.accent,
                        opacity: pressed ? 0.8 : 1,
                      },
                    ]}>
                    <Text
                      style={[
                        styles.actionBtnText,
                        { color: isCurrent ? skin.colors.textMuted : '#FFFFFF' },
                      ]}>
                      {isCurrent ? 'Current Plan' : `Unlock ${plan.name}`}
                    </Text>
                  </Pressable>
                </View>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  dismissOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalCard: {
    width: '100%',
    maxWidth: 480,
    maxHeight: '85%',
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 6,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  crownIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  reasonBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    gap: 8,
  },
  reasonText: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  philosophyNote: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 14,
  },
  tiersScroll: {
    gap: 14,
    paddingBottom: 10,
  },
  planCard: {
    borderRadius: 18,
    borderWidth: 1.5,
    padding: 16,
    position: 'relative',
  },
  popularBadge: {
    position: 'absolute',
    top: -10,
    right: 16,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  popularText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  planName: {
    fontSize: 16,
    fontWeight: '800',
  },
  planTagline: {
    fontSize: 12,
    marginTop: 2,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  priceAmount: {
    fontSize: 14,
    fontWeight: '800',
  },
  featuresList: {
    gap: 6,
    marginBottom: 14,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureText: {
    fontSize: 13,
    fontWeight: '500',
  },
  actionBtn: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
