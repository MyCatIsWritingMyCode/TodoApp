import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSkin } from '../../theme/SkinProvider';
import { useTranslation } from '../../i18n/LanguageProvider';
import { SUPPORTED_LANGUAGES, Language } from '../../i18n/types';

export function LanguagePicker() {
  const { skin } = useSkin();
  const { language, setLanguage, t } = useTranslation();

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: skin.colors.textPrimary }]}>
        {t.settings.language}
      </Text>
      <Text style={[styles.sectionSub, { color: skin.colors.textSecondary }]}>
        {t.settings.languageSub}
      </Text>

      <View
        style={[
          styles.card,
          {
            backgroundColor: skin.colors.surface,
            borderColor: skin.colors.surfaceBorder,
          },
        ]}>
        {SUPPORTED_LANGUAGES.map((lang, index) => {
          const isSelected = language === lang.code;
          const isLast = index === SUPPORTED_LANGUAGES.length - 1;

          return (
            <Pressable
              key={lang.code}
              onPress={() => setLanguage(lang.code as Language)}
              style={({ pressed }) => [
                styles.optionRow,
                !isLast && { borderBottomWidth: 1, borderBottomColor: skin.colors.surfaceBorder },
                isSelected && { backgroundColor: skin.colors.surfaceElevated },
                { opacity: pressed ? 0.7 : 1 },
              ]}>
              <View style={styles.optionLeft}>
                <Text style={styles.flagEmoji}>{lang.flag}</Text>
                <View>
                  <Text
                    style={[
                      styles.langName,
                      {
                        color: isSelected ? skin.colors.accent : skin.colors.textPrimary,
                        fontWeight: isSelected ? '700' : '500',
                      },
                    ]}>
                    {lang.nativeName}
                  </Text>
                  <Text style={[styles.subName, { color: skin.colors.textSecondary }]}>
                    {lang.name}
                  </Text>
                </View>
              </View>

              <View
                style={[
                  styles.radioOuter,
                  {
                    borderColor: isSelected ? skin.colors.accent : skin.colors.surfaceBorder,
                    backgroundColor: isSelected ? skin.colors.accent : 'transparent',
                  },
                ]}>
                {isSelected && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
    paddingHorizontal: 16,
  },
  sectionSub: {
    fontSize: 13,
    marginBottom: 14,
    paddingHorizontal: 16,
    lineHeight: 18,
  },
  card: {
    marginHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  flagEmoji: {
    fontSize: 24,
  },
  langName: {
    fontSize: 15,
  },
  subName: {
    fontSize: 12,
    marginTop: 2,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
