import { useEffect, useState } from 'react';

export type AccessRecognitionPhase =
  | 'detecting'
  | 'scanning'
  | 'recognized'
  | 'authorized'
  | 'ready';

const PHASE_MS: Record<AccessRecognitionPhase, number> = {
  detecting: 0,
  scanning: 420,
  recognized: 840,
  authorized: 1260,
  ready: 1680,
};

const PHASE_ORDER: AccessRecognitionPhase[] = [
  'detecting',
  'scanning',
  'recognized',
  'authorized',
  'ready',
];

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function useAccessRecognitionSequence(enabled: boolean, options?: { immediate?: boolean }) {
  const immediate = options?.immediate ?? false;
  const [phase, setPhase] = useState<AccessRecognitionPhase>(immediate ? 'ready' : 'detecting');

  useEffect(() => {
    if (!enabled) {
      setPhase('ready');
      return;
    }

    if (immediate || prefersReducedMotion()) {
      setPhase('ready');
      return;
    }

    setPhase('detecting');
    const timers = PHASE_ORDER.filter((p) => p !== 'detecting').map((p) =>
      window.setTimeout(() => setPhase(p), PHASE_MS[p]),
    );

    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [enabled, immediate]);

  const showProtocol = immediate || phase !== 'ready' || enabled;
  const showClock = immediate || phase === 'recognized' || phase === 'authorized' || phase === 'ready';
  const showRecognized = immediate || phase === 'recognized' || phase === 'authorized' || phase === 'ready';
  const showCredential = immediate || phase === 'authorized' || phase === 'ready';
  const showEnter = immediate || phase === 'ready';
  const reticleActive = immediate || phase !== 'detecting';
  const reticleScanning = !immediate && phase === 'scanning';

  return {
    phase,
    showProtocol,
    showClock,
    showRecognized,
    showCredential,
    showEnter,
    reticleActive,
    reticleScanning,
  };
}
