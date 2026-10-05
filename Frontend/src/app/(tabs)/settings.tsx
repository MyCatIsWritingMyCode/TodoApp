import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSkin } from '../../theme/SkinProvider';
import { useTranslation } from '../../i18n/LanguageProvider';
import { useHouseholdStore } from '../../store/useHouseholdStore';
import { SkinPicker } from '../../components/settings/SkinPicker';
import { LanguagePicker } from '../../components/settings/LanguagePicker';
import { MembersManager } from '../../components/settings/MembersManager';
import { SubscriptionSection } from '../../components/settings/SubscriptionSection';
import { AddMemberModal } from '../../components/quests/AddMemberModal';
import { UpgradeModal } from '../../components/common/UpgradeModal';

export default function SettingsScreen() {
  const router = useRouter();
  const { skin } = useSkin();
  const { t } = useTranslation();
  const notificationsEnabled = useHouseholdStore((s) => s.notificationsEnabled);
  const toggleNotifications = useHouseholdStore((s) => s.toggleNotifications);
  const isBackendConnected = useHouseholdStore((s) => s.isBackendConnected);
  const refreshFromBackend = useHouseholdStore((s) => s.refreshFromBackend);
  const authUser = useHouseholdStore((s) => s.authUser);
  const logout = useHouseholdStore((s) => s.logout);

  const [addMemberVisible, setAddMemberVisible] = useState(false);
  const [upgradeVisible, setUpgradeVisible] = useState(false);
  const [paywallReason, setPaywallReason] = useState<string | undefined>(undefined);

  const handlePaywallTrigger = (reason?: string) => {
    setPaywallReason(reason);
    setUpgradeVisible(true);
  };

  const handleSignOut = async () => {
    await logout();
    router.replace('/auth');
  };

  return (
    <View style={[styles.container, { backgroundColor: skin.colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Account & Authentication Card */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: skin.colors.textPrimary }]}>
            Family Account
          </Text>
          <View
            style={[
              styles.settingCard,
              {
                backgroundColor: skin.colors.surface,
                borderColor: skin.colors.surfaceBorder,
              },
            ]}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <View
                  style={[
                    styles.settingIconCircle,
                    { backgroundColor: skin.colors.accentLight },
                  ]}>
                  <Ionicons
                    name="person"
                    size={20}
                    color={skin.colors.accentDark}
                  />
                </View>
                <View style={styles.settingTextCol}>
                  <Text style={[styles.settingTitle, { color: skin.colors.textPrimary }]}>
                    {authUser?.username ?? 'Family Member'}
                  </Text>
                  <Text style={[styles.settingSub, { color: skin.colors.textSecondary }]}>
                    {authUser ? authUser.email : ''}
                  </Text>
                </View>
              </View>

              <Pressable
                onPress={handleSignOut}
                style={({ pressed }) => [
                  styles.checkBtn,
                  {
                    backgroundColor: skin.colors.surfaceElevated,
                    borderColor: skin.colors.surfaceBorder,
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}>
                <Ionicons
                  name="log-out-outline"
                  size={14}
                  color={skin.colors.danger}
                />
                <Text
                  style={[
                    styles.checkBtnText,
                    { color: skin.colors.danger },
                  ]}>
                  Sign Out
                </Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* Visual Skin Engine Swatches */}
        <SkinPicker onPaywallTrigger={(reason) => handlePaywallTrigger(reason)} />

        {/* Subscription & Lifetime Plan */}
        <SubscriptionSection onUpgradePress={() => handlePaywallTrigger()} />

        {/* Household Member Profiles */}
        <MembersManager
          onAddMemberPress={() => setAddMemberVisible(true)}
          onPaywallTrigger={(reason) => handlePaywallTrigger(reason)}
        />

        {/* Language Picker */}
        <LanguagePicker />

        {/* Notification Preferences */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: skin.colors.textPrimary }]}>
            {t.settings.reminders}
          </Text>
          <View
            style={[
              styles.settingCard,
              {
                backgroundColor: skin.colors.surface,
                borderColor: skin.colors.surfaceBorder,
              },
            ]}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <View style={[styles.settingIconCircle, { backgroundColor: skin.colors.accentLight }]}>
                  <Ionicons name="notifications-outline" size={18} color={skin.colors.accentDark} />
                </View>
                <View style={styles.settingTextCol}>
                  <Text style={[styles.settingTitle, { color: skin.colors.textPrimary }]}>
                    {t.settings.reminders}
                  </Text>
                  <Text style={[styles.settingSub, { color: skin.colors.textSecondary }]}>
                    {t.settings.remindersSub}
                  </Text>
                </View>
              </View>

              <Switch
                value={notificationsEnabled}
                onValueChange={toggleNotifications}
                trackColor={{ false: skin.colors.surfaceElevated, true: skin.colors.accent }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
        </View>

        {/* Cloud Synchronization */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: skin.colors.textPrimary }]}>
            {t.settings.systemSync}
          </Text>
          <View
            style={[
              styles.settingCard,
              {
                backgroundColor: skin.colors.surface,
                borderColor: skin.colors.surfaceBorder,
              },
            ]}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <View
                  style={[
                    styles.settingIconCircle,
                    {
                      backgroundColor: isBackendConnected
                        ? skin.colors.success + '20'
                        : skin.colors.warning + '20',
                    },
                  ]}>
                  <Ionicons
                    name={isBackendConnected ? 'cloud-done-outline' : 'cloud-offline-outline'}
                    size={18}
                    color={isBackendConnected ? skin.colors.success : skin.colors.warning}
                  />
                </View>
                <View style={styles.settingTextCol}>
                  <Text style={[styles.settingTitle, { color: skin.colors.textPrimary }]}>
                    {isBackendConnected ? t.settings.connected : t.settings.offlineLocal}
                  </Text>
                  <Text style={[styles.settingSub, { color: skin.colors.textSecondary }]}>
                    {isBackendConnected
                      ? 'All household chores and points are in sync'
                      : 'Changes saved on device and will sync when online'}
                  </Text>
                </View>
              </View>

              <Pressable
                onPress={() => refreshFromBackend()}
                style={({ pressed }) => [
                  styles.checkBtn,
                  {
                    backgroundColor: skin.colors.surfaceElevated,
                    borderColor: skin.colors.surfaceBorder,
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}>
                <Ionicons name="sync-outline" size={14} color={skin.colors.textPrimary} />
                <Text style={[styles.checkBtnText, { color: skin.colors.textPrimary }]}>
                  Sync
                </Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* About & Version */}
        <View style={styles.aboutCard}>
          <Text style={styles.aboutEmoji}>🛡️</Text>
          <Text style={[styles.aboutTitle, { color: skin.colors.textPrimary }]}>
            ChoreQuest v1.0.0
          </Text>
          <Text style={[styles.aboutSub, { color: skin.colors.textMuted }]}>
            Cross-Platform Gamified Family To-Do App
          </Text>
          <Text style={[styles.aboutSub, { color: skin.colors.textMuted }]}>
            Crafted with React Native, Expo Router & TypeScript
          </Text>
        </View>
      </ScrollView>

      {/* Modals */}
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
  scroll: {
    paddingBottom: 40,
    paddingTop: 10,
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2,
    marginBottom: 10,
  },
  settingCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    marginRight: 10,
  },
  settingIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingTextCol: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  settingSub: {
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
  },
  checkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    gap: 4,
  },
  checkBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  aboutCard: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 16,
    paddingHorizontal: 20,
  },
  aboutEmoji: {
    fontSize: 28,
    marginBottom: 4,
  },
  aboutTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  aboutSub: {
    fontSize: 11,
    marginTop: 2,
  },
});
