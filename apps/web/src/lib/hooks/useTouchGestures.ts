import { useCallback, useRef, useState } from 'react';
import { triggerHapticFeedback } from './useMobileDetection';

export interface TouchPoint {
  x: number;
  y: number;
  id: number;
}

export interface GestureState {
  isDragging: boolean;
  startPoint: TouchPoint | null;
  currentPoint: TouchPoint | null;
  deltaX: number;
  deltaY: number;
  distance: number;
  velocity: number;
  direction: 'up' | 'down' | 'left' | 'right' | null;
}

export interface GestureHandlers {
  onTouchStart?: (
    point: TouchPoint,
    event: React.TouchEvent | TouchEvent,
  ) => void;
  onTouchMove?: (
    state: GestureState,
    event: React.TouchEvent | TouchEvent,
  ) => void;
  onTouchEnd?: (
    state: GestureState,
    event: React.TouchEvent | TouchEvent,
  ) => void;
  onTap?: (point: TouchPoint, event: React.TouchEvent | TouchEvent) => void;
  onLongPress?: (
    point: TouchPoint,
    event: React.TouchEvent | TouchEvent,
  ) => void;
  onSwipe?: (
    direction: string,
    velocity: number,
    event: React.TouchEvent | TouchEvent,
  ) => void;
  onPinch?: (scale: number, event: React.TouchEvent | TouchEvent) => void;
  enableHaptics?: boolean;
  longPressDelay?: number;
  swipeThreshold?: number;
  tapThreshold?: number;
}

export const useTouchGestures = (handlers: GestureHandlers = {}) => {
  const {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    onTap,
    onLongPress,
    onSwipe,
    onPinch,
    enableHaptics = true,
    longPressDelay = 500,
    swipeThreshold = 50,
    tapThreshold = 10,
  } = handlers;

  const [gestureState, setGestureState] = useState<GestureState>({
    isDragging: false,
    startPoint: null,
    currentPoint: null,
    deltaX: 0,
    deltaY: 0,
    distance: 0,
    velocity: 0,
    direction: null,
  });

  const longPressTimerRef = useRef<NodeJS.Timeout>();
  const startTimeRef = useRef<number>(0);
  const lastMoveTimeRef = useRef<number>(0);
  const initialDistanceRef = useRef<number>(0);

  const getTouchPoint = useCallback(
    (touch: Touch | React.Touch): TouchPoint => ({
      x: touch.clientX,
      y: touch.clientY,
      id: touch.identifier,
    }),
    [],
  );

  const calculateDistance = useCallback(
    (point1: TouchPoint, point2: TouchPoint): number => {
      const deltaX = point2.x - point1.x;
      const deltaY = point2.y - point1.y;
      return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    },
    [],
  );

  const getSwipeDirection = useCallback(
    (deltaX: number, deltaY: number): string => {
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        return deltaX > 0 ? 'right' : 'left';
      } else {
        return deltaY > 0 ? 'down' : 'up';
      }
    },
    [],
  );

  const handleTouchStart = useCallback(
    (event: React.TouchEvent | TouchEvent) => {
      const touch = event.touches[0];
      const touchPoint = getTouchPoint(touch);

      startTimeRef.current = Date.now();
      lastMoveTimeRef.current = startTimeRef.current;

      // Handle multi-touch for pinch
      if (event.touches.length === 2) {
        const touch2 = event.touches[1];
        const point2 = getTouchPoint(touch2);
        initialDistanceRef.current = calculateDistance(touchPoint, point2);
      }

      setGestureState({
        isDragging: true,
        startPoint: touchPoint,
        currentPoint: touchPoint,
        deltaX: 0,
        deltaY: 0,
        distance: 0,
        velocity: 0,
        direction: null,
      });

      // Start long press timer
      if (onLongPress) {
        longPressTimerRef.current = setTimeout(() => {
          if (enableHaptics) {
            triggerHapticFeedback('medium');
          }
          onLongPress(touchPoint, event);
        }, longPressDelay);
      }

      onTouchStart?.(touchPoint, event);
    },
    [
      getTouchPoint,
      calculateDistance,
      onTouchStart,
      onLongPress,
      enableHaptics,
      longPressDelay,
    ],
  );

  const handleTouchMove = useCallback(
    (event: React.TouchEvent | TouchEvent) => {
      // Prevent default to avoid scrolling
      event.preventDefault();

      const touch = event.touches[0];
      const currentPoint = getTouchPoint(touch);
      const currentTime = Date.now();

      setGestureState((prev) => {
        if (!prev.startPoint) return prev;

        const deltaX = currentPoint.x - prev.startPoint.x;
        const deltaY = currentPoint.y - prev.startPoint.y;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        // Calculate velocity
        const timeDelta = currentTime - lastMoveTimeRef.current;
        const distanceDelta = prev.currentPoint
          ? calculateDistance(currentPoint, prev.currentPoint)
          : 0;
        const velocity = timeDelta > 0 ? distanceDelta / timeDelta : 0;

        const direction =
          distance > tapThreshold
            ? (getSwipeDirection(deltaX, deltaY) as any)
            : null;

        const newState = {
          ...prev,
          currentPoint,
          deltaX,
          deltaY,
          distance,
          velocity,
          direction,
        };

        lastMoveTimeRef.current = currentTime;

        // Clear long press timer on move
        if (longPressTimerRef.current && distance > tapThreshold) {
          clearTimeout(longPressTimerRef.current);
          longPressTimerRef.current = undefined;
        }

        // Handle pinch gesture
        if (event.touches.length === 2 && onPinch) {
          const touch2 = event.touches[1];
          const point2 = getTouchPoint(touch2);
          const currentDistance = calculateDistance(currentPoint, point2);
          const scale = currentDistance / initialDistanceRef.current;
          onPinch(scale, event);
        }

        onTouchMove?.(newState, event);

        return newState;
      });
    },
    [
      getTouchPoint,
      calculateDistance,
      getSwipeDirection,
      onTouchMove,
      onPinch,
      tapThreshold,
    ],
  );

  const handleTouchEnd = useCallback(
    (event: React.TouchEvent | TouchEvent) => {
      const endTime = Date.now();
      const totalTime = endTime - startTimeRef.current;

      // Clear long press timer
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = undefined;
      }

      setGestureState((prev) => {
        const finalState = {
          ...prev,
          isDragging: false,
        };

        if (prev.startPoint && prev.currentPoint) {
          // Detect tap
          if (prev.distance < tapThreshold && totalTime < 300) {
            if (enableHaptics) {
              triggerHapticFeedback('light');
            }
            onTap?.(prev.startPoint, event);
          }

          // Detect swipe
          else if (
            prev.distance > swipeThreshold &&
            prev.direction &&
            onSwipe
          ) {
            if (enableHaptics) {
              triggerHapticFeedback('light');
            }
            onSwipe(prev.direction, prev.velocity, event);
          }
        }

        onTouchEnd?.(finalState, event);

        return finalState;
      });
    },
    [onTap, onSwipe, onTouchEnd, enableHaptics, tapThreshold, swipeThreshold],
  );

  // Touch event handlers that can be attached to elements
  const touchHandlers = {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
    onTouchCancel: handleTouchEnd,
  };

  return {
    gestureState,
    touchHandlers,
  };
};

