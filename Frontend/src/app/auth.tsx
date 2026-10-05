import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSkin } from '../theme/SkinProvider';
import { useTranslation } from '../i18n/LanguageProvider';
import { useHouseholdStore } from '../store/useHouseholdStore';
export default function AuthScreen() {
  const router = useRouter();
  const { skin } = useSkin();
  const { t, language, setLanguage } = useTranslation();

  const authUser = useHouseholdStore((s) => s.authUser);
  const authLoading = useHouseholdStore((s) => s.authLoading);
  const authError = useHouseholdStore((s) => s.authError);
  const clearAuthError = useHouseholdStore((s) => s.clearAuthError);
  const login = useHouseholdStore((s) => s.login);
  const register = useHouseholdStore((s) => s.register);

  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // If already authenticated, redirect to tabs
  useEffect(() => {
    if (authUser) {
      router.replace('/(tabs)');
    }
  }, [authUser, router]);

  const handleTabChange = (tab: 'login' | 'register') => {
    setActiveTab(tab);
    clearAuthError();
  };

  const handleLogin = async () => {
    if (!usernameOrEmail.trim() || !password) return;
    const ok = await login({
      usernameOrEmail: usernameOrEmail.trim(),
      password,
    });
    if (ok) {
      router.replace('/(tabs)');
    }
  };

  const handleRegister = async () => {
    if (!regUsername.trim() || !regEmail.trim() || !regPassword) return;
    const ok = await register({
      username: regUsername.trim(),
      email: regEmail.trim(),
      password: regPassword,
    });
    if (ok) {
      router.replace('/(tabs)');
    }
  };

  const handleFillDemo = () => {
    setActiveTab('login');
    setUsernameOrEmail('demo');
    setPassword('Password123!');
    clearAuthError();
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'de' : 'en');
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: skin.colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}>
        {/* Top Bar: Language Switcher */}
        <View style={styles.topBar}>
          <View />
          <Pressable
            onPress={toggleLanguage}
            style={[
              styles.langPill,
              {
                backgroundColor: skin.colors.surfaceElevated,
                borderColor: skin.colors.surfaceBorder,
              },
            ]}>
            <Text style={styles.langFlag}>{language === 'en' ? '🇬🇧' : '🇩🇪'}</Text>
            <Text style={[styles.langText, { color: skin.colors.textPrimary }]}>
              {language === 'en' ? 'English' : 'Deutsch'}
            </Text>
          </Pressable>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>
          {/* Hero Branding */}
          <View style={styles.brandHero}>
            <View
              style={[
                styles.brandLogoCircle,
                {
                  backgroundColor: skin.colors.accentLight,
                  borderColor: skin.colors.accent,
                },
              ]}>
              <Text style={styles.brandLogoEmoji}>🏡</Text>
            </View>
            <Text style={[styles.brandTitle, { color: skin.colors.textPrimary }]}>
              ChoreQuest
            </Text>
            <Text style={[styles.brandSubtitle, { color: skin.colors.textSecondary }]}>
              {t.auth.welcomeSubtitle}
            </Text>
          </View>

          {/* Auth Card */}
          <View
            style={[
              styles.authCard,
              {
                backgroundColor: skin.colors.surface,
                borderColor: skin.colors.surfaceBorder,
                shadowColor: skin.colors.cardShadow,
              },
            ]}>
            {/* Tab Switcher */}
            <View
              style={[
                styles.tabContainer,
                {
                  backgroundColor: skin.colors.surfaceElevated,
                  borderColor: skin.colors.surfaceBorder,
                },
              ]}>
              <Pressable
                onPress={() => handleTabChange('login')}
                style={[
                  styles.tabBtn,
                  activeTab === 'login' && [
                    styles.tabBtnActive,
                    { backgroundColor: skin.colors.surface },
                  ],
                ]}>
                <Ionicons
                  name="log-in-outline"
                  size={16}
                  color={activeTab === 'login' ? skin.colors.accent : skin.colors.textSecondary}
                />
                <Text
                  style={[
                    styles.tabBtnText,
                    {
                      color:
                        activeTab === 'login' ? skin.colors.accent : skin.colors.textSecondary,
                      fontWeight: activeTab === 'login' ? '700' : '500',
                    },
                  ]}>
                  {t.auth.signInTab}
                </Text>
              </Pressable>

              <Pressable
                onPress={() => handleTabChange('register')}
                style={[
                  styles.tabBtn,
                  activeTab === 'register' && [
                    styles.tabBtnActive,
                    { backgroundColor: skin.colors.surface },
                  ],
                ]}>
                <Ionicons
                  name="person-add-outline"
                  size={16}
                  color={activeTab === 'register' ? skin.colors.accent : skin.colors.textSecondary}
                />
                <Text
                  style={[
                    styles.tabBtnText,
                    {
                      color:
                        activeTab === 'register' ? skin.colors.accent : skin.colors.textSecondary,
                      fontWeight: activeTab === 'register' ? '700' : '500',
                    },
                  ]}>
                  {t.auth.registerTab}
                </Text>
              </Pressable>
            </View>

            {/* Error Banner */}
            {authError ? (
              <View
                style={[
                  styles.errorBanner,
                  {
                    backgroundColor: skin.colors.danger + '18',
                    borderColor: skin.colors.danger + '40',
                  },
                ]}>
                <Ionicons name="alert-circle" size={18} color={skin.colors.danger} />
                <Text style={[styles.errorText, { color: skin.colors.danger }]}>
                  {authError}
                </Text>
              </View>
            ) : null}

            {activeTab === 'login' ? (
              /* Sign In Form */
              <View style={styles.formContainer}>
                <Text style={[styles.inputLabel, { color: skin.colors.textSecondary }]}>
                  {t.auth.usernameOrEmailLabel}
                </Text>
                <TextInput
                  value={usernameOrEmail}
                  onChangeText={setUsernameOrEmail}
                  placeholder={t.auth.usernameOrEmailPlaceholder}
                  placeholderTextColor={skin.colors.textMuted}
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={[
                    styles.inputField,
                    {
                      backgroundColor: skin.colors.surfaceElevated,
                      borderColor: skin.colors.surfaceBorder,
                      color: skin.colors.textPrimary,
                    },
                  ]}
                />

                <Text style={[styles.inputLabel, { color: skin.colors.textSecondary }]}>
                  {t.auth.passwordLabel}
                </Text>
                <View
                  style={[
                    styles.passwordRow,
                    {
                      backgroundColor: skin.colors.surfaceElevated,
                      borderColor: skin.colors.surfaceBorder,
                    },
                  ]}>
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    placeholder={t.auth.passwordPlaceholder}
                    placeholderTextColor={skin.colors.textMuted}
                    secureTextEntry={!showPassword}
                    style={[styles.passwordField, { color: skin.colors.textPrimary }]}
                  />
                  <Pressable onPress={() => setShowPassword(!showPassword)} hitSlop={10}>
                    <Ionicons
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={18}
                      color={skin.colors.textMuted}
                    />
                  </Pressable>
                </View>

                {/* Submit Sign In Button */}
                <Pressable
                  disabled={authLoading || !usernameOrEmail.trim() || !password}
                  onPress={handleLogin}
                  style={({ pressed }) => [
                    styles.primaryBtn,
                    {
                      backgroundColor: skin.colors.accent,
                      opacity:
                        pressed || authLoading || !usernameOrEmail.trim() || !password ? 0.75 : 1,
                    },
                  ]}>
                  {authLoading ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <>
                      <Ionicons name="log-in-outline" size={18} color="#FFFFFF" />
                      <Text style={styles.primaryBtnText}>{t.auth.signInButton}</Text>
                    </>
                  )}
                </Pressable>

                {/* One-tap Demo Helper */}
                <Pressable onPress={handleFillDemo} style={styles.demoFillBtn}>
                  <Text style={[styles.demoFillText, { color: skin.colors.accent }]}>
                    ⚡ {t.auth.quickDemoHint}
                  </Text>
                </Pressable>
              </View>
            ) : (
              /* Register Form */
              <View style={styles.formContainer}>
                <Text style={[styles.inputLabel, { color: skin.colors.textSecondary }]}>
                  {t.auth.usernameLabel}
                </Text>
                <TextInput
                  value={regUsername}
                  onChangeText={setRegUsername}
                  placeholder={t.auth.usernamePlaceholder}
                  placeholderTextColor={skin.colors.textMuted}
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={[
                    styles.inputField,
                    {
                      backgroundColor: skin.colors.surfaceElevated,
                      borderColor: skin.colors.surfaceBorder,
                      color: skin.colors.textPrimary,
                    },
                  ]}
                />

                <Text style={[styles.inputLabel, { color: skin.colors.textSecondary }]}>
                  {t.auth.emailLabel}
                </Text>
                <TextInput
                  value={regEmail}
                  onChangeText={setRegEmail}
                  placeholder={t.auth.emailPlaceholder}
                  placeholderTextColor={skin.colors.textMuted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={[
                    styles.inputField,
                    {
                      backgroundColor: skin.colors.surfaceElevated,
                      borderColor: skin.colors.surfaceBorder,
                      color: skin.colors.textPrimary,
                    },
                  ]}
                />

                <Text style={[styles.inputLabel, { color: skin.colors.textSecondary }]}>
                  {t.auth.passwordLabel}
                </Text>
                <View
                  style={[
                    styles.passwordRow,
                    {
                      backgroundColor: skin.colors.surfaceElevated,
                      borderColor: skin.colors.surfaceBorder,
                    },
                  ]}>
                  <TextInput
                    value={regPassword}
                    onChangeText={setRegPassword}
                    placeholder={t.auth.passwordPlaceholder}
                    placeholderTextColor={skin.colors.textMuted}
                    secureTextEntry={!showPassword}
                    style={[styles.passwordField, { color: skin.colors.textPrimary }]}
                  />
                  <Pressable onPress={() => setShowPassword(!showPassword)} hitSlop={10}>
                    <Ionicons
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={18}
                      color={skin.colors.textMuted}
                    />
                  </Pressable>
                </View>

                {/* Submit Register Button */}
                <Pressable
                  disabled={authLoading || !regUsername.trim() || !regEmail.trim() || !regPassword}
                  onPress={handleRegister}
                  style={({ pressed }) => [
                    styles.primaryBtn,
                    {
                      backgroundColor: skin.colors.accent,
                      opacity:
                        pressed || authLoading || !regUsername.trim() || !regEmail.trim() || !regPassword
                          ? 0.75
                          : 1,
                    },
                  ]}>
                  {authLoading ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <>
                      <Ionicons name="person-add-outline" size={18} color="#FFFFFF" />
                      <Text style={styles.primaryBtnText}>{t.auth.registerButton}</Text>
                    </>
                  )}
                </Pressable>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 6,
  },
  langPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 14,
    borderWidth: 1,
    gap: 6,
  },
  langFlag: {
    fontSize: 14,
  },
  langText: {
    fontSize: 12,
    fontWeight: '700',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
  brandHero: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 24,
  },
  brandLogoCircle: {
    width: 68,
    height: 68,
    borderRadius: 22,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  brandLogoEmoji: {
    fontSize: 34,
  },
  brandTitle: {
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  brandSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
  },
  authCard: {
    width: '100%',
    maxWidth: 440,
    borderRadius: 22,
    borderWidth: 1,
    padding: 20,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  tabContainer: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 18,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 10,
    gap: 6,
  },
  tabBtnActive: {
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  tabBtnText: {
    fontSize: 13,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    gap: 8,
    marginBottom: 14,
  },
  errorText: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  formContainer: {
    width: '100%',
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
    marginTop: 8,
  },
  inputField: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    marginBottom: 6,
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    marginBottom: 16,
  },
  passwordField: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 14,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    borderRadius: 14,
    gap: 8,
    marginTop: 4,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  demoFillBtn: {
    alignItems: 'center',
    marginTop: 14,
    paddingVertical: 6,
  },
  demoFillText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
