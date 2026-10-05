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
import { useTranslation } from '../../i18n/LanguageProvider';
import { useHouseholdStore } from '../../store/useHouseholdStore';
import {
  TaskCategory,
  TaskPriority,
  RecurrencePattern,
  PRESET_TASK_GROUPS,
  TaskSubtask,
} from '../../types/household';

interface AddTaskModalProps {
  visible: boolean;
  onClose: () => void;
}

export function AddTaskModal({ visible, onClose }: AddTaskModalProps) {
  const { skin } = useSkin();
  const { t } = useTranslation();
  const members = useHouseholdStore((s) => s.members);
  const activeCategory = useHouseholdStore((s) => s.activeCategory);
  const addTask = useHouseholdStore((s) => s.addTask);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TaskCategory>(activeCategory);
  const [priority, setPriority] = useState<TaskPriority>('Medium');
  const [assignedMemberId, setAssignedMemberId] = useState<string | undefined>(undefined);
  const [recurrence, setRecurrence] = useState<RecurrencePattern>('none');
  const [selectedGroup, setSelectedGroup] = useState<string>('Kitchen');
  const [customGroup, setCustomGroup] = useState('');
  const [subtasks, setSubtasks] = useState<TaskSubtask[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    const item: TaskSubtask = {
      id: `sub-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      title: newSubtaskTitle.trim(),
      isCompleted: false,
    };
    setSubtasks([...subtasks, item]);
    setNewSubtaskTitle('');
  };

  const handleRemoveSubtask = (id: string) => {
    setSubtasks(subtasks.filter((s) => s.id !== id));
  };

  // Compute XP reward dynamically based on difficulty and scope
  const calculateXp = (): number => {
    let base = 15;
    if (category === 'weekly') base = 35;
    if (category === 'recurring') base = 20;

    if (priority === 'High') base += 15;
    else if (priority === 'Low') base -= 5;

    return Math.max(10, base);
  };

  const calculatedXp = calculateXp();

  const handleSave = async () => {
    if (!title.trim()) return;

    const finalGroup = customGroup.trim() ? customGroup.trim() : selectedGroup;
    await addTask({
      title: title.trim(),
      description: description.trim() ? description.trim() : undefined,
      category,
      priority,
      assignedMemberId,
      recurrence: category === 'recurring' ? (recurrence === 'none' ? 'daily' : recurrence) : undefined,
      group: finalGroup,
      subtasks: subtasks.length > 0 ? subtasks : undefined,
      xpReward: calculatedXp,
      dueDate: new Date().toISOString().split('T')[0],
    });

    // Reset and close
    setTitle('');
    setDescription('');
    setAssignedMemberId(undefined);
    setSubtasks([]);
    setNewSubtaskTitle('');
    setCustomGroup('');
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
                New Task
              </Text>
              <Text style={[styles.subtitle, { color: skin.colors.textSecondary }]}>
                Add a chore or goal for your family
              </Text>
            </View>
            <Pressable onPress={onClose} hitSlop={10} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={skin.colors.textMuted} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.formScroll}>
            {/* Title Input */}
            <Text style={[styles.inputLabel, { color: skin.colors.textSecondary }]}>
              Task Title *
            </Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="e.g. Wash and fold clean laundry"
              placeholderTextColor={skin.colors.textMuted}
              style={[
                styles.textInput,
                {
                  backgroundColor: skin.colors.surfaceElevated,
                  borderColor: skin.colors.surfaceBorder,
                  color: skin.colors.textPrimary,
                },
              ]}
            />

            {/* Description Input */}
            <Text style={[styles.inputLabel, { color: skin.colors.textSecondary }]}>
              Details / Notes (Optional)
            </Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Any helpful instructions..."
              placeholderTextColor={skin.colors.textMuted}
              multiline
              numberOfLines={2}
              style={[
                styles.textInput,
                styles.textArea,
                {
                  backgroundColor: skin.colors.surfaceElevated,
                  borderColor: skin.colors.surfaceBorder,
                  color: skin.colors.textPrimary,
                },
              ]}
            />

            {/* Category Selector */}
            <Text style={[styles.inputLabel, { color: skin.colors.textSecondary }]}>
              {t.addTaskModal.categoryLabel}
            </Text>
            <View style={styles.chipsRow}>
              {(['daily', 'weekly', 'recurring'] as TaskCategory[]).map((cat) => {
                const isSelected = category === cat;
                const labels: Record<TaskCategory, string> = {
                  daily: `☀️ ${t.tasks.dailyTasks}`,
                  weekly: `🎯 ${t.tasks.weeklyGoals}`,
                  recurring: `🔄 ${t.tasks.recurringChores}`,
                };
                return (
                  <Pressable
                    key={cat}
                    onPress={() => setCategory(cat)}
                    style={[
                      styles.choiceChip,
                      {
                        backgroundColor: isSelected ? skin.colors.accent : skin.colors.surfaceElevated,
                        borderColor: isSelected ? skin.colors.accent : skin.colors.surfaceBorder,
                      },
                    ]}>
                    <Text
                      style={[
                        styles.choiceChipText,
                        { color: isSelected ? '#FFFFFF' : skin.colors.textPrimary },
                      ]}>
                      {labels[cat]}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Room / Group Selector */}
            <Text style={[styles.inputLabel, { color: skin.colors.textSecondary }]}>
              {t.addTaskModal.roomGroupLabel}
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.assigneeRow}>
              {PRESET_TASK_GROUPS.map((grp) => {
                const isSelected = selectedGroup === grp.name;
                return (
                  <Pressable
                    key={grp.id}
                    onPress={() => setSelectedGroup(grp.name)}
                    style={[
                      styles.choiceChip,
                      {
                        backgroundColor: isSelected ? skin.colors.accent : skin.colors.surfaceElevated,
                        borderColor: isSelected ? skin.colors.accent : skin.colors.surfaceBorder,
                      },
                    ]}>
                    <Text
                      style={[
                        styles.choiceChipText,
                        { color: isSelected ? '#FFFFFF' : skin.colors.textPrimary },
                      ]}>
                      {grp.emoji} {grp.name}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            {/* Checklist / Subtasks (e.g. swipe, cook) */}
            <Text style={[styles.inputLabel, { color: skin.colors.textSecondary }]}>
              {t.addTaskModal.checklistLabel}
            </Text>

            {subtasks.length > 0 && (
              <View style={styles.subtaskAddedList}>
                {subtasks.map((st) => (
                  <View
                    key={st.id}
                    style={[
                      styles.subtaskAddedRow,
                      {
                        backgroundColor: skin.colors.surfaceElevated,
                        borderColor: skin.colors.surfaceBorder,
                      },
                    ]}>
                    <Ionicons name="checkbox-outline" size={16} color={skin.colors.accent} />
                    <Text style={[styles.subtaskAddedText, { color: skin.colors.textPrimary }]}>
                      {st.title}
                    </Text>
                    <Pressable onPress={() => handleRemoveSubtask(st.id)} hitSlop={8}>
                      <Ionicons name="close-circle" size={16} color={skin.colors.textMuted} />
                    </Pressable>
                  </View>
                ))}
              </View>
            )}

            <View style={styles.addSubtaskRow}>
              <TextInput
                value={newSubtaskTitle}
                onChangeText={setNewSubtaskTitle}
                onSubmitEditing={handleAddSubtask}
                placeholder={t.addTaskModal.enterSubtaskPlaceholder}
                placeholderTextColor={skin.colors.textMuted}
                style={[
                  styles.subtaskInput,
                  {
                    backgroundColor: skin.colors.surfaceElevated,
                    borderColor: skin.colors.surfaceBorder,
                    color: skin.colors.textPrimary,
                  },
                ]}
              />
              <Pressable
                onPress={handleAddSubtask}
                disabled={!newSubtaskTitle.trim()}
                style={[
                  styles.addSubtaskBtn,
                  {
                    backgroundColor: newSubtaskTitle.trim() ? skin.colors.accent : skin.colors.surfaceBorder,
                  },
                ]}>
                <Ionicons name="add" size={20} color="#FFFFFF" />
              </Pressable>
            </View>

            {/* Priority Selector */}
            <Text style={[styles.inputLabel, { color: skin.colors.textSecondary }]}>
              Priority & Difficulty
            </Text>
            <View style={styles.chipsRow}>
              {(['Low', 'Medium', 'High'] as TaskPriority[]).map((p) => {
                const isSelected = priority === p;
                return (
                  <Pressable
                    key={p}
                    onPress={() => setPriority(p)}
                    style={[
                      styles.choiceChip,
                      {
                        backgroundColor: isSelected ? skin.colors.accent : skin.colors.surfaceElevated,
                        borderColor: isSelected ? skin.colors.accent : skin.colors.surfaceBorder,
                      },
                    ]}>
                    <Text
                      style={[
                        styles.choiceChipText,
                        { color: isSelected ? '#FFFFFF' : skin.colors.textPrimary },
                      ]}>
                      {p}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Assignee Selector */}
            <Text style={[styles.inputLabel, { color: skin.colors.textSecondary }]}>
              Assign To
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.assigneeRow}>
              <Pressable
                onPress={() => setAssignedMemberId(undefined)}
                style={[
                  styles.assigneeChip,
                  {
                    backgroundColor: assignedMemberId === undefined ? skin.colors.accent : skin.colors.surfaceElevated,
                    borderColor: assignedMemberId === undefined ? skin.colors.accent : skin.colors.surfaceBorder,
                  },
                ]}>
                <Text style={styles.assigneeEmoji}>👥</Text>
                <Text
                  style={[
                    styles.assigneeChipText,
                    { color: assignedMemberId === undefined ? '#FFFFFF' : skin.colors.textPrimary },
                  ]}>
                  Family Shared
                </Text>
              </Pressable>

              {members.map((member) => {
                const isSelected = assignedMemberId === member.id;
                return (
                  <Pressable
                    key={member.id}
                    onPress={() => setAssignedMemberId(member.id)}
                    style={[
                      styles.assigneeChip,
                      {
                        backgroundColor: isSelected ? skin.colors.accent : skin.colors.surfaceElevated,
                        borderColor: isSelected ? skin.colors.accent : skin.colors.surfaceBorder,
                      },
                    ]}>
                    <Text style={styles.assigneeEmoji}>{member.avatar}</Text>
                    <Text
                      style={[
                        styles.assigneeChipText,
                        { color: isSelected ? '#FFFFFF' : skin.colors.textPrimary },
                      ]}>
                      {member.name.split(' ')[0]}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            {/* Recurrence (if category is recurring) */}
            {category === 'recurring' && (
              <>
                <Text style={[styles.inputLabel, { color: skin.colors.textSecondary }]}>
                  Recurrence Frequency
                </Text>
                <View style={styles.chipsRow}>
                  {(['daily', 'weekdays', 'weekly'] as RecurrencePattern[]).map((r) => {
                    const isSelected = recurrence === r || (recurrence === 'none' && r === 'daily');
                    return (
                      <Pressable
                        key={r}
                        onPress={() => setRecurrence(r)}
                        style={[
                          styles.choiceChip,
                          {
                            backgroundColor: isSelected ? skin.colors.accent : skin.colors.surfaceElevated,
                            borderColor: isSelected ? skin.colors.accent : skin.colors.surfaceBorder,
                          },
                        ]}>
                        <Text
                          style={[
                            styles.choiceChipText,
                            { color: isSelected ? '#FFFFFF' : skin.colors.textPrimary },
                          ]}>
                          {r}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </>
            )}

            {/* XP Reward Preview Banner */}
            <View
              style={[
                styles.xpPreviewBox,
                { backgroundColor: skin.colors.accentLight, borderColor: skin.colors.accent },
              ]}>
              <View style={styles.xpPreviewLeft}>
                <Text style={styles.xpBigIcon}>⭐</Text>
                <View>
                  <Text style={[styles.xpPreviewTitle, { color: skin.colors.accentDark }]}>
                    Household Reward
                  </Text>
                  <Text style={[styles.xpPreviewSub, { color: skin.colors.textSecondary }]}>
                    Earned upon task completion
                  </Text>
                </View>
              </View>
              <Text style={[styles.xpPreviewAmount, { color: skin.colors.accentDark }]}>
                +{calculatedXp} XP
              </Text>
            </View>

            {/* Create Button */}
            <Pressable
              disabled={!title.trim()}
              onPress={handleSave}
              style={({ pressed }) => [
                styles.saveButton,
                {
                  backgroundColor: title.trim() ? skin.colors.accent : skin.colors.surfaceBorder,
                  opacity: pressed ? 0.8 : 1,
                },
              ]}>
              <Ionicons name="checkmark-circle-outline" size={18} color="#FFFFFF" />
              <Text style={styles.saveButtonText}>Save Task</Text>
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
    maxHeight: '90%',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
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
  closeBtn: {
    padding: 4,
  },
  formScroll: {
    paddingBottom: 24,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 6,
    marginTop: 12,
  },
  textInput: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
  },
  textArea: {
    minHeight: 64,
    textAlignVertical: 'top',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  choiceChip: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
  },
  choiceChipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  assigneeRow: {
    gap: 8,
    paddingVertical: 2,
  },
  assigneeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  assigneeEmoji: {
    fontSize: 14,
  },
  assigneeChipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  xpPreviewBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 18,
    marginBottom: 18,
  },
  xpPreviewLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  xpBigIcon: {
    fontSize: 22,
  },
  xpPreviewTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  xpPreviewSub: {
    fontSize: 11,
  },
  xpPreviewAmount: {
    fontSize: 20,
    fontWeight: '900',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  subtaskAddedList: {
    gap: 6,
    marginBottom: 8,
  },
  subtaskAddedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    gap: 8,
  },
  subtaskAddedText: {
    fontSize: 13,
    flex: 1,
  },
  addSubtaskRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  subtaskInput: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
  },
  addSubtaskBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
