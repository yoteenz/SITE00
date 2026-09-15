/**
 * P0.VR.DESIGNBENCH.OPUS-DIRECT1 — `/projects/:projectSlug/design/twin-opus-direct`
 *
 * Isolated benchmark route: Claude Opus 5 reconstructing the NDXBOOK DESIGN
 * golden reference directly in DOM/CSS. Deliberately does not read from, write
 * to, or share components with `/design/twin`, `twin-v4`, `twin-testA`,
 * `twin-testB`, `twin-sol-direct`, `twin-grok-direct`, or the current DESIGN
 * route. Boots without the CTRL ROOM account guard so preview/phone can load it.
 */

import { useEffect } from 'react';
import { TwinOpusDirectScreen } from '../components/designBench/opusDirect/TwinOpusDirectScreen';
import '../styles/site00-twin-opus-direct.css';

export function DesignTwinOpusDirectPage() {
  useEffect(() => {
    const { body, documentElement } = document;
    const previousBodyOverflow = body.style.overflow;
    const previousHtmlOverflow = documentElement.style.overflow;
    const previousBackground = body.style.background;
    body.style.overflow = 'hidden';
    documentElement.style.overflow = 'hidden';
    body.style.background = '#050505';
    return () => {
      body.style.overflow = previousBodyOverflow;
      documentElement.style.overflow = previousHtmlOverflow;
      body.style.background = previousBackground;
    };
  }, []);

  return <TwinOpusDirectScreen />;
}

export default DesignTwinOpusDirectPage;
