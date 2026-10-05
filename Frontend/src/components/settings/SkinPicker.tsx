import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSkin } from '../../theme/SkinProvider';
import { useHouseholdStore } from '../../store/useHouseholdStore';
import { SkinId } from '../../theme/types';
import { isSkinUnlockedForTier } from '../../config/plans.config';

interface SkinPickerProps {
  onPaywallTrigger: (reason: string) => void;
}

export function SkinPicker({ onPaywallTrigger }: SkinPickerProps) {
  const { skin, skinId, setSkin, allSkins, setMemberSkin } = useSkin();
  const household = useHouseholdStore((s) => s.household);
  const currentMemberId = useHouseholdStore((s) => s.currentMemberId);
  const members = useHouseholdStore((s) => s.members);

  const currentMember = members.find((m) => m.id === currentMemberId);

  const handleSelectSkin = (id: SkinId) => {
    const isUnlocked = isSkinUnlockedForTier(id, household.tier);
    if (!isUnlocked) {
      const required = allSkins[id]?.requiredTier === 'premium' ? 'Premium Family' : 'Basic Family';
      onPaywallTrigger(`The "${allSkins[id]?.name}" theme requires the ${required} Plan.`);
      return;
    }

    setSkin(id);
    if (currentMemberId) {
      setMemberSkin(currentMemberId, id);
    }
  };

  const skinList = Object.values(allSkins);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: skin.colors.textPrimary }]}>
            Active Theme & Style
          </Text>
          <Text style={[styles.subtitle, { color: skin.colors.textSecondary }]}>
            {currentMember
              ? `Personal skin for ${currentMember.name} • Each member has their own skin`
              : 'Governs all cards, accents, and surfaces'}
          </Text>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}>
        {skinList.map((item) => {
          const isSelected = skinId === item.id;
          const isUnlocked = isSkinUnlockedForTier(item.id, household.tier);

          return (
            <Pressable
              key={item.id}
              onPress={() => handleSelectSkin(item.id)}
              style={({ pressed }) => [
                styles.skinCard,
                {
                  backgroundColor: item.previewColors.surface,
                  borderColor: isSelected ? item.previewColors.accent : skin.colors.surfaceBorder,
                  borderWidth: isSelected ? 2.5 : 1,
                  opacity: pressed ? 0.8 : 1,
                },
              ]}>
              {/* Top swatch palette */}
              <View
                style={[
                  styles.previewBox,
                  { backgroundColor: item.previewColors.bg },
                ]}>
                <View
                  style={[
                    styles.mockCard,
                    {
                      backgroundColor: item.previewColors.surface,
                      borderColor: item.previewColors.accent + '40',
                    },
                  ]}>
                  <View
                    style={[
                      styles.mockDot,
                      { backgroundColor: item.previewColors.accent },
                    ]}
                  />
                  <View
                    style={[
                      styles.mockLine,
                      { backgroundColor: item.previewColors.text + '80' },
                    ]}
                  />
                </View>
              </View>

              {/* Skin Info */}
              <View style={styles.infoBox}>
                <View style={styles.nameRow}>
                  <Text
                    style={[
                      styles.skinName,
                      { color: item.previewColors.text },
                    ]}>
                    {item.name}
                  </Text>
                  {isSelected && (
                    <Ionicons name="checkmark-circle" size={16} color={item.previewColors.accent} />
                  )}
                  {!isUnlocked && (
                    <Ionicons name="lock-closed" size={14} color={skin.colors.textMuted} />
                  )}
                </View>

                <Text
                  style={[
                    styles.tagText,
                    { color: item.previewColors.accent },
                  ]}>
                  {item.tag}
                </Text>

                <Text
                  numberOfLines={2}
                  style={[
                    styles.skinDescription,
                    { color: item.previewColors.text + 'AA' },
                  ]}>
                  {item.description}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  header: {
    paddingHorizontal: 16,
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
  scroll: {
    paddingHorizontal: 16,
    gap: 12,
  },
  skinCard: {
    width: 200,
    borderRadius: 16,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  previewBox: {
    height: 75,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  mockCard: {
    width: '80%',
    padding: 8,
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  mockDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  mockLine: {
    height: 6,
    width: '60%',
    borderRadius: 3,
  },
  infoBox: {
    padding: 12,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  skinName: {
    fontSize: 14,
    fontWeight: '700',
  },
  tagText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  skinDescription: {
    fontSize: 11,
    lineHeight: 15,
  },
});
