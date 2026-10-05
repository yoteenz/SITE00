/**
 * B5.0R2 — use reference mobile layout below studio breakpoint.
 */

import { useEffect, useState } from 'react';

const REF_LAYOUT_MAX = 960;

export function useExpressionEngineResponsiveLayout(): 'reference-mobile' | 'studio' {
  const [layout, setLayout] = useState<'reference-mobile' | 'studio'>(() =>
    typeof window !== 'undefined' && window.innerWidth <= REF_LAYOUT_MAX ? 'reference-mobile' : 'studio',
  );

  useEffect(() => {
    const onResize = () => {
      setLayout(window.innerWidth <= REF_LAYOUT_MAX ? 'reference-mobile' : 'studio');
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return layout;
}
