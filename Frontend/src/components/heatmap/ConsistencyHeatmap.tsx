import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSkin } from '../../theme/SkinProvider';
import { useHouseholdStore } from '../../store/useHouseholdStore';
export function ConsistencyHeatmap() {
  const { skin } = useSkin();
  const heatmap = useHouseholdStore((s) => s.heatmap);

  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Compute monthly stats
  const totalDaysTracked = heatmap.length;
  const greenDays = heatmap.filter((d) => d.ratio === 1).length;
  const overallConsistency = totalDaysTracked > 0 ? Math.round((greenDays / totalDaysTracked) * 100) : 0;

  // Selected day record
  const selectedDay = selectedDate ? heatmap.find((d) => d.date === selectedDate) : null;

  // Color mapper
  const getCellColor = (ratio: number) => {
    if (ratio === 1) return skin.colors.success; // 🟢 100%
    if (ratio >= 0.5) return skin.colors.warning; // 🟡 50-99%
    if (ratio > 0) return skin.colors.danger; // 🔴 < 50%
    return skin.colors.surfaceElevated; // ⚪ Neutral/None
  };

  const dayHeaders = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: skin.colors.surface,
          borderColor: skin.colors.surfaceBorder,
          shadowColor: skin.colors.cardShadow,
        },
      ]}>
      {/* Title & Consistency KPI */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: skin.colors.textPrimary }]}>
            Consistency Heatmap
          </Text>
          <Text style={[styles.subtitle, { color: skin.colors.textSecondary }]}>
            Past 30 Days Household Completion Rate
          </Text>
        </View>

        <View style={[styles.consistencyBadge, { backgroundColor: skin.colors.accentLight }]}>
          <Text style={[styles.consistencyValue, { color: skin.colors.accentDark }]}>
            {overallConsistency}%
          </Text>
          <Text style={[styles.consistencyLabel, { color: skin.colors.accentDark }]}>
            Consistency
          </Text>
        </View>
      </View>

      {/* Legend */}
      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: skin.colors.success }]} />
          <Text style={[styles.legendText, { color: skin.colors.textSecondary }]}>100% Completed</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: skin.colors.warning }]} />
          <Text style={[styles.legendText, { color: skin.colors.textSecondary }]}>50–99%</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: skin.colors.danger }]} />
          <Text style={[styles.legendText, { color: skin.colors.textSecondary }]}>&lt;50%</Text>
        </View>
      </View>

      {/* Day of Week Headers */}
      <View style={styles.dayHeadersRow}>
        {dayHeaders.map((dh, idx) => (
          <Text key={idx} style={[styles.dayHeaderCell, { color: skin.colors.textMuted }]}>
            {dh}
          </Text>
        ))}
      </View>

      {/* Grid of Days */}
      <View style={styles.gridContainer}>
        {heatmap.map((day) => {
          const isSelected = selectedDate === day.date;
          const cellColor = getCellColor(day.ratio);
          const dayNum = parseInt(day.date.split('-')[2], 10);

          return (
            <Pressable
              key={day.date}
              onPress={() => setSelectedDate(day.date)}
              style={({ pressed }) => [
                styles.dayCell,
                {
                  backgroundColor: cellColor,
                  borderColor: isSelected ? skin.colors.textPrimary : 'transparent',
                  borderWidth: isSelected ? 2 : 1,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}>
              <Text
                style={[
                  styles.dayNumber,
                  {
                    color: day.ratio >= 0.5 ? '#FFFFFF' : skin.colors.textPrimary,
                    fontWeight: isSelected ? '800' : '600',
                  },
                ]}>
                {dayNum}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Selected Day Details Card */}
      {selectedDay && (
        <View
          style={[
            styles.selectedDayBox,
            {
              backgroundColor: skin.colors.surfaceElevated,
              borderColor: skin.colors.surfaceBorder,
            },
          ]}>
          <View style={styles.selectedDayHeader}>
            <View style={styles.selectedDayLeft}>
              <Ionicons name="calendar-outline" size={16} color={skin.colors.accent} />
              <Text style={[styles.selectedDayDate, { color: skin.colors.textPrimary }]}>
                {new Date(selectedDay.date).toLocaleDateString(undefined, {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                })}
              </Text>
            </View>
            <View
              style={[
                styles.ratioBadge,
                { backgroundColor: getCellColor(selectedDay.ratio) },
              ]}>
              <Text style={styles.ratioBadgeText}>
                {Math.round(selectedDay.ratio * 100)}% Complete
              </Text>
            </View>
          </View>

          <Text style={[styles.selectedDayDetail, { color: skin.colors.textSecondary }]}>
            {selectedDay.completedTasks} of {selectedDay.totalTasks} tasks completed on this day.
            {selectedDay.ratio === 1 ? ' 🌟 Perfect completion streak!' : ''}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  consistencyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    alignItems: 'center',
  },
  consistencyValue: {
    fontSize: 16,
    fontWeight: '900',
    lineHeight: 18,
  },
  consistencyLabel: {
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  legendRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 11,
    fontWeight: '500',
  },
  dayHeadersRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
    paddingHorizontal: 4,
  },
  dayHeaderCell: {
    width: 36,
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '700',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    gap: 8,
    paddingHorizontal: 2,
  },
  dayCell: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayNumber: {
    fontSize: 12,
  },
  selectedDayBox: {
    marginTop: 14,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  selectedDayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  selectedDayLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  selectedDayDate: {
    fontSize: 14,
    fontWeight: '700',
  },
  ratioBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  ratioBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  selectedDayDetail: {
    fontSize: 12,
    marginTop: 2,
  },
});
