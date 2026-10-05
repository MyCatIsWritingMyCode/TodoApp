import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useSkin } from '../../theme/SkinProvider';
import { ConsistencyHeatmap } from '../../components/heatmap/ConsistencyHeatmap';
import { StickyNotesBoard } from '../../components/heatmap/StickyNotesBoard';
import { AddNoteModal } from '../../components/heatmap/AddNoteModal';

export default function CalendarScreen() {
  const { skin } = useSkin();
  const [addNoteVisible, setAddNoteVisible] = useState(false);

  return (
    <View style={[styles.container, { backgroundColor: skin.colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Consistency Heatmap */}
        <ConsistencyHeatmap />

        {/* Sticky Notes Pinboard */}
        <StickyNotesBoard onAddNotePress={() => setAddNoteVisible(true)} />
      </ScrollView>

      {/* Add Sticky Note Modal */}
      <AddNoteModal
        visible={addNoteVisible}
        onClose={() => setAddNoteVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    paddingBottom: 40,
  },
});
