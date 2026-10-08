/**
 * Studio draft state with on-device persistence.
 *
 * The draft is restored on load (saved-selection restoration) and written back on every change. This is a
 * per-device convenience; the system of record for a submitted Blueprint is the canonical BUILDER intake
 * (see `submitBlueprint.ts`).
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toSelection, emptyDraft, parseDraft, STUDIO_INTAKE_STORAGE_PREFIX, STUDIO_STORAGE_KEY } from './studioModel';
import type { StudioDraft } from './studioModel';

function readStored(): StudioDraft | null {
  try {
    return parseDraft(localStorage.getItem(STUDIO_STORAGE_KEY));
  } catch {
    return null;
  }
}

function writeStored(draft: StudioDraft): boolean {
  try {
    localStorage.setItem(STUDIO_STORAGE_KEY, JSON.stringify(draft));
    return true;
  } catch {
    return false;
  }
}

export type StudioDraftApi = {
  draft: StudioDraft;
  selection: ReturnType<typeof toSelection>;
  restored: boolean;
  update: (patch: Partial<StudioDraft> | ((draft: StudioDraft) => StudioDraft)) => void;
  saveNow: () => boolean;
  reset: () => void;
};

export function useStudioDraft(): StudioDraftApi {
  const [initial] = useState(() => readStored());
  const [draft, setDraft] = useState<StudioDraft>(() => initial ?? emptyDraft());
  const writeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const draftRef = useRef(draft);
  draftRef.current = draft;

  useEffect(() => {
    if (writeTimer.current) clearTimeout(writeTimer.current);
    writeTimer.current = setTimeout(() => writeStored(draft), 250);
    return () => {
      if (writeTimer.current) clearTimeout(writeTimer.current);
    };
  }, [draft]);

  // Flush on tab hide so a closed tab never loses the last choice.
  useEffect(() => {
    const flush = () => {
      if (document.visibilityState === 'hidden') writeStored(draftRef.current);
    };
    document.addEventListener('visibilitychange', flush);
    window.addEventListener('pagehide', flush);
    return () => {
      document.removeEventListener('visibilitychange', flush);
      window.removeEventListener('pagehide', flush);
      writeStored(draftRef.current);
    };
  }, []);

  const update = useCallback((patch: Partial<StudioDraft> | ((d: StudioDraft) => StudioDraft)) => {
    setDraft((current) => {
      const next = typeof patch === 'function' ? patch(current) : { ...current, ...patch };
      return { ...next, updatedAt: new Date().toISOString() };
    });
  }, []);

  const saveNow = useCallback(() => {
    const saved = { ...draftRef.current, savedAt: new Date().toISOString() };
    const ok = writeStored(saved);
    if (ok) setDraft(saved);
    return ok;
  }, []);

  const reset = useCallback(() => {
    const fresh = emptyDraft();
    writeStored(fresh);
    // A new Blueprint is a new BUILDER intake: forget the previous intake id and guest token.
    try {
      localStorage.removeItem(`${STUDIO_INTAKE_STORAGE_PREFIX}-server-intake-id`);
      localStorage.removeItem(`${STUDIO_INTAKE_STORAGE_PREFIX}-guest-token`);
    } catch {
      /* storage unavailable */
    }
    setDraft(fresh);
  }, []);

  const selection = useMemo(() => toSelection(draft), [draft]);

  return { draft, selection, restored: initial !== null, update, saveNow, reset };
}
