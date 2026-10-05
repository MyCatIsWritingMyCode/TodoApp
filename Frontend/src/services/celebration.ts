import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

// Celebration effect orchestrator (Confetti on web/canvas, haptics on mobile)
export async function triggerTaskCelebration(isMajorGoal: boolean = false) {
  // 1. Trigger tactile haptic feedback
  try {
    if (Platform.OS !== 'web') {
      if (isMajorGoal) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    }
  } catch {
    // Haptics might not be supported on some devices/simulators, ignore safely
  }

  // 2. Trigger Confetti
  if (Platform.OS === 'web') {
    try {
      // Dynamic import to avoid SSR / bundling quirks
      const confetti = (await import('canvas-confetti')).default;
      if (confetti) {
        if (isMajorGoal) {
          // Double burst fireworks for big level-ups or daily goals!
          confetti({
            particleCount: 100,
            spread: 80,
            origin: { y: 0.6 },
            colors: ['#D97706', '#F59E0B', '#10B981', '#6366F1', '#EC4899'],
          });
          setTimeout(() => {
            confetti({
              particleCount: 50,
              angle: 60,
              spread: 55,
              origin: { x: 0 },
            });
            confetti({
              particleCount: 50,
              angle: 120,
              spread: 55,
              origin: { x: 1 },
            });
          }, 250);
        } else {
          // Standard joyful burst for regular task completion
          confetti({
            particleCount: 45,
            spread: 60,
            origin: { y: 0.7 },
            colors: ['#10B981', '#3B82F6', '#F59E0B', '#A855F7'],
          });
        }
      }
    } catch (e) {
      console.log('Confetti effect web trigger:', e);
    }
  }
}

export async function triggerPerkCelebration() {
  try {
    if (Platform.OS !== 'web') {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  } catch {}

  if (Platform.OS === 'web') {
    try {
      const confetti = (await import('canvas-confetti')).default;
      if (confetti) {
        confetti({
          particleCount: 80,
          spread: 100,
          origin: { y: 0.5 },
          shapes: ['star'],
          colors: ['#F59E0B', '#EAB308', '#FDE047', '#D97706'],
        });
      }
    } catch {}
  }
}
