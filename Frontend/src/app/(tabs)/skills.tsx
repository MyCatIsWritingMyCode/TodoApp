import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useSkin } from '../../theme/SkinProvider';
import { SkillTreeSection } from '../../components/skills/SkillTreeSection';
import { UnlockablesShowcase } from '../../components/skills/UnlockablesShowcase';

export default function SkillsScreen() {
  const { skin } = useSkin();

  return (
    <View style={[styles.container, { backgroundColor: skin.colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Family Skill Tree */}
        <SkillTreeSection />

        {/* Level Milestones & Unlockables */}
        <UnlockablesShowcase />
      </ScrollView>
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
