import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useSkin } from '../../theme/SkinProvider';
import { useTranslation } from '../../i18n/LanguageProvider';
import { useHouseholdStore } from '../../store/useHouseholdStore';
import { TaskCategory } from '../../types/household';

export function CategoryTabs() {
  const { skin } = useSkin();
  const { t } = useTranslation();
  const activeCategory = useHouseholdStore((s) => s.activeCategory);
  const setActiveCategory = useHouseholdStore((s) => s.setActiveCategory);
  const tasks = useHouseholdStore((s) => s.tasks);
  const activeFilterId = useHouseholdStore((s) => s.activeMemberFilterId);

  // Filter tasks based on member selection
  const relevantTasks = tasks.filter((tItem) => {
    if (activeFilterId === 'all') return true;
    return tItem.assignedMemberId === activeFilterId;
  });

  const counts: Record<TaskCategory, { total: number; pending: number }> = {
    daily: {
      total: relevantTasks.filter((task) => task.category === 'daily').length,
      pending: relevantTasks.filter((task) => task.category === 'daily' && !task.isCompleted).length,
    },
    weekly: {
      total: relevantTasks.filter((task) => task.category === 'weekly').length,
      pending: relevantTasks.filter((task) => task.category === 'weekly' && !task.isCompleted).length,
    },
    recurring: {
      total: relevantTasks.filter((task) => task.category === 'recurring').length,
      pending: relevantTasks.filter((task) => task.category === 'recurring' && !task.isCompleted).length,
    },
  };

  const tabs: { key: TaskCategory; label: string; icon: string }[] = [
    { key: 'daily', label: t.tasks.dailyTasks, icon: '☀️' },
    { key: 'weekly', label: t.tasks.weeklyGoals, icon: '🎯' },
    { key: 'recurring', label: t.tasks.recurringChores, icon: '🔄' },
  ];

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: skin.colors.surface,
          borderColor: skin.colors.surfaceBorder,
        },
      ]}>
      {tabs.map((tab) => {
        const isActive = activeCategory === tab.key;
        const count = counts[tab.key];

        return (
          <Pressable
            key={tab.key}
            onPress={() => setActiveCategory(tab.key)}
            style={({ pressed }) => [
              styles.tabButton,
              {
                backgroundColor: isActive ? skin.colors.accent : 'transparent',
                opacity: pressed ? 0.8 : 1,
              },
            ]}>
            <Text style={styles.tabIcon}>{tab.icon}</Text>
            <Text
              style={[
                styles.tabLabel,
                { color: isActive ? '#FFFFFF' : skin.colors.textPrimary },
              ]}>
              {tab.label}
            </Text>

            {count.pending > 0 && (
              <View
                style={[
                  styles.countBadge,
                  {
                    backgroundColor: isActive ? '#FFFFFF33' : skin.colors.accentLight,
                  },
                ]}>
                <Text
                  style={[
                    styles.countText,
                    { color: isActive ? '#FFFFFF' : skin.colors.accentDark },
                  ]}>
                  {count.pending}
                </Text>
              </View>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginHorizontal: 16,
    padding: 4,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 12,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 10,
    gap: 6,
  },
  tabIcon: {
    fontSize: 14,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  countBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 10,
  },
  countText: {
    fontSize: 10,
    fontWeight: '800',
  },
});
