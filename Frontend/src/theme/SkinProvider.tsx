import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ALL_SKINS, DEFAULT_SKIN_ID, STARTER_SKINS } from './skins';
import { SkinTheme, SkinId } from './types';
import { SubscriptionTier, isSkinUnlockedForTier } from '../config/plans.config';

interface SkinContextValue {
  skin: SkinTheme;
  skinId: SkinId;
  allSkins: Record<string, SkinTheme>;
  setSkin: (id: SkinId) => void;
  setMemberSkin: (memberId: string, id: SkinId) => void;
  registerSkin: (newTheme: SkinTheme) => void;
  isSkinUnlocked: (skinId: string, tier: SubscriptionTier) => boolean;
  memberSkins: Record<string, SkinId>;
  loadMemberSkin: (memberId: string) => void;
}

const SkinContext = createContext<SkinContextValue | undefined>(undefined);

const SKIN_STORAGE_KEY = '@chorequest_active_skin';
const MEMBER_SKINS_STORAGE_KEY = '@chorequest_member_skins';

export function SkinProvider({ children }: { children: React.ReactNode }) {
  const [skinMap, setSkinMap] = useState<Record<string, SkinTheme>>(ALL_SKINS);
  const [currentSkinId, setCurrentSkinId] = useState<SkinId>(DEFAULT_SKIN_ID);
  const [memberSkins, setMemberSkins] = useState<Record<string, SkinId>>({});

  // Load saved preferences on mount
  useEffect(() => {
    async function loadPreferences() {
      try {
        const savedSkin = await AsyncStorage.getItem(SKIN_STORAGE_KEY);
        const savedMemberSkins = await AsyncStorage.getItem(MEMBER_SKINS_STORAGE_KEY);

        if (savedSkin && skinMap[savedSkin]) {
          setCurrentSkinId(savedSkin);
        }
        if (savedMemberSkins) {
          setMemberSkins(JSON.parse(savedMemberSkins));
        }
      } catch (err) {
        console.warn('Failed to load skin preferences from storage', err);
      }
    }
    loadPreferences();
  }, [skinMap]);

  // Change current active skin
  const setSkin = useCallback(
    async (id: SkinId) => {
      if (skinMap[id]) {
        setCurrentSkinId(id);
        try {
          await AsyncStorage.setItem(SKIN_STORAGE_KEY, id);
        } catch (err) {
          console.warn('Failed to save skin to storage', err);
        }
      }
    },
    [skinMap]
  );

  // Per-member skin assignment
  const setMemberSkin = useCallback(
    async (memberId: string, id: SkinId) => {
      if (!skinMap[id]) return;
      const updated = { ...memberSkins, [memberId]: id };
      setMemberSkins(updated);
      try {
        await AsyncStorage.setItem(MEMBER_SKINS_STORAGE_KEY, JSON.stringify(updated));
      } catch (err) {
        console.warn('Failed to save member skin to storage', err);
      }
      // If this is currently active member, apply skin immediately
      setCurrentSkinId(id);
    },
    [memberSkins, skinMap]
  );

  // Load a member's specific skin preference
  const loadMemberSkin = useCallback(
    (memberId: string) => {
      const preferred = memberSkins[memberId];
      if (preferred && skinMap[preferred]) {
        setCurrentSkinId(preferred);
      }
    },
    [memberSkins, skinMap]
  );

  // Extensibility: allow runtime registration of custom or downloaded skins
  const registerSkin = useCallback((newTheme: SkinTheme) => {
    setSkinMap((prev) => ({
      ...prev,
      [newTheme.id]: newTheme,
    }));
  }, []);

  const isSkinUnlocked = useCallback((skinId: string, tier: SubscriptionTier) => {
    return isSkinUnlockedForTier(skinId, tier);
  }, []);

  const activeTheme = useMemo(() => {
    return skinMap[currentSkinId] ?? STARTER_SKINS.vanilla;
  }, [skinMap, currentSkinId]);

  const value = useMemo<SkinContextValue>(
    () => ({
      skin: activeTheme,
      skinId: currentSkinId,
      allSkins: skinMap,
      setSkin,
      setMemberSkin,
      registerSkin,
      isSkinUnlocked,
      memberSkins,
      loadMemberSkin,
    }),
    [activeTheme, currentSkinId, skinMap, setSkin, setMemberSkin, registerSkin, isSkinUnlocked, memberSkins, loadMemberSkin]
  );

  return <SkinContext.Provider value={value}>{children}</SkinContext.Provider>;
}

export function useSkin(): SkinContextValue {
  const context = useContext(SkinContext);
  if (!context) {
    throw new Error('useSkin must be used within a SkinProvider');
  }
  return context;
}
