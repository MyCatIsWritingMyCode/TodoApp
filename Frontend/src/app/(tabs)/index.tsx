import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSkin } from '../../theme/SkinProvider';
import { useTranslation } from '../../i18n/LanguageProvider';
import { useHouseholdStore } from '../../store/useHouseholdStore';
import { HouseholdHeader } from '../../components/quests/HouseholdHeader';
import { FamilyFilterBar } from '../../components/quests/FamilyFilterBar';
import { CategoryTabs } from '../../components/quests/CategoryTabs';
import { TaskItem } from '../../components/quests/TaskItem';
import { AddTaskModal } from '../../components/quests/AddTaskModal';
import { AddMemberModal } from '../../components/quests/AddMemberModal';
import { UpgradeModal } from '../../components/common/UpgradeModal';
import { ChoreQuestTask } from '../../types/household';

export default function QuestsDashboardScreen() {
  const router = useRouter();
  const { skin } = useSkin();
  const { t } = useTranslation();
  const tasks = useHouseholdStore((s) => s.tasks);
  const activeCategory = useHouseholdStore((s) => s.activeCategory);
  const activeFilterId = useHouseholdStore((s) => s.activeMemberFilterId);
  const filterStatus = useHouseholdStore((s) => s.filterStatus);
  const setFilterStatus = useHouseholdStore((s) => s.setFilterStatus);
  const selectedGroupFilter = useHouseholdStore((s) => s.selectedGroupFilter);
  const setSelectedGroupFilter = useHouseholdStore((s) => s.setSelectedGroupFilter);
  const groupByRoom = useHouseholdStore((s) => s.groupByRoom);
  const setGroupByRoom = useHouseholdStore((s) => s.setGroupByRoom);
  const searchQuery = useHouseholdStore((s) => s.searchQuery);
  const setSearchQuery = useHouseholdStore((s) => s.setSearchQuery);
  const refreshFromBackend = useHouseholdStore((s) => s.refreshFromBackend);

  const [refreshing, setRefreshing] = useState(false);
  const [addTaskVisible, setAddTaskVisible] = useState(false);
  const [addMemberVisible, setAddMemberVisible] = useState(false);
  const [upgradeVisible, setUpgradeVisible] = useState(false);
  const [paywallReason, setPaywallReason] = useState<string | undefined>(undefined);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshFromBackend();
    setRefreshing(false);
  };

  const handlePaywallTrigger = (reason?: string) => {
    setPaywallReason(
      reason ?? 'The Free Plan includes up to 2 family members. Upgrade to Basic or Premium to add more family members!'
    );
    setUpgradeVisible(true);
  };

  // Distinct available groups from current category tasks
  const availableGroups = Array.from(
    new Set(
      tasks
        .filter((task) => task.category === activeCategory && task.group)
        .map((task) => task.group!)
    )
  );

  // Filter tasks based on category, assignee, group, status, and search query
  const filteredTasks = tasks.filter((t) => {
    if (t.category !== activeCategory) return false;

    if (activeFilterId !== 'all' && t.assignedMemberId !== activeFilterId) {
      return false;
    }

    if (selectedGroupFilter !== 'all' && t.group !== selectedGroupFilter) {
      return false;
    }

    if (filterStatus === 'pending' && t.isCompleted) return false;
    if (filterStatus === 'completed' && !t.isCompleted) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchDesc = t.description?.toLowerCase().includes(q);
      const matchGroup = t.group?.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchGroup) return false;
    }

    return true;
  });

  // Group tasks by room / area
  const groupedTasks = filteredTasks.reduce<Record<string, ChoreQuestTask[]>>((acc, task) => {
    const grp = task.group || t.groups.general;
    if (!acc[grp]) acc[grp] = [];
    acc[grp].push(task);
    return acc;
  }, {});

  const groupKeys = Object.keys(groupedTasks);

  return (
    <View style={[styles.container, { backgroundColor: skin.colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={skin.colors.accent}
          />
        }>
        {/* Household Level & XP Progress Header */}
        <HouseholdHeader
          onPressPerks={() => router.push('/(tabs)/skills')}
          onPressUpgrade={() => handlePaywallTrigger('Level 10 cap reached! Upgrade to unlock Level 25+')}
          onPressAuth={() => router.push('/(tabs)/settings')}
        />

        {/* Family Member Horizontal Filter Bar */}
        <FamilyFilterBar
          onAddMemberPress={() => setAddMemberVisible(true)}
          onPaywallTrigger={() => handlePaywallTrigger()}
        />

        {/* Category Tabs: Daily Tasks, Weekly Goals, Recurring Chores */}
        <CategoryTabs />

        {/* Search & Status Filters */}
        <View style={styles.filterSection}>
          <View style={styles.searchAndStatusRow}>
            <View
              style={[
                styles.searchBar,
                {
                  backgroundColor: skin.colors.surface,
                  borderColor: skin.colors.surfaceBorder,
                },
              ]}>
              <Ionicons name="search" size={16} color={skin.colors.textMuted} />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder={t.common.search}
                placeholderTextColor={skin.colors.textMuted}
                style={[styles.searchInput, { color: skin.colors.textPrimary }]}
              />
              {searchQuery ? (
                <Pressable onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={16} color={skin.colors.textMuted} />
                </Pressable>
              ) : null}
            </View>

            {/* Status Filter Chips: All, Pending, Completed */}
            <View style={styles.statusChipsRow}>
            {(['all', 'pending', 'completed'] as const).map((st) => {
              const isSelected = filterStatus === st;
              const labels = {
                all: t.common.all,
                pending: t.common.pending,
                completed: t.common.done,
              };
              return (
                <Pressable
                  key={st}
                  onPress={() => setFilterStatus(st)}
                  style={[
                    styles.statusChip,
                    {
                      backgroundColor: isSelected ? skin.colors.accent : skin.colors.surface,
                      borderColor: isSelected ? skin.colors.accent : skin.colors.surfaceBorder,
                    },
                  ]}>
                  <Text
                    style={[
                      styles.statusChipText,
                      { color: isSelected ? '#FFFFFF' : skin.colors.textSecondary },
                    ]}>
                    {labels[st]}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Room / Group Filter Bar & Group Toggle */}
          {availableGroups.length > 0 && (
            <View style={styles.groupFilterBar}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.groupFilterScroll}>
                <Pressable
                  onPress={() => setSelectedGroupFilter('all')}
                  style={[
                    styles.groupPill,
                    {
                      backgroundColor: selectedGroupFilter === 'all' ? skin.colors.accent : skin.colors.surface,
                      borderColor: selectedGroupFilter === 'all' ? skin.colors.accent : skin.colors.surfaceBorder,
                    },
                  ]}>
                  <Text
                    style={[
                      styles.groupPillText,
                      { color: selectedGroupFilter === 'all' ? '#FFFFFF' : skin.colors.textSecondary },
                    ]}>
                    {t.tasks.allRooms}
                  </Text>
                </Pressable>

                {availableGroups.map((grp) => {
                  const isSelected = selectedGroupFilter === grp;
                  return (
                    <Pressable
                      key={grp}
                      onPress={() => setSelectedGroupFilter(grp)}
                      style={[
                        styles.groupPill,
                        {
                          backgroundColor: isSelected ? skin.colors.accent : skin.colors.surface,
                          borderColor: isSelected ? skin.colors.accent : skin.colors.surfaceBorder,
                        },
                      ]}>
                      <Text
                        style={[
                          styles.groupPillText,
                          { color: isSelected ? '#FFFFFF' : skin.colors.textSecondary },
                        ]}>
                        {grp}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>

              <Pressable
                onPress={() => setGroupByRoom(!groupByRoom)}
                hitSlop={8}
                style={[
                  styles.viewModeBtn,
                  {
                    backgroundColor: skin.colors.surface,
                    borderColor: skin.colors.surfaceBorder,
                  },
                ]}>
                <Ionicons
                  name={groupByRoom ? 'layers' : 'list'}
                  size={16}
                  color={skin.colors.accent}
                />
              </Pressable>
            </View>
          )}
        </View>

        {/* Task List */}
        {filteredTasks.length === 0 ? (
          <View
            style={[
              styles.emptyState,
              {
                backgroundColor: skin.colors.surface,
                borderColor: skin.colors.surfaceBorder,
              },
            ]}>
            <Text style={styles.emptyEmoji}>🎉</Text>
            <Text style={[styles.emptyTitle, { color: skin.colors.textPrimary }]}>
              {t.tasks.noTasksFound}
            </Text>
            <Text style={[styles.emptySub, { color: skin.colors.textSecondary }]}>
              {filterStatus === 'completed'
                ? t.tasks.emptyCompletedSub
                : t.tasks.allTasksCompleted}
            </Text>
            <Pressable
              onPress={() => setAddTaskVisible(true)}
              style={[styles.emptyAddBtn, { backgroundColor: skin.colors.accent }]}>
              <Ionicons name="add" size={16} color="#FFFFFF" />
              <Text style={styles.emptyAddBtnText}>{t.tasks.createFirstTask}</Text>
            </Pressable>
          </View>
        ) : groupByRoom ? (
          <View style={styles.tasksList}>
            {groupKeys.map((groupName) => {
              const groupTasks = groupedTasks[groupName];
              const doneCount = groupTasks.filter((gt) => gt.isCompleted).length;
              return (
                <View key={groupName} style={styles.groupContainer}>
                  <View style={styles.groupSectionHeader}>
                    <View style={styles.groupHeaderLeft}>
                      <Ionicons name="folder-open" size={15} color={skin.colors.accent} />
                      <Text style={[styles.groupHeaderText, { color: skin.colors.textPrimary }]}>
                        {groupName}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.groupBadge,
                        { backgroundColor: skin.colors.accentLight },
                      ]}>
                      <Text style={[styles.groupBadgeText, { color: skin.colors.accentDark }]}>
                        {doneCount}/{groupTasks.length} {t.common.done.toLowerCase()}
                      </Text>
                    </View>
                  </View>
                  {groupTasks.map((task) => (
                    <TaskItem key={task.id} task={task} />
                  ))}
                </View>
              );
            })}
          </View>
        ) : (
          <View style={styles.tasksList}>
            {filteredTasks.map((task) => (
              <TaskItem key={task.id} task={task} />
            ))}
          </View>
        )}
      </ScrollView>

      {/* Floating Action Button: Add Task */}
      <Pressable
        onPress={() => setAddTaskVisible(true)}
        style={({ pressed }) => [
          styles.fab,
          {
            backgroundColor: skin.colors.accent,
            shadowColor: skin.colors.accentGlow,
            opacity: pressed ? 0.85 : 1,
          },
        ]}>
        <Ionicons name="add" size={26} color="#FFFFFF" />
        <Text style={styles.fabText}>{t.tasks.newTask}</Text>
      </Pressable>

      {/* Modals */}
      <AddTaskModal
        visible={addTaskVisible}
        onClose={() => setAddTaskVisible(false)}
      />

      <AddMemberModal
        visible={addMemberVisible}
        onClose={() => setAddMemberVisible(false)}
        onPaywallTrigger={(reason) => handlePaywallTrigger(reason)}
      />

      <UpgradeModal
        visible={upgradeVisible}
        onClose={() => setUpgradeVisible(false)}
        reason={paywallReason}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 90,
  },
  filterSection: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  searchAndStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    padding: 0,
  },
  statusChipsRow: {
    flexDirection: 'row',
    gap: 4,
  },
  statusChip: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  statusChipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  groupFilterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    gap: 8,
  },
  groupFilterScroll: {
    gap: 6,
    paddingRight: 8,
  },
  groupPill: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  groupPillText: {
    fontSize: 12,
    fontWeight: '600',
  },
  viewModeBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  groupContainer: {
    marginBottom: 14,
  },
  groupSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    marginBottom: 8,
  },
  groupHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  groupHeaderText: {
    fontSize: 14,
    fontWeight: '800',
  },
  groupBadge: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  groupBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  tasksList: {
    marginTop: 2,
  },
  emptyState: {
    marginHorizontal: 16,
    padding: 30,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  emptyEmoji: {
    fontSize: 36,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  emptySub: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 16,
    lineHeight: 18,
  },
  emptyAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 6,
  },
  emptyAddBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 28,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
    gap: 6,
  },
  fabText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
