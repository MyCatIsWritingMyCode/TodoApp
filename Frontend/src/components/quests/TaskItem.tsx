import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSkin } from '../../theme/SkinProvider';
import { useTranslation } from '../../i18n/LanguageProvider';
import { useHouseholdStore } from '../../store/useHouseholdStore';
import { ChoreQuestTask, TaskPriority } from '../../types/household';

interface TaskItemProps {
  task: ChoreQuestTask;
  onEdit?: (task: ChoreQuestTask) => void;
}

export function TaskItem({ task, onEdit }: TaskItemProps) {
  const { skin } = useSkin();
  const { t } = useTranslation();
  const toggleTask = useHouseholdStore((s) => s.toggleTask);
  const toggleSubtask = useHouseholdStore((s) => s.toggleSubtask);
  const deleteTask = useHouseholdStore((s) => s.deleteTask);
  const members = useHouseholdStore((s) => s.members);

  const assignedMember = task.assignedMemberId
    ? members.find((m) => m.id === task.assignedMemberId)
    : undefined;

  const priorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case 'High':
        return skin.colors.danger;
      case 'Medium':
        return skin.colors.warning;
      case 'Low':
      default:
        return skin.colors.info;
    }
  };

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: skin.colors.surface,
          borderColor: task.isCompleted ? skin.colors.surfaceBorder : skin.colors.surfaceBorder,
          opacity: task.isCompleted ? 0.75 : 1,
          shadowColor: skin.colors.cardShadow,
        },
      ]}>
      {/* Checkbox */}
      <Pressable
        onPress={() => toggleTask(task.id)}
        hitSlop={8}
        style={({ pressed }) => [
          styles.checkbox,
          {
            backgroundColor: task.isCompleted ? skin.colors.success : 'transparent',
            borderColor: task.isCompleted ? skin.colors.success : skin.colors.surfaceBorder,
            opacity: pressed ? 0.7 : 1,
          },
        ]}>
        {task.isCompleted && <Ionicons name="checkmark-sharp" size={16} color="#FFFFFF" />}
      </Pressable>

      {/* Main Task Body */}
      <Pressable
        onPress={() => onEdit?.(task)}
        style={styles.contentArea}>
        <View style={styles.titleRow}>
          <Text
            style={[
              styles.title,
              {
                color: task.isCompleted ? skin.colors.textMuted : skin.colors.textPrimary,
                textDecorationLine: task.isCompleted ? 'line-through' : 'none',
              },
            ]}>
            {task.title}
          </Text>
        </View>

        {task.description ? (
          <Text
            numberOfLines={2}
            style={[
              styles.description,
              {
                color: skin.colors.textSecondary,
                textDecorationLine: task.isCompleted ? 'line-through' : 'none',
              },
            ]}>
            {task.description}
          </Text>
        ) : null}

        {/* Subtasks Checklist if present */}
        {task.subtasks && task.subtasks.length > 0 && (
          <View
            style={[
              styles.subtasksContainer,
              {
                backgroundColor: skin.colors.surfaceElevated,
                borderColor: skin.colors.surfaceBorder,
              },
            ]}>
            <View style={styles.subtasksHeaderRow}>
              <Text style={[styles.subtasksHeaderText, { color: skin.colors.textSecondary }]}>
                {t.tasks.subtasks}
              </Text>
              <Text style={[styles.subtasksProgressText, { color: skin.colors.accentDark }]}>
                {task.subtasks.filter((s) => s.isCompleted).length}/{task.subtasks.length}
              </Text>
            </View>

            {task.subtasks.map((st) => (
              <Pressable
                key={st.id}
                onPress={() => toggleSubtask(task.id, st.id)}
                style={styles.subtaskRow}>
                <View
                  style={[
                    styles.subtaskCheckbox,
                    {
                      backgroundColor: st.isCompleted ? skin.colors.success : 'transparent',
                      borderColor: st.isCompleted ? skin.colors.success : skin.colors.surfaceBorder,
                    },
                  ]}>
                  {st.isCompleted && <Ionicons name="checkmark" size={10} color="#FFFFFF" />}
                </View>
                <Text
                  style={[
                    styles.subtaskText,
                    {
                      color: st.isCompleted ? skin.colors.textMuted : skin.colors.textPrimary,
                      textDecorationLine: st.isCompleted ? 'line-through' : 'none',
                    },
                  ]}>
                  {st.title}
                </Text>
              </Pressable>
            ))}
          </View>
        )}

        {/* Badges / Meta Info Row */}
        <View style={styles.metaRow}>
          {/* Room / Group Badge */}
          {task.group ? (
            <View
              style={[
                styles.badge,
                {
                  backgroundColor: skin.colors.accentLight,
                  borderColor: skin.colors.accent + '25',
                },
              ]}>
              <Ionicons name="folder-outline" size={11} color={skin.colors.accentDark} />
              <Text style={[styles.badgeText, { color: skin.colors.accentDark, fontWeight: '700' }]}>
                {task.group}
              </Text>
            </View>
          ) : null}

          {/* Priority Pill */}
          <View
            style={[
              styles.badge,
              {
                backgroundColor: priorityColor(task.priority) + '18',
                borderColor: priorityColor(task.priority) + '40',
              },
            ]}>
            <View
              style={[
                styles.priorityDot,
                { backgroundColor: priorityColor(task.priority) },
              ]}
            />
            <Text
              style={[
                styles.badgeText,
                { color: priorityColor(task.priority) },
              ]}>
              {task.priority === 'High'
                ? t.tasks.priority.high
                : task.priority === 'Medium'
                ? t.tasks.priority.medium
                : t.tasks.priority.low}
            </Text>
          </View>

          {/* XP Reward Pill */}
          <View
            style={[
              styles.badge,
              {
                backgroundColor: skin.colors.accentLight,
                borderColor: skin.colors.accent + '30',
              },
            ]}>
            <Text style={styles.xpStar}>⭐</Text>
            <Text
              style={[
                styles.badgeText,
                { color: skin.colors.accentDark, fontWeight: '800' },
              ]}>
              +{task.xpReward} XP
            </Text>
          </View>

          {/* Recurrence Pill if set */}
          {task.recurrence && task.recurrence !== 'none' && (
            <View
              style={[
                styles.badge,
                {
                  backgroundColor: skin.colors.surfaceElevated,
                  borderColor: skin.colors.surfaceBorder,
                },
              ]}>
              <Ionicons name="repeat" size={11} color={skin.colors.textSecondary} />
              <Text style={[styles.badgeText, { color: skin.colors.textSecondary }]}>
                {task.recurrence}
              </Text>
            </View>
          )}

          {/* Assignee Avatar */}
          {assignedMember ? (
            <View style={styles.assigneeContainer}>
              <View
                style={[
                  styles.assigneeAvatar,
                  { borderColor: assignedMember.color },
                ]}>
                <Text style={styles.assigneeEmoji}>{assignedMember.avatar}</Text>
              </View>
              <Text
                style={[
                  styles.assigneeName,
                  { color: skin.colors.textSecondary },
                ]}>
                {assignedMember.name.split(' ')[0]}
              </Text>
            </View>
          ) : (
            <View style={styles.assigneeContainer}>
              <Text style={[styles.assigneeName, { color: skin.colors.textMuted }]}>
                Family Shared
              </Text>
            </View>
          )}
        </View>
      </Pressable>

      {/* Delete / Actions */}
      <Pressable
        onPress={() => deleteTask(task.id)}
        hitSlop={8}
        style={({ pressed }) => [
          styles.deleteButton,
          { opacity: pressed ? 0.5 : 0.8 },
        ]}>
        <Ionicons name="trash-outline" size={16} color={skin.colors.textMuted} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 14,
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 16,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 7,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
    marginRight: 12,
  },
  contentArea: {
    flex: 1,
    paddingRight: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
    letterSpacing: -0.2,
  },
  description: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
    paddingHorizontal: 7,
    borderRadius: 8,
    borderWidth: 1,
    gap: 4,
  },
  priorityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  xpStar: {
    fontSize: 10,
  },
  assigneeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginLeft: 'auto',
  },
  assigneeAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  assigneeEmoji: {
    fontSize: 11,
  },
  assigneeName: {
    fontSize: 11,
    fontWeight: '600',
  },
  deleteButton: {
    padding: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subtasksContainer: {
    marginTop: 8,
    marginBottom: 8,
    padding: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  subtasksHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
    paddingHorizontal: 2,
  },
  subtasksHeaderText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  subtasksProgressText: {
    fontSize: 11,
    fontWeight: '800',
  },
  subtaskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    gap: 8,
  },
  subtaskCheckbox: {
    width: 16,
    height: 16,
    borderRadius: 4,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtaskText: {
    fontSize: 12,
    flex: 1,
  },
});
