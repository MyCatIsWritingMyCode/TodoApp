import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSkin } from '../../theme/SkinProvider';
import { useHouseholdStore } from '../../store/useHouseholdStore';
import { canAddMember } from '../../config/plans.config';

interface MembersManagerProps {
  onAddMemberPress: () => void;
  onPaywallTrigger: (reason: string) => void;
}

export function MembersManager({ onAddMemberPress, onPaywallTrigger }: MembersManagerProps) {
  const { skin, loadMemberSkin, allSkins } = useSkin();
  const members = useHouseholdStore((s) => s.members);
  const currentMemberId = useHouseholdStore((s) => s.currentMemberId);
  const setCurrentMemberId = useHouseholdStore((s) => s.setCurrentMemberId);
  const household = useHouseholdStore((s) => s.household);

  const handleSelectActive = (memberId: string) => {
    setCurrentMemberId(memberId);
    loadMemberSkin(memberId);
  };

  const handleAdd = () => {
    if (canAddMember(members.length, household.tier)) {
      onAddMemberPress();
    } else {
      onPaywallTrigger('Free Starter Plan allows up to 2 members. Upgrade to Basic or Premium to add more family members!');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: skin.colors.textPrimary }]}>
            Family Members ({members.length})
          </Text>
          <Text style={[styles.subtitle, { color: skin.colors.textSecondary }]}>
            Tap a profile to switch active user and load their personal theme
          </Text>
        </View>

        <Pressable
          onPress={handleAdd}
          style={({ pressed }) => [
            styles.addBtn,
            {
              backgroundColor: skin.colors.accentLight,
              borderColor: skin.colors.accent,
              opacity: pressed ? 0.8 : 1,
            },
          ]}>
          <Ionicons name="person-add" size={14} color={skin.colors.accentDark} />
          <Text style={[styles.addBtnText, { color: skin.colors.accentDark }]}>Add</Text>
        </Pressable>
      </View>

      <View style={styles.membersList}>
        {members.map((member) => {
          const isActive = currentMemberId === member.id;
          const memberSkinName = member.activeSkinId ? allSkins[member.activeSkinId]?.name : 'Vanilla Linen';

          return (
            <Pressable
              key={member.id}
              onPress={() => handleSelectActive(member.id)}
              style={({ pressed }) => [
                styles.memberCard,
                {
                  backgroundColor: isActive ? skin.colors.accentLight : skin.colors.surface,
                  borderColor: isActive ? skin.colors.accent : skin.colors.surfaceBorder,
                  opacity: pressed ? 0.8 : 1,
                },
              ]}>
              {/* Avatar */}
              <View style={[styles.avatarCircle, { borderColor: member.color }]}>
                <Text style={styles.avatarEmoji}>{member.avatar}</Text>
                {isActive && (
                  <View style={[styles.activeDot, { backgroundColor: skin.colors.success }]} />
                )}
              </View>

              {/* Info */}
              <View style={styles.infoCol}>
                <View style={styles.nameRow}>
                  <Text style={[styles.memberName, { color: skin.colors.textPrimary }]}>
                    {member.name}
                  </Text>
                  {member.role === 'owner' && (
                    <View style={[styles.roleBadge, { backgroundColor: skin.colors.surfaceElevated }]}>
                      <Text style={[styles.roleText, { color: skin.colors.textSecondary }]}>
                        HOUSE HOLD OWNER
                      </Text>
                    </View>
                  )}
                </View>

                <Text style={[styles.statsLine, { color: skin.colors.textSecondary }]}>
                  +{member.xpContributed} XP contributed • {member.tasksCompleted} completed
                </Text>
                <Text style={[styles.skinTag, { color: skin.colors.accentDark }]}>
                  🎨 Preferred Skin: {memberSkinName}
                </Text>
              </View>

              {/* Active check */}
              {isActive && (
                <View style={[styles.currentPill, { backgroundColor: skin.colors.accent }]}>
                  <Text style={styles.currentPillText}>ACTIVE</Text>
                </View>
              )}
            </Pressable>
          );
        })}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    maxWidth: '75%',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    gap: 4,
  },
  addBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  membersList: {
    gap: 8,
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    gap: 12,
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  avatarEmoji: {
    fontSize: 20,
  },
  activeDot: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  infoCol: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  memberName: {
    fontSize: 14,
    fontWeight: '700',
  },
  roleBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  roleText: {
    fontSize: 8,
    fontWeight: '800',
  },
  statsLine: {
    fontSize: 11,
    marginTop: 2,
  },
  skinTag: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  currentPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  currentPillText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
});
