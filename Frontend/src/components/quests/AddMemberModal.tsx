import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSkin } from '../../theme/SkinProvider';
import { useHouseholdStore } from '../../store/useHouseholdStore';

interface AddMemberModalProps {
  visible: boolean;
  onClose: () => void;
  onPaywallTrigger: (reason: string) => void;
}

const AVATAR_OPTIONS = ['🦁', '🦉', '🚀', '🎨', '🦊', '🐼', '🦄', '🧙', '⚡', '🌟'];
const COLOR_OPTIONS = ['#3B82F6', '#EC4899', '#10B981', '#F59E0B', '#8B5CF6', '#06B6D4'];

export function AddMemberModal({ visible, onClose, onPaywallTrigger }: AddMemberModalProps) {
  const { skin, allSkins } = useSkin();
  const addMember = useHouseholdStore((s) => s.addMember);

  const [name, setName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('🦊');
  const [selectedColor, setSelectedColor] = useState('#3B82F6');
  const [selectedSkinId, setSelectedSkinId] = useState('vanilla');

  const handleSave = () => {
    if (!name.trim()) return;

    const result = addMember({
      name: name.trim(),
      avatar: selectedAvatar,
      color: selectedColor,
      role: 'member',
      activeSkinId: selectedSkinId,
    });

    if (!result.success) {
      onClose();
      onPaywallTrigger(result.message ?? 'Member limit reached for current plan.');
      return;
    }

    setName('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.backdrop}>
        <Pressable style={styles.dismissOverlay} onPress={onClose} />

        <View
          style={[
            styles.modalContent,
            {
              backgroundColor: skin.colors.surface,
              borderColor: skin.colors.surfaceBorder,
            },
          ]}>
          <View style={styles.header}>
            <View>
              <Text style={[styles.title, { color: skin.colors.textPrimary }]}>
                Add Family Member
              </Text>
              <Text style={[styles.subtitle, { color: skin.colors.textSecondary }]}>
                Join the family chore list
              </Text>
            </View>
            <Pressable onPress={onClose} hitSlop={10}>
              <Ionicons name="close" size={22} color={skin.colors.textMuted} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
            {/* Name */}
            <Text style={[styles.label, { color: skin.colors.textSecondary }]}>
              Name or Nickname *
            </Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="e.g. Sam, Grandma, Little Scout"
              placeholderTextColor={skin.colors.textMuted}
              style={[
                styles.input,
                {
                  backgroundColor: skin.colors.surfaceElevated,
                  borderColor: skin.colors.surfaceBorder,
                  color: skin.colors.textPrimary,
                },
              ]}
            />

            {/* Avatar Emoji */}
            <Text style={[styles.label, { color: skin.colors.textSecondary }]}>
              Choose Avatar
            </Text>
            <View style={styles.emojisRow}>
              {AVATAR_OPTIONS.map((emoji) => {
                const isSelected = selectedAvatar === emoji;
                return (
                  <Pressable
                    key={emoji}
                    onPress={() => setSelectedAvatar(emoji)}
                    style={[
                      styles.avatarBtn,
                      {
                        backgroundColor: isSelected ? skin.colors.accentLight : skin.colors.surfaceElevated,
                        borderColor: isSelected ? skin.colors.accent : skin.colors.surfaceBorder,
                      },
                    ]}>
                    <Text style={styles.avatarEmoji}>{emoji}</Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Color Accent */}
            <Text style={[styles.label, { color: skin.colors.textSecondary }]}>
              Member Tag Color
            </Text>
            <View style={styles.colorsRow}>
              {COLOR_OPTIONS.map((col) => {
                const isSelected = selectedColor === col;
                return (
                  <Pressable
                    key={col}
                    onPress={() => setSelectedColor(col)}
                    style={[
                      styles.colorCircle,
                      {
                        backgroundColor: col,
                        borderColor: isSelected ? skin.colors.textPrimary : 'transparent',
                      },
                    ]}>
                    {isSelected && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
                  </Pressable>
                );
              })}
            </View>

            {/* Initial Skin Selection for Member */}
            <Text style={[styles.label, { color: skin.colors.textSecondary }]}>
              {"Member's Personal UI Skin"}
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.skinsRow}>
              {['vanilla', 'berry', 'dark', 'light'].map((sId) => {
                const isSelected = selectedSkinId === sId;
                const skinObj = allSkins[sId];
                return (
                  <Pressable
                    key={sId}
                    onPress={() => setSelectedSkinId(sId)}
                    style={[
                      styles.skinChip,
                      {
                        backgroundColor: isSelected ? skin.colors.accent : skin.colors.surfaceElevated,
                        borderColor: isSelected ? skin.colors.accent : skin.colors.surfaceBorder,
                      },
                    ]}>
                    <View
                      style={[
                        styles.skinDot,
                        { backgroundColor: skinObj?.previewColors.accent ?? '#333' },
                      ]}
                    />
                    <Text
                      style={[
                        styles.skinChipText,
                        { color: isSelected ? '#FFFFFF' : skin.colors.textPrimary },
                      ]}>
                      {skinObj?.name.split(' ')[0]}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            {/* Submit */}
            <Pressable
              disabled={!name.trim()}
              onPress={handleSave}
              style={({ pressed }) => [
                styles.saveBtn,
                {
                  backgroundColor: name.trim() ? skin.colors.accent : skin.colors.surfaceBorder,
                  opacity: pressed ? 0.8 : 1,
                },
              ]}>
              <Ionicons name="person-add" size={18} color="#FFFFFF" />
              <Text style={styles.saveBtnText}>Join Household</Text>
            </Pressable>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  dismissOverlay: {
    flex: 1,
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderBottomWidth: 0,
    maxHeight: '85%',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  scroll: {
    paddingBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 12,
    marginBottom: 6,
  },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
  },
  emojisRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  avatarBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarEmoji: {
    fontSize: 22,
  },
  colorsRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  colorCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  skinsRow: {
    gap: 8,
    paddingVertical: 4,
  },
  skinChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    gap: 6,
  },
  skinDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  skinChipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
    marginTop: 20,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
