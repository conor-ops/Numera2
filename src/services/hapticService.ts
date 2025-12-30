import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';

export const triggerHaptic = async (style: ImpactStyle = ImpactStyle.Light) => {
  // Safety check: Do not call native Haptics on web to prevent errors
  if (Capacitor.getPlatform() !== 'web') {
    try {
      await Haptics.impact({ style });
    } catch (e) {
      // Fail silently if hardware is unavailable
      console.debug('Haptic error:', e);
    }
  }
};

export const triggerSelectionHaptic = async () => {
  if (Capacitor.getPlatform() !== 'web') {
    try {
      await Haptics.selectionStart();
      await Haptics.selectionChanged();
      await Haptics.selectionEnd();
    } catch (e) {
      // Ignore
    }
  }
};