import { useEffect, useState } from 'react';
import { awaitFounderWorkspaceFonts } from './founderWorkspaceFonts';

/** True once approved workspace fonts are loaded (or timeout — avoid infinite blank). */
export function useFounderWorkspaceFontsReady(): boolean {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void awaitFounderWorkspaceFonts().then(() => {
      if (!cancelled) setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return ready;
}
