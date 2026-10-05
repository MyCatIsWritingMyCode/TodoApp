import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSkin } from '../../theme/SkinProvider';
import { useHouseholdStore } from '../../store/useHouseholdStore';

interface AuthModalProps {
  visible: boolean;
  onClose: () => void;
}

export function AuthModal({ visible, onClose }: AuthModalProps) {
  const { skin } = useSkin();
  const login = useHouseholdStore((s) => s.login);
  const register = useHouseholdStore((s) => s.register);
  const authLoading = useHouseholdStore((s) => s.authLoading);
  const authError = useHouseholdStore((s) => s.authError);
  const clearAuthError = useHouseholdStore((s) => s.clearAuthError);

  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleTabChange = (tab: 'login' | 'register') => {
    setActiveTab(tab);
    clearAuthError();
  };

  const handleLogin = async () => {
    if (!usernameOrEmail.trim() || !password) return;
    const ok = await login({ usernameOrEmail: usernameOrEmail.trim(), password });
    if (ok) {
      onClose();
    }
  };

  const handleDemoLogin = async () => {
    setUsernameOrEmail('demo');
    setPassword('Password123!');
    const ok = await login({ usernameOrEmail: 'demo', password: 'Password123!' });
    if (ok) {
      onClose();
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
      onClose();
    }
  };

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.backdrop}>
        <Pressable style={styles.dismissOverlay} onPress={onClose} />

        <View
          style={[
            styles.modalCard,
            {
              backgroundColor: skin.colors.surface,
              borderColor: skin.colors.surfaceBorder,
            },
          ]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={[styles.iconCircle, { backgroundColor: skin.colors.accentLight }]}>
                <Ionicons name="shield-checkmark" size={20} color={skin.colors.accentDark} />
              </View>
              <View>
                <Text style={[styles.title, { color: skin.colors.textPrimary }]}>
                  {activeTab === 'login' ? 'Family Sign In' : 'Create Account'}
                </Text>
                <Text style={[styles.subtitle, { color: skin.colors.textSecondary }]}>
                  Secure Family Cloud Sync
                </Text>
              </View>
            </View>

            <Pressable onPress={onClose} hitSlop={10}>
              <Ionicons name="close" size={22} color={skin.colors.textMuted} />
            </Pressable>
          </View>

          {/* Tab Selector */}
          <View
            style={[
              styles.tabSelector,
              {
                backgroundColor: skin.colors.surfaceElevated,
                borderColor: skin.colors.surfaceBorder,
              },
            ]}>
            <Pressable
              onPress={() => handleTabChange('login')}
              style={[
                styles.tabBtn,
                {
                  backgroundColor: activeTab === 'login' ? skin.colors.accent : 'transparent',
                },
              ]}>
              <Text
                style={[
                  styles.tabBtnText,
                  { color: activeTab === 'login' ? '#FFFFFF' : skin.colors.textSecondary },
                ]}>
                Sign In
              </Text>
            </Pressable>

            <Pressable
              onPress={() => handleTabChange('register')}
              style={[
                styles.tabBtn,
                {
                  backgroundColor: activeTab === 'register' ? skin.colors.accent : 'transparent',
                },
              ]}>
              <Text
                style={[
                  styles.tabBtnText,
                  { color: activeTab === 'register' ? '#FFFFFF' : skin.colors.textSecondary },
                ]}>
                Register
              </Text>
            </Pressable>
          </View>

          {/* Error Banner */}
          {authError && (
            <View style={[styles.errorBanner, { backgroundColor: skin.colors.danger + '18', borderColor: skin.colors.danger + '40' }]}>
              <Ionicons name="alert-circle" size={16} color={skin.colors.danger} />
              <Text style={[styles.errorText, { color: skin.colors.danger }]}>
                {authError}
              </Text>
            </View>
          )}

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.formScroll}>
            {activeTab === 'login' ? (
              <>
                {/* Username or Email */}
                <Text style={[styles.label, { color: skin.colors.textSecondary }]}>
                  Username or Email
                </Text>
                <TextInput
                  value={usernameOrEmail}
                  onChangeText={setUsernameOrEmail}
                  placeholder="e.g. demo or alex@example.com"
                  placeholderTextColor={skin.colors.textMuted}
                  autoCapitalize="none"
                  style={[
                    styles.input,
                    {
                      backgroundColor: skin.colors.surfaceElevated,
                      borderColor: skin.colors.surfaceBorder,
                      color: skin.colors.textPrimary,
                    },
                  ]}
                />

                {/* Password */}
                <Text style={[styles.label, { color: skin.colors.textSecondary }]}>
                  Password
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
                    placeholder="Enter your password"
                    placeholderTextColor={skin.colors.textMuted}
                    secureTextEntry={!showPassword}
                    style={[styles.passwordInput, { color: skin.colors.textPrimary }]}
                  />
                  <Pressable onPress={() => setShowPassword(!showPassword)} hitSlop={8}>
                    <Ionicons
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={18}
                      color={skin.colors.textMuted}
                    />
                  </Pressable>
                </View>

                {/* Submit Sign In */}
                <Pressable
                  disabled={authLoading}
                  onPress={handleLogin}
                  style={({ pressed }) => [
                    styles.submitBtn,
                    {
                      backgroundColor: skin.colors.accent,
                      opacity: pressed || authLoading ? 0.8 : 1,
                    },
                  ]}>
                  {authLoading ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <>
                      <Ionicons name="log-in-outline" size={18} color="#FFFFFF" />
                      <Text style={styles.submitBtnText}>Sign In</Text>
                    </>
                  )}
                </Pressable>

                {/* Quick One-Tap Demo Login */}
                <Pressable
                  disabled={authLoading}
                  onPress={handleDemoLogin}
                  style={({ pressed }) => [
                    styles.demoBtn,
                    {
                      backgroundColor: skin.colors.surfaceElevated,
                      borderColor: skin.colors.accent,
                      opacity: pressed ? 0.8 : 1,
                    },
                  ]}>
                  <Text style={styles.demoIcon}>⚡</Text>
                  <View>
                    <Text style={[styles.demoTitle, { color: skin.colors.textPrimary }]}>
                      Quick Demo Login (demo / Password123!)
                    </Text>
                    <Text style={[styles.demoSub, { color: skin.colors.textSecondary }]}>
                      Quick demo access for family tasks
                    </Text>
                  </View>
                </Pressable>
              </>
            ) : (
              <>
                {/* Registration Fields */}
                <Text style={[styles.label, { color: skin.colors.textSecondary }]}>
                  Username *
                </Text>
                <TextInput
                  value={regUsername}
                  onChangeText={setRegUsername}
                  placeholder="e.g. alex or mom"
                  placeholderTextColor={skin.colors.textMuted}
                  autoCapitalize="none"
                  style={[
                    styles.input,
                    {
                      backgroundColor: skin.colors.surfaceElevated,
                      borderColor: skin.colors.surfaceBorder,
                      color: skin.colors.textPrimary,
                    },
                  ]}
                />

                <Text style={[styles.label, { color: skin.colors.textSecondary }]}>
                  Email Address *
                </Text>
                <TextInput
                  value={regEmail}
                  onChangeText={setRegEmail}
                  placeholder="e.g. alex@example.com"
                  placeholderTextColor={skin.colors.textMuted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={[
                    styles.input,
                    {
                      backgroundColor: skin.colors.surfaceElevated,
                      borderColor: skin.colors.surfaceBorder,
                      color: skin.colors.textPrimary,
                    },
                  ]}
                />

                <Text style={[styles.label, { color: skin.colors.textSecondary }]}>
                  Password *
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
                    placeholder="Min 6 characters"
                    placeholderTextColor={skin.colors.textMuted}
                    secureTextEntry={!showPassword}
                    style={[styles.passwordInput, { color: skin.colors.textPrimary }]}
                  />
                  <Pressable onPress={() => setShowPassword(!showPassword)} hitSlop={8}>
                    <Ionicons
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={18}
                      color={skin.colors.textMuted}
                    />
                  </Pressable>
                </View>

                {/* Submit Register */}
                <Pressable
                  disabled={authLoading}
                  onPress={handleRegister}
                  style={({ pressed }) => [
                    styles.submitBtn,
                    {
                      backgroundColor: skin.colors.accent,
                      opacity: pressed || authLoading ? 0.8 : 1,
                    },
                  ]}>
                  {authLoading ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <>
                      <Ionicons name="person-add-outline" size={18} color="#FFFFFF" />
                      <Text style={styles.submitBtnText}>Create Account</Text>
                    </>
                  )}
                </Pressable>
              </>
            )}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  dismissOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalCard: {
    width: '100%',
    maxWidth: 440,
    borderRadius: 22,
    borderWidth: 1,
    padding: 20,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 6,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 11,
    marginTop: 1,
  },
  tabSelector: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 14,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 12,
    gap: 8,
  },
  errorText: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  formScroll: {
    paddingBottom: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
    marginTop: 8,
  },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 14,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    marginTop: 16,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  demoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    gap: 10,
    marginTop: 12,
  },
  demoIcon: {
    fontSize: 20,
  },
  demoTitle: {
    fontSize: 12,
    fontWeight: '700',
  },
  demoSub: {
    fontSize: 10,
    marginTop: 1,
  },
  guestBtn: {
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 4,
  },
  guestBtnText: {
    fontSize: 12,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
