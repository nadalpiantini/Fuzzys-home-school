'use client';

import { useCallback, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';

interface ConfettiOptions {
  particleCount?: number;
  angle?: number;
  spread?: number;
  startVelocity?: number;
  decay?: number;
  gravity?: number;
  drift?: number;
  ticks?: number;
  origin?: {
    x?: number;
    y?: number;
  };
  colors?: string[];
  shapes?: confetti.Shape[];
  scalar?: number;
  zIndex?: number;
  disableForReducedMotion?: boolean;
}

const defaultOptions: ConfettiOptions = {
  particleCount: 100,
  angle: 90,
  spread: 45,
  startVelocity: 45,
  decay: 0.9,
  gravity: 1,
  drift: 0,
  ticks: 200,
  origin: { x: 0.5, y: 0.5 },
  colors: ['#26ccff', '#a25afd', '#ff5e7e', '#88ff5a', '#fcff42', '#ffa62d', '#ff36ff'],
  scalar: 1,
  zIndex: 100,
  disableForReducedMotion: true,
};

export function useConfetti() {
  const confettiRef = useRef<confetti.CreateTypes | null>(null);

  useEffect(() => {
    // Cleanup function to reset confetti on unmount
    return () => {
      if (confettiRef.current) {
        confettiRef.current.reset();
      }
    };
  }, []);

  const fire = useCallback((options: ConfettiOptions = {}) => {
    const finalOptions = { ...defaultOptions, ...options };

    // Check for reduced motion preference
    if (finalOptions.disableForReducedMotion &&
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    confetti(finalOptions as confetti.Options);
  }, []);

  const fireMultiple = useCallback((count: number = 3, delay: number = 250, options: ConfettiOptions = {}) => {
    let fired = 0;

    const interval = setInterval(() => {
      fire(options);
      fired++;

      if (fired >= count) {
        clearInterval(interval);
      }
    }, delay);
  }, [fire]);

  const fireworks = useCallback(() => {
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);

      // since particles fall down, start a bit higher than random
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      });

      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      });
    }, 250);
  }, []);

  const schoolPride = useCallback(() => {
    const end = Date.now() + 3000;

    // School colors for Fuzzy's Home School
    const colors = ['#8B5CF6', '#EC4899', '#06B6D4', '#10B981'];

    (function frame() {
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors
      });

      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());
  }, []);

  const snow = useCallback(() => {
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    let skew = 1;

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    (function frame() {
      const timeLeft = animationEnd - Date.now();
      const ticks = Math.max(200, 500 * (timeLeft / duration));

      skew = Math.max(0.8, skew - 0.001);

      confetti({
        particleCount: 1,
        startVelocity: 0,
        ticks: ticks,
        origin: {
          x: Math.random(),
          // since particles fall down, skew start toward the top
          y: (Math.random() * skew) - 0.2
        },
        colors: ['#ffffff'],
        shapes: ['circle'],
        gravity: randomInRange(0.4, 0.6),
        scalar: randomInRange(0.4, 1),
        drift: randomInRange(-0.4, 0.4)
      });

      if (timeLeft > 0) {
        requestAnimationFrame(frame);
      }
    }());
  }, []);

  const stars = useCallback(() => {
    const defaults = {
      spread: 360,
      ticks: 50,
      gravity: 0,
      decay: 0.94,
      startVelocity: 30,
      colors: ['FFE400', 'FFBD00', 'E89400', 'FFCA6C', 'FDFFB8']
    };

    function shoot() {
      confetti({
        ...defaults,
        particleCount: 40,
        scalar: 1.2,
        shapes: ['star']
      });

      confetti({
        ...defaults,
        particleCount: 10,
        scalar: 0.75,
        shapes: ['circle']
      });
    }

    setTimeout(shoot, 0);
    setTimeout(shoot, 100);
    setTimeout(shoot, 200);
  }, []);

  return {
    fire,
    fireMultiple,
    fireworks,
    schoolPride,
    snow,
    stars,
  };
}