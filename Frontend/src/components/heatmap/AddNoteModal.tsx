import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSkin } from '../../theme/SkinProvider';
import { useHouseholdStore } from '../../store/useHouseholdStore';

interface AddNoteModalProps {
  visible: boolean;
  onClose: () => void;
}

const NOTE_COLORS = [
  { name: 'Butter Yellow', hex: '#FEF08A' },
  { name: 'Pastel Rose', hex: '#FECDD3' },
  { name: 'Sky Blue', hex: '#BAE6FD' },
  { name: 'Mint Green', hex: '#BBF7D0' },
  { name: 'Soft Lavender', hex: '#E9D5FF' },
  { name: 'Warm Peach', hex: '#FED7AA' },
];

export function AddNoteModal({ visible, onClose }: AddNoteModalProps) {
  const { skin } = useSkin();
  const addNote = useHouseholdStore((s) => s.addNote);
  const members = useHouseholdStore((s) => s.members);
  const currentMemberId = useHouseholdStore((s) => s.currentMemberId);

  const currentMember = members.find((m) => m.id === currentMemberId) ?? members[0];

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [color, setColor] = useState(NOTE_COLORS[0].hex);
  const [isPinned, setIsPinned] = useState(false);

  const handleSave = () => {
    if (!content.trim()) return;

    addNote({
      title: title.trim() ? title.trim() : undefined,
      content: content.trim(),
      color,
      authorId: currentMember.id,
      authorName: currentMember.name,
      authorAvatar: currentMember.avatar,
      isPinned,
    });

    setTitle('');
    setContent('');
    setIsPinned(false);
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
                Post Sticky Note
              </Text>
              <Text style={[styles.subtitle, { color: skin.colors.textSecondary }]}>
                Add a quick message to the family pinboard
              </Text>
            </View>
            <Pressable onPress={onClose} hitSlop={10}>
              <Ionicons name="close" size={22} color={skin.colors.textMuted} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
            {/* Title (Optional) */}
            <Text style={[styles.label, { color: skin.colors.textSecondary }]}>
              Note Title (Optional)
            </Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="e.g. 📶 Wi-Fi Password or 🛒 Groceries"
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

            {/* Content (Required) */}
            <Text style={[styles.label, { color: skin.colors.textSecondary }]}>
              Message Content *
            </Text>
            <TextInput
              value={content}
              onChangeText={setContent}
              placeholder="Type your message, code, or reminder here..."
              placeholderTextColor={skin.colors.textMuted}
              multiline
              numberOfLines={4}
              style={[
                styles.input,
                styles.textArea,
                {
                  backgroundColor: skin.colors.surfaceElevated,
                  borderColor: skin.colors.surfaceBorder,
                  color: skin.colors.textPrimary,
                },
              ]}
            />

            {/* Note Color Palette */}
            <Text style={[styles.label, { color: skin.colors.textSecondary }]}>
              Sticky Paper Color
            </Text>
            <View style={styles.colorsRow}>
              {NOTE_COLORS.map((c) => {
                const isSelected = color === c.hex;
                return (
                  <Pressable
                    key={c.hex}
                    onPress={() => setColor(c.hex)}
                    style={[
                      styles.colorPill,
                      {
                        backgroundColor: c.hex,
                        borderColor: isSelected ? '#1C1917' : 'rgba(0,0,0,0.15)',
                        borderWidth: isSelected ? 2.5 : 1,
                      },
                    ]}>
                    {isSelected && <Ionicons name="checkmark" size={16} color="#1C1917" />}
                  </Pressable>
                );
              })}
            </View>

            {/* Pin to Top Checkbox */}
            <Pressable
              onPress={() => setIsPinned(!isPinned)}
              style={[
                styles.pinToggleRow,
                {
                  backgroundColor: skin.colors.surfaceElevated,
                  borderColor: skin.colors.surfaceBorder,
                },
              ]}>
              <View style={styles.pinToggleLeft}>
                <Text style={styles.pinIcon}>📌</Text>
                <View>
                  <Text style={[styles.pinToggleTitle, { color: skin.colors.textPrimary }]}>
                    Pin Note to Top
                  </Text>
                  <Text style={[styles.pinToggleSub, { color: skin.colors.textSecondary }]}>
                    Keep highlighted at the top of the pinboard
                  </Text>
                </View>
              </View>

              <View
                style={[
                  styles.checkbox,
                  {
                    backgroundColor: isPinned ? skin.colors.accent : 'transparent',
                    borderColor: isPinned ? skin.colors.accent : skin.colors.surfaceBorder,
                  },
                ]}>
                {isPinned && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
              </View>
            </Pressable>

            {/* Submit */}
            <Pressable
              disabled={!content.trim()}
              onPress={handleSave}
              style={({ pressed }) => [
                styles.submitBtn,
                {
                  backgroundColor: content.trim() ? skin.colors.accent : skin.colors.surfaceBorder,
                  opacity: pressed ? 0.8 : 1,
                },
              ]}>
              <Ionicons name="pin" size={18} color="#FFFFFF" />
              <Text style={styles.submitBtnText}>Post to Pinboard</Text>
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
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  colorsRow: {
    flexDirection: 'row',
    gap: 10,
    marginVertical: 4,
  },
  colorPill: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pinToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 14,
  },
  pinToggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  pinIcon: {
    fontSize: 18,
  },
  pinToggleTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  pinToggleSub: {
    fontSize: 11,
    marginTop: 1,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
    marginTop: 20,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
