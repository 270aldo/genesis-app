import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

/**
 * Aggregates common accessibility state into one hook.
 */
export function useAccessibility() {
  const [screenReaderEnabled, setScreenReaderEnabled] = useState(false);
  const [boldTextEnabled, setBoldTextEnabled] = useState(false);

  useEffect(() => {
    void AccessibilityInfo.isScreenReaderEnabled().then(setScreenReaderEnabled);
    void AccessibilityInfo.isBoldTextEnabled().then(setBoldTextEnabled);

    const srSub = AccessibilityInfo.addEventListener('screenReaderChanged', setScreenReaderEnabled);
    const btSub = AccessibilityInfo.addEventListener('boldTextChanged', setBoldTextEnabled);

    return () => {
      srSub.remove();
      btSub.remove();
    };
  }, []);

  return { screenReaderEnabled, boldTextEnabled } as const;
}