// Drag and Drop specific hook
export interface DragDropOptions {
  onDragStart?: (point: TouchPoint, element: Element) => void;
  onDragMove?: (state: GestureState, element: Element) => void;
  onDragEnd?: (state: GestureState, element: Element) => void;
  onDrop?: (
    dragElement: Element,
    dropElement: Element | null,
    state: GestureState,
  ) => void;
  dragThreshold?: number;
  enableHaptics?: boolean;
}

export const useTouchDragDrop = (options: DragDropOptions = {}) => {
  const {
    onDragStart,
    onDragMove,
    onDragEnd,
    onDrop,
    dragThreshold = 10,
    enableHaptics = true,
  } = options;

  const [dragState, setDragState] = useState({
    isDragging: false,
    dragElement: null as Element | null,
    dragOffset: { x: 0, y: 0 },
  });

  const { gestureState, touchHandlers } = useTouchGestures({
    enableHaptics,
    onTouchStart: (point, event) => {
      const element = event.target as Element;
      onDragStart?.(point, element);
    },
    onTouchMove: (state, event) => {
      if (state.distance > dragThreshold && !dragState.isDragging) {
        setDragState((prev) => ({
          ...prev,
          isDragging: true,
          dragElement: event.target as Element,
        }));

        if (enableHaptics) {
          triggerHapticFeedback('medium');
        }
      }

      if (dragState.isDragging && dragState.dragElement) {
        onDragMove?.(state, dragState.dragElement);
      }
    },
    onTouchEnd: (state, event) => {
      if (dragState.isDragging && dragState.dragElement) {
        // Find drop target
        const dropElement = document.elementFromPoint(
          state.currentPoint?.x || 0,
          state.currentPoint?.y || 0,
        );

        onDrop?.(dragState.dragElement, dropElement, state);
        onDragEnd?.(state, dragState.dragElement);

        if (enableHaptics) {
          triggerHapticFeedback('light');
        }
      }

      setDragState({
        isDragging: false,
        dragElement: null,
        dragOffset: { x: 0, y: 0 },
      });
    },
  });

  return {
    dragState,
    gestureState,
    touchHandlers,
  };
};
