import { useRef, useCallback, useEffect } from "react";

interface DragState {
  position: { x: number; y: number };
  velocity: { x: number; y: number };
  direction: number;
  speed: number;
  isDragging: boolean;
  lastPosition: { x: number; y: number };
  lastTime: number;
}

interface EventHandlers {
  onMouseDown: (e: React.MouseEvent | React.TouchEvent) => void;
  onMouseMove: (e: React.MouseEvent | React.TouchEvent) => void;
  onMouseUp: () => void;
  onMouseLeave: () => void;
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchEnd: () => void;
}

interface UseDragDetectorReturn {
  eventHandlers: EventHandlers;
  stateRef: React.RefObject<DragState>;
  startAnimation: () => void;
  stopAnimation: () => void;
  containerRef: React.RefObject<HTMLDivElement>; // 이 줄을 추가
}

const useDragDetector = (
  onStateChange: (state: DragState) => void,
  useRAF: boolean = true,
  velocityScale: number,
  decelerationFactor: number,
  maxSpeed: number
): UseDragDetectorReturn => {
  const stateRef = useRef<DragState>({
    position: { x: 0.5, y: 0.5 },
    velocity: { x: 0, y: 0 },
    direction: 0,
    speed: 0,
    isDragging: false,
    lastPosition: { x: 0, y: 0 },
    lastTime: 0,
  });

  const animationRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const updateState = useCallback(
    (newState: Partial<DragState>) => {
      stateRef.current = { ...stateRef.current, ...newState };
      onStateChange(stateRef.current);
    },
    [onStateChange]
  );

  const SPEED_THRESHOLD = 0.0001; // Adjusted for normalized coordinates

  const limitSpeed = useCallback(
    (vx: number, vy: number): { x: number; y: number } => {
      const speed = Math.hypot(vx, vy);
      if (speed > maxSpeed) {
        const factor = maxSpeed / speed;
        return { x: vx * factor, y: vy * factor };
      }
      return { x: vx, y: vy };
    },
    [maxSpeed]
  );

  const startDrag = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
      const normalizedX = (clientX - rect.left) / rect.width;
      const normalizedY = (clientY - rect.top) / rect.height;

      updateState({
        isDragging: true,
        lastPosition: { x: normalizedX, y: normalizedY },
        lastTime: performance.now(),
        velocity: { x: 0, y: 0 },
      });
    },
    [updateState]
  );

  const drag = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (!stateRef.current.isDragging || !containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
      const normalizedX = (clientX - rect.left) / rect.width;
      const normalizedY = (clientY - rect.top) / rect.height;
      const currentTime = performance.now();

      const state = stateRef.current;
      const deltaTime = (currentTime - state.lastTime) / 1000;

      if (deltaTime > 0) {
        const deltaX = (normalizedX - state.lastPosition.x) * velocityScale;
        const deltaY = (normalizedY - state.lastPosition.y) * velocityScale;

        const newPosition = {
          x: Math.max(0, Math.min(state.position.x + deltaX, 1)),
          y: Math.max(0, Math.min(state.position.y + deltaY, 1)),
        };

        const newVelocity = limitSpeed(deltaX / deltaTime, deltaY / deltaTime);

        const newDirection =
          Math.atan2(newVelocity.y, newVelocity.x) * (180 / Math.PI);
        const newSpeed = Math.hypot(newVelocity.x, newVelocity.y);

        updateState({
          position: newPosition,
          velocity: newVelocity,
          direction: newDirection,
          speed: newSpeed,
          lastPosition: { x: normalizedX, y: normalizedY },
          lastTime: currentTime,
        });
      }
    },
    [updateState, velocityScale, limitSpeed]
  );

  const endDrag = useCallback(() => {
    updateState({ isDragging: false });
  }, [updateState]);

  const updatePosition = useCallback(
    (deltaTime: number) => {
      const state = stateRef.current;
      const newPosition = {
        x: state.position.x + state.velocity.x * deltaTime,
        y: state.position.y + state.velocity.y * deltaTime,
      };

      // Limit position to 0-1 range
      newPosition.x = Math.max(0, Math.min(newPosition.x, 1));
      newPosition.y = Math.max(0, Math.min(newPosition.y, 1));

      updateState({ position: newPosition });
    },
    [updateState]
  );

  const decelerate = useCallback(
    (timestamp: number) => {
      const state = stateRef.current;
      const deltaTime = (timestamp - state.lastTime) / 1000;

      if (!state.isDragging) {
        const newVelocity = limitSpeed(
          state.velocity.x * Math.pow(decelerationFactor, deltaTime * 60),
          state.velocity.y * Math.pow(decelerationFactor, deltaTime * 60)
        );

        const newSpeed = Math.hypot(newVelocity.x, newVelocity.y);
        const newDirection =
          Math.atan2(newVelocity.y, newVelocity.x) * (180 / Math.PI);

        if (newSpeed < SPEED_THRESHOLD) {
          updateState({
            velocity: { x: 0, y: 0 },
            speed: 0,
          });
        } else {
          updateState({
            velocity: newVelocity,
            direction: newDirection,
            speed: newSpeed,
          });
        }
      }

      updatePosition(deltaTime);
      updateState({ lastTime: timestamp });

      if (useRAF) {
        animationRef.current = requestAnimationFrame(decelerate);
      }
    },
    [updateState, updatePosition, useRAF, decelerationFactor, limitSpeed]
  );

  const startAnimation = useCallback(() => {
    if (useRAF) {
      animationRef.current = requestAnimationFrame(decelerate);
    } else {
      animationRef.current = window.setInterval(
        () => decelerate(performance.now()),
        16
      ) as unknown as number;
    }
  }, [decelerate, useRAF]);

  const stopAnimation = useCallback(() => {
    if (useRAF) {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
    } else {
      clearInterval(animationRef.current as unknown as number);
    }
  }, [useRAF]);

  useEffect(() => {
    startAnimation();
    return stopAnimation;
  }, [startAnimation, stopAnimation]);

  const eventHandlers: EventHandlers = {
    onMouseDown: startDrag,
    onMouseMove: drag,
    onMouseUp: endDrag,
    onMouseLeave: endDrag,
    onTouchStart: startDrag,
    onTouchMove: drag,
    onTouchEnd: endDrag,
  };

  return {
    eventHandlers,
    stateRef,
    startAnimation,
    stopAnimation,
    containerRef,
  };
};

export default useDragDetector;
