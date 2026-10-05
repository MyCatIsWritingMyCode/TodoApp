import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSkin } from '../../theme/SkinProvider';
import { useTranslation } from '../../i18n/LanguageProvider';
import { Platform } from 'react-native';

export default function TabLayout() {
  const { skin } = useSkin();
  const { t } = useTranslation();

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: skin.colors.surface,
          shadowColor: 'transparent',
          elevation: 0,
        },
        headerTitleStyle: {
          fontWeight: '800',
          fontSize: 18,
          color: skin.colors.textPrimary,
        },
        tabBarStyle: {
          backgroundColor: skin.colors.tabBarBackground,
          borderTopColor: skin.colors.tabBarBorder,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 88 : 64,
          paddingBottom: Platform.OS === 'ios' ? 28 : 10,
          paddingTop: 8,
        },
        tabBarActiveTintColor: skin.colors.tabBarActive,
        tabBarInactiveTintColor: skin.colors.tabBarInactive,
        tabBarLabelStyle: {
          fontWeight: '700',
          fontSize: 11,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: t.tabs.tasks,
          tabBarLabel: t.tabs.tasks,
          headerTitle: t.tabs.tasksHeader,
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'checkbox' : 'checkbox-outline'}
              size={22}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="calendar"
        options={{
          title: t.tabs.calendar,
          tabBarLabel: t.tabs.calendar,
          headerTitle: t.tabs.calendarHeader,
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'calendar' : 'calendar-outline'}
              size={22}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="skills"
        options={{
          title: t.tabs.rewards,
          tabBarLabel: t.tabs.rewards,
          headerTitle: t.tabs.rewardsHeader,
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'gift' : 'gift-outline'}
              size={22}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: t.tabs.settings,
          tabBarLabel: t.tabs.settings,
          headerTitle: t.tabs.settingsHeader,
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'settings' : 'settings-outline'}
              size={22}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
