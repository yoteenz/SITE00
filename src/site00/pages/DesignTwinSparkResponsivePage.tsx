/**
 * P0.VR.DESIGNBENCH.SPARK-RESPONSIVE-OPUSGROK1 —
 * `/projects/:projectSlug/design/twin-spark-responsive`
 *
 * Isolated responsive-translation bench: the approved Opus+Grok visual system,
 * forked 1:1 (DOM, strings, icons, artwork, styling), recomposed across
 * mobile / tablet / desktop with real responsive CSS. The source route
 * `twin-opus-direct` is read-only authority and is never imported or mutated
 * here. Boots without the CTRL ROOM account guard so preview/phone can load it.
 */

import { useEffect } from 'react';
import { TwinSparkResponsiveScreen } from '../components/designBench/sparkResponsive/TwinSparkResponsiveScreen';
import '../styles/site00-twin-spark-responsive.css';

export function DesignTwinSparkResponsivePage() {
  useEffect(() => {
    const { body } = document;
    const previousBackground = body.style.background;
    body.style.background = '#dfddd6';
    return () => {
      body.style.background = previousBackground;
    };
  }, []);

  return <TwinSparkResponsiveScreen />;
}

export default DesignTwinSparkResponsivePage;
