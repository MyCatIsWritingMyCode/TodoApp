import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';
import { useHouseholdStore } from '../store/useHouseholdStore';
import { useSkin } from '../theme/SkinProvider';

export default function Index() {
  const { skin } = useSkin();
  const authUser = useHouseholdStore((s) => s.authUser);
  const authInitialized = useHouseholdStore((s) => s.authInitialized);

  if (!authInitialized) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: skin.colors.background,
        }}>
        <ActivityIndicator size="large" color={skin.colors.accent} />
      </View>
    );
  }

  return <Redirect href={authUser ? '/(tabs)' : '/auth'} />;
}
