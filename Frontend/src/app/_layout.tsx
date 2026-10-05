import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SkinProvider, useSkin } from '../theme/SkinProvider';
import { LanguageProvider } from '../i18n/LanguageProvider';
import { useHouseholdStore } from '../store/useHouseholdStore';

function AppContent() {
  const { skin } = useSkin();
  const segments = useSegments();
  const router = useRouter();

  const authUser = useHouseholdStore((s) => s.authUser);
  const authInitialized = useHouseholdStore((s) => s.authInitialized);
  const restoreAuthSession = useHouseholdStore((s) => s.restoreAuthSession);

  useEffect(() => {
    // Restore saved JWT user session on initial boot
    restoreAuthSession();
  }, [restoreAuthSession]);

  useEffect(() => {
    if (!authInitialized) return;

    const inAuthGroup = segments[0] === 'auth';

    if (!authUser && !inAuthGroup) {
      // Direct unauthenticated users to the auth screen
      router.replace('/auth');
    } else if (authUser && inAuthGroup) {
      // Direct authenticated users out of auth into the main app
      router.replace('/(tabs)');
    }
  }, [authUser, authInitialized, segments, router]);

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

  return (
    <>
      <StatusBar style={skin.isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: skin.colors.background },
        }}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="auth" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <LanguageProvider>
        <SkinProvider>
          <AppContent />
        </SkinProvider>
      </LanguageProvider>
    </SafeAreaProvider>
  );
}
