import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSkin } from '../../theme/SkinProvider';
import { useTranslation } from '../../i18n/LanguageProvider';
import { useHouseholdStore } from '../../store/useHouseholdStore';
import { canAddMember } from '../../config/plans.config';

interface FamilyFilterBarProps {
  onAddMemberPress: () => void;
  onPaywallTrigger: () => void;
}

export function FamilyFilterBar({ onAddMemberPress, onPaywallTrigger }: FamilyFilterBarProps) {
  const { skin, loadMemberSkin } = useSkin();
  const { t } = useTranslation();
  const members = useHouseholdStore((s) => s.members);
  const activeFilterId = useHouseholdStore((s) => s.activeMemberFilterId);
  const setActiveFilterId = useHouseholdStore((s) => s.setActiveMemberFilterId);
  const currentMemberId = useHouseholdStore((s) => s.currentMemberId);
  const setCurrentMemberId = useHouseholdStore((s) => s.setCurrentMemberId);
  const household = useHouseholdStore((s) => s.household);

  const handleMemberPress = (memberId: string) => {
    setActiveFilterId(memberId);
    if (memberId !== 'all') {
      setCurrentMemberId(memberId);
      loadMemberSkin(memberId);
    }
  };

  const handleAddMember = () => {
    if (canAddMember(members.length, household.tier)) {
      onAddMemberPress();
    } else {
      onPaywallTrigger();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={[styles.sectionTitle, { color: skin.colors.textPrimary }]}>
          {t.tasks.familyMembers}
        </Text>
        <Text style={[styles.subHint, { color: skin.colors.textMuted }]}>
          {activeFilterId === 'all' ? t.tasks.allFamily : t.tasks.assignedTo}
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {/* 'All' Filter Pill */}
        <Pressable
          onPress={() => setActiveFilterId('all')}
          style={({ pressed }) => [
            styles.memberCard,
            {
              backgroundColor: activeFilterId === 'all' ? skin.colors.accent : skin.colors.surface,
              borderColor: activeFilterId === 'all' ? skin.colors.accent : skin.colors.surfaceBorder,
              opacity: pressed ? 0.8 : 1,
            },
          ]}>
          <View style={[styles.allAvatarCircle, { backgroundColor: activeFilterId === 'all' ? '#FFFFFF33' : skin.colors.surfaceElevated }]}>
            <Text style={styles.allAvatarText}>👥</Text>
          </View>
          <Text
            style={[
              styles.memberName,
              { color: activeFilterId === 'all' ? '#FFFFFF' : skin.colors.textPrimary },
            ]}>
            {t.tasks.allFamily}
          </Text>
        </Pressable>

        {/* Individual Members */}
        {members.map((member) => {
          const isSelected = activeFilterId === member.id;
          const isCurrentActive = currentMemberId === member.id;

          return (
            <Pressable
              key={member.id}
              onPress={() => handleMemberPress(member.id)}
              style={({ pressed }) => [
                styles.memberCard,
                {
                  backgroundColor: isSelected ? skin.colors.accent : skin.colors.surface,
                  borderColor: isSelected ? skin.colors.accent : skin.colors.surfaceBorder,
                  opacity: pressed ? 0.8 : 1,
                },
              ]}>
              <View style={[styles.avatarCircle, { borderColor: member.color }]}>
                <Text style={styles.avatarEmoji}>{member.avatar}</Text>
                {isCurrentActive && (
                  <View style={[styles.activeDot, { backgroundColor: skin.colors.success }]} />
                )}
              </View>

              <View style={styles.memberInfo}>
                <Text
                  numberOfLines={1}
                  style={[
                    styles.memberName,
                    { color: isSelected ? '#FFFFFF' : skin.colors.textPrimary },
                  ]}>
                  {member.name.split(' ')[0]}
                </Text>
                <Text
                  style={[
                    styles.memberXp,
                    { color: isSelected ? '#FFFFFFCC' : skin.colors.textSecondary },
                  ]}>
                  +{member.xpContributed} XP
                </Text>
              </View>
            </Pressable>
          );
        })}

        {/* Add Member Button with Soft Paywall indicator if at limit */}
        <Pressable
          onPress={handleAddMember}
          style={({ pressed }) => [
            styles.addMemberCard,
            {
              backgroundColor: skin.colors.surfaceElevated,
              borderColor: skin.colors.surfaceBorder,
              opacity: pressed ? 0.8 : 1,
            },
          ]}>
          <View style={[styles.addIconCircle, { backgroundColor: skin.colors.accentLight }]}>
            <Ionicons name="person-add" size={16} color={skin.colors.accentDark} />
          </View>
          <Text style={[styles.addMemberText, { color: skin.colors.textPrimary }]}>
            {t.settings.addMemberBtn}
          </Text>
          {!canAddMember(members.length, household.tier) && (
            <View style={[styles.lockBadge, { backgroundColor: skin.colors.accent }]}>
              <Ionicons name="lock-closed" size={10} color="#FFFFFF" />
            </View>
          )}
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  subHint: {
    fontSize: 11,
    fontWeight: '500',
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 24,
    borderWidth: 1.5,
    gap: 8,
  },
  allAvatarCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  allAvatarText: {
    fontSize: 14,
  },
  avatarCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  avatarEmoji: {
    fontSize: 16,
  },
  activeDot: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  memberInfo: {
    justifyContent: 'center',
  },
  memberName: {
    fontSize: 13,
    fontWeight: '700',
  },
  memberXp: {
    fontSize: 10,
    fontWeight: '600',
  },
  addMemberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 24,
    borderWidth: 1,
    borderStyle: 'dashed',
    gap: 8,
    position: 'relative',
  },
  addIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addMemberText: {
    fontSize: 13,
    fontWeight: '600',
  },
  lockBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
