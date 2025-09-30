import { useState, useEffect } from 'react';

interface MobileDetectionResult {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isTouchDevice: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  screenSize: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  orientation: 'portrait' | 'landscape';
  hasHapticFeedback: boolean;
}

export const useMobileDetection = (): MobileDetectionResult => {
  const [detection, setDetection] = useState<MobileDetectionResult>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    isTouchDevice: false,
    isIOS: false,
    isAndroid: false,
    screenSize: 'lg',
    orientation: 'landscape',
    hasHapticFeedback: false,
  });

  useEffect(() => {
    const detectDevice = () => {
      if (typeof window === 'undefined') return;

      const userAgent = navigator.userAgent;
      const width = window.innerWidth;
      const height = window.innerHeight;

      // Device type detection - improved logic
      const isMobile =
        width < 768 ||
        /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          userAgent,
        );
      const isTablet =
        (width >= 768 && width < 1024) ||
        /iPad/i.test(userAgent) ||
        (width >= 768 &&
          /Android/i.test(userAgent) &&
          !/Mobile/i.test(userAgent));
      const isDesktop = width >= 1024 && !isMobile && !isTablet;

      // Touch support detection
      const isTouchDevice =
        'ontouchstart' in window || navigator.maxTouchPoints > 0;

      // OS detection
      const isIOS = /iPad|iPhone|iPod/.test(userAgent);
      const isAndroid = /Android/.test(userAgent);

      // Screen size detection
      let screenSize: MobileDetectionResult['screenSize'] = 'lg';
      if (width < 640) screenSize = 'xs';
      else if (width < 768) screenSize = 'sm';
      else if (width < 1024) screenSize = 'md';
      else if (width < 1280) screenSize = 'lg';
      else if (width < 1536) screenSize = 'xl';
      else screenSize = '2xl';

      // Orientation
      const orientation = height > width ? 'portrait' : 'landscape';

      // Haptic feedback support
      const hasHapticFeedback =
        'vibrate' in navigator || 'hapticFeedback' in window;

      setDetection({
        isMobile,
        isTablet,
        isDesktop,
        isTouchDevice,
        isIOS,
        isAndroid,
        screenSize,
        orientation,
        hasHapticFeedback,
      });
    };

    // Initial detection
    detectDevice();

    // Listen for resize and orientation changes
    const handleResize = () => detectDevice();
    const handleOrientationChange = () => {
      // Delay to ensure dimensions are updated
      setTimeout(detectDevice, 100);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);

    // Modern screen orientation API
    if (screen.orientation) {
      screen.orientation.addEventListener('change', handleOrientationChange);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);

      if (screen.orientation) {
        screen.orientation.removeEventListener(
          'change',
          handleOrientationChange,
        );
      }
    };
  }, []);

  return detection;
};

// Utility functions
export const triggerHapticFeedback = (
  type: 'light' | 'medium' | 'heavy' = 'light',
) => {
  if (typeof window === 'undefined') return;

  // Modern Vibration API
  if ('vibrate' in navigator) {
    const patterns = {
      light: 10,
      medium: 20,
      heavy: 50,
    };
    navigator.vibrate(patterns[type]);
  }

  // iOS haptic feedback (if available)
  if ('hapticFeedback' in window) {
    try {
      (window as any).hapticFeedback(type);
    } catch (error) {
      // Silently fail if not available
    }
  }
};

export const preventIOSBounce = () => {
  if (typeof document === 'undefined') return;

  // Prevent iOS bounce scrolling
  document.addEventListener(
    'touchmove',
    (e: TouchEvent) => {
      // Check for pinch gesture (multiple touches)
      if (e.touches && e.touches.length > 1) {
        e.preventDefault();
      }
    },
    { passive: false },
  );

  // Prevent zoom on double tap
  let lastTouchEnd = 0;
  document.addEventListener(
    'touchend',
    (e: TouchEvent) => {
      const now = new Date().getTime();
      if (now - lastTouchEnd <= 300) {
        e.preventDefault();
      }
      lastTouchEnd = now;
    },
    false,
  );
};
