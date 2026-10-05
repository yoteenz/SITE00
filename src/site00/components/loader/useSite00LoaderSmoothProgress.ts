import { useEffect, useRef, useState } from 'react';
import type { Site00LoaderStage } from './site00LoaderConfig';
import { creepLoaderProgress, resolveLoaderProgressCreepCeiling } from './site00LoaderProgressCreep';

/**
 * Smoothly advances displayed progress between completed stage floors and the next milestone
 * so the gray subtitle and progress bar feel continuously active during preload work.
 */
export function useSite00LoaderSmoothProgress(
  stages: Site00LoaderStage[],
  floor: number,
  isComplete: boolean,
): number {
  const [smooth, setSmooth] = useState(0);
  const floorRef = useRef(floor);

  useEffect(() => {
    floorRef.current = floor;
    setSmooth((prev) => Math.max(prev, floor));
  }, [floor]);

  useEffect(() => {
    if (isComplete) {
      setSmooth(100);
      return;
    }

    let raf = 0;
    let last = performance.now();

    const tick = (now: number) => {
      const deltaSeconds = Math.min(0.05, (now - last) / 1000);
      last = now;

      setSmooth((prev) => {
        const ceiling = resolveLoaderProgressCreepCeiling(stages, floorRef.current);
        const next = creepLoaderProgress(Math.max(prev, floorRef.current), ceiling, deltaSeconds);
        return next === prev ? prev : next;
      });

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [isComplete, stages]);

  return isComplete ? 100 : smooth;
}
