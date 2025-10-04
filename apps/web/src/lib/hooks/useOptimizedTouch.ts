'use client';

import { useCallback, useRef, useState } from 'react';

interface TouchPoint {
  x: number;
  y: number;
  id: number;
}

interface TouchState {
  isDragging: boolean;
  startPoint: TouchPoint | null;
  currentPoint: TouchPoint | null;
  deltaX: number;
  deltaY: number;
  velocity: number;
  direction: string | null;
}

interface OptimizedTouchOptions {
  debounceMs?: number;
  throttleMs?: number;
  minSwipeDistance?: number;
  maxTapDistance?: number;
  onTouchStart?: (point: TouchPoint) => void;
  onTouchMove?: (point: TouchPoint, delta: { x: number; y: number }) => void;
  onTouchEnd?: (point: TouchPoint, gesture: string) => void;
  onTap?: (point: TouchPoint) => void;
  onSwipe?: (direction: string, velocity: number) => void;
}

export const useOptimizedTouch = (options: OptimizedTouchOptions = {}) => {
  const {
    debounceMs = 16, // 60fps
    throttleMs = 8, // 120fps
    minSwipeDistance = 30,
    maxTapDistance = 10,
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    onTap,
    onSwipe,
  } = options;

  const [touchState, setTouchState] = useState<TouchState>({
    isDragging: false,
    startPoint: null,
    currentPoint: null,
    deltaX: 0,
    deltaY: 0,
    velocity: 0,
    direction: null,
  });

  const lastTouchTimeRef = useRef<number>(0);
  const lastMoveTimeRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const touchStartPointRef = useRef<TouchPoint | null>(null);
  const rafIdRef = useRef<number | null>(null);

  const getTouchPoint = useCallback((touch: Touch): TouchPoint => ({
    x: touch.clientX,
    y: touch.clientY,
    id: touch.identifier,
  }), []);

  const calculateVelocity = useCallback((start: TouchPoint, end: TouchPoint, timeMs: number): number => {
    const distance = Math.sqrt(
      Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2)
    );
    return distance / timeMs;
  }, []);

  const getDirection = useCallback((deltaX: number, deltaY: number): string => {
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      return deltaX > 0 ? 'right' : 'left';
    }
    return deltaY > 0 ? 'down' : 'up';
  }, []);

  const debouncedTouchStart = useCallback((event: React.TouchEvent) => {
    const now = Date.now();
    if (now - lastTouchTimeRef.current < debounceMs) return;
    
    lastTouchTimeRef.current = now;
    startTimeRef.current = now;
    
    const touch = event.touches[0];
    const touchPoint = getTouchPoint(touch);
    touchStartPointRef.current = touchPoint;

    setTouchState({
      isDragging: true,
      startPoint: touchPoint,
      currentPoint: touchPoint,
      deltaX: 0,
      deltaY: 0,
      velocity: 0,
      direction: null,
    });

    onTouchStart?.(touchPoint);
  }, [debounceMs, getTouchPoint, onTouchStart]);

  const throttledTouchMove = useCallback((event: React.TouchEvent) => {
    const now = Date.now();
    if (now - lastMoveTimeRef.current < throttleMs) return;
    
    lastMoveTimeRef.current = now;
    
    if (!touchState.isDragging) return;

    const touch = event.touches[0];
    const touchPoint = getTouchPoint(touch);
    const startPoint = touchStartPointRef.current;

    if (!startPoint) return;

    const deltaX = touchPoint.x - startPoint.x;
    const deltaY = touchPoint.y - startPoint.y;
    const velocity = calculateVelocity(startPoint, touchPoint, now - startTimeRef.current);
    const direction = getDirection(deltaX, deltaY);

    setTouchState(prev => ({
      ...prev,
      currentPoint: touchPoint,
      deltaX,
      deltaY,
      velocity,
      direction,
    }));

    onTouchMove?.(touchPoint, { x: deltaX, y: deltaY });
  }, [throttleMs, touchState.isDragging, getTouchPoint, calculateVelocity, getDirection, onTouchMove]);

  const debouncedTouchEnd = useCallback((event: React.TouchEvent) => {
    const now = Date.now();
    if (now - lastTouchTimeRef.current < debounceMs) return;

    const touch = event.changedTouches[0];
    const touchPoint = getTouchPoint(touch);
    const startPoint = touchStartPointRef.current;

    if (!startPoint) return;

    const deltaX = touchPoint.x - startPoint.x;
    const deltaY = touchPoint.y - startPoint.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const velocity = calculateVelocity(startPoint, touchPoint, now - startTimeRef.current);

    let gesture = 'tap';
    
    if (distance > minSwipeDistance) {
      gesture = 'swipe';
      const direction = getDirection(deltaX, deltaY);
      onSwipe?.(direction, velocity);
    } else if (distance < maxTapDistance) {
      gesture = 'tap';
      onTap?.(touchPoint);
    }

    setTouchState({
      isDragging: false,
      startPoint: null,
      currentPoint: null,
      deltaX: 0,
      deltaY: 0,
      velocity: 0,
      direction: null,
    });

    onTouchEnd?.(touchPoint, gesture);
    touchStartPointRef.current = null;
  }, [debounceMs, getTouchPoint, calculateVelocity, getDirection, minSwipeDistance, maxTapDistance, onSwipe, onTap, onTouchEnd]);

  const touchHandlers = {
    onTouchStart: debouncedTouchStart,
    onTouchMove: throttledTouchMove,
    onTouchEnd: debouncedTouchEnd,
    onTouchCancel: debouncedTouchEnd,
  };

  return {
    touchState,
    touchHandlers,
  };
};

// Hook específico para drag and drop optimizado
export const useOptimizedDragDrop = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragElement, setDragElement] = useState<HTMLElement | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const rafIdRef = useRef<number | null>(null);

  const startDrag = useCallback((element: HTMLElement, touch: Touch) => {
    setIsDragging(true);
    setDragElement(element);
    
    const rect = element.getBoundingClientRect();
    setDragOffset({
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top,
    });

    // Optimizar con RAF
    const updatePosition = (touch: Touch) => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
      
      rafIdRef.current = requestAnimationFrame(() => {
        if (element && isDragging) {
          element.style.transform = `translate(${touch.clientX - dragOffset.x}px, ${touch.clientY - dragOffset.y}px)`;
          element.style.zIndex = '1000';
          element.style.pointerEvents = 'none';
        }
      });
    };

    return updatePosition;
  }, [isDragging, dragOffset]);

  const endDrag = useCallback(() => {
    setIsDragging(false);
    setDragElement(null);
    setDragOffset({ x: 0, y: 0 });
    
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
  }, []);

  return {
    isDragging,
    dragElement,
    dragOffset,
    startDrag,
    endDrag,
  };
};
