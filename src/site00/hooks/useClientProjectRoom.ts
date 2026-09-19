import { useCallback, useEffect, useState } from 'react';
import {
  buildPreviewClientManifest,
  CLIENT_PROJECT_ROOM_PREVIEW_SLUG,
} from '../../../shared/site00-client-project-room/manifestTemplates.js';
import { buildClientProjectRoomViewModel } from '../../../shared/site00-client-project-room/viewModel.js';
import type { ClientProjectRoomViewModel } from '../../../shared/site00-client-project-room/types.js';

type LoadState = 'idle' | 'loading' | 'ready' | 'error';

export function useClientProjectRoom(projectSlug: string, previewScope?: string) {
  const [data, setData] = useState<ClientProjectRoomViewModel | null>(null);
  const [state, setState] = useState<LoadState>('idle');
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!projectSlug) return;
    setState('loading');
    setError(null);

    if (projectSlug === CLIENT_PROJECT_ROOM_PREVIEW_SLUG) {
      const manifest = buildPreviewClientManifest(previewScope);
      setData(buildClientProjectRoomViewModel(manifest));
      setState('ready');
      return;
    }

    try {
      const params = new URLSearchParams({ action: 'room', projectSlug });
      if (previewScope) params.set('scope', previewScope);
      const res = await fetch(`/api/site00/client-project-room?${params.toString()}`);
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error ?? `HTTP ${res.status}`);
      }
      const json = (await res.json()) as ClientProjectRoomViewModel;
      setData(json);
      setState('ready');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load project room');
      setState('error');
    }
  }, [projectSlug, previewScope]);

  useEffect(() => {
    void load();
  }, [load]);

  return { data, state, error, reload: load };
}
