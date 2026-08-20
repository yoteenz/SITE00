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

export function useAccessRecognitionSequence(enabled: boolean) {
  const [phase, setPhase] = useState<AccessRecognitionPhase>('detecting');

  useEffect(() => {
    if (!enabled) {
      setPhase('ready');
      return;
    }

    if (prefersReducedMotion()) {
      setPhase('ready');
      return;
    }

    setPhase('detecting');
    const timers = PHASE_ORDER.filter((p) => p !== 'detecting').map((p) =>
      window.setTimeout(() => setPhase(p), PHASE_MS[p]),
    );

    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [enabled]);

  const showProtocol = phase !== 'ready' || enabled;
  const showClock = phase === 'recognized' || phase === 'authorized' || phase === 'ready';
  const showRecognized = phase === 'recognized' || phase === 'authorized' || phase === 'ready';
  const showCredential = phase === 'authorized' || phase === 'ready';
  const showEnter = phase === 'ready';
  const reticleActive = phase !== 'detecting';
  const reticleScanning = phase === 'scanning';

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
