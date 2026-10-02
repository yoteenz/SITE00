import { useEffect } from 'react';
import { ViewportLabShell } from '../../components/viewportLab/ViewportLabShell';

/** `/production/:projectSlug/viewport-lab` — live client app viewport QA (iframe-isolated). */
export default function ViewportLabPage() {
  useEffect(() => {
    const { body, documentElement } = document;
    const prev = [body.style.overflow, documentElement.style.overflow, body.style.background];
    body.style.overflow = 'hidden';
    documentElement.style.overflow = 'hidden';
    body.style.background = '#0e0e0f';
    return () => {
      body.style.overflow = prev[0]!;
      documentElement.style.overflow = prev[1]!;
      body.style.background = prev[2]!;
    };
  }, []);
  return <ViewportLabShell />;
}
