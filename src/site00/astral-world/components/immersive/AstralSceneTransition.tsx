import { useEffect, useState, type ReactNode } from 'react';

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

type AstralSceneTransitionProps = {
  sceneKey: string;
  children: ReactNode;
  className?: string;
};

export function AstralSceneTransition({ sceneKey, children, className = '' }: AstralSceneTransitionProps) {
  const reducedMotion = prefersReducedMotion();
  const [visible, setVisible] = useState(true);
  const [displayKey, setDisplayKey] = useState(sceneKey);

  useEffect(() => {
    if (sceneKey === displayKey) return;
    if (reducedMotion) {
      setDisplayKey(sceneKey);
      return;
    }
    setVisible(false);
    const t = window.setTimeout(() => {
      setDisplayKey(sceneKey);
      setVisible(true);
    }, 220);
    return () => window.clearTimeout(t);
  }, [sceneKey, displayKey, reducedMotion]);

  return (
    <div
      className={`aw-scene-transition${visible ? ' aw-scene-transition--in' : ' aw-scene-transition--out'} ${className}`.trim()}
      data-scene-key={displayKey}
    >
      {children}
    </div>
  );
}
