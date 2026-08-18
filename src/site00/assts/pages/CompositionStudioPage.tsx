import { useEffect, useState } from 'react';
import { CompositionStudio } from '../../composition/studio';
import { ASSTS_LIBRARY_CORRIDOR_COMPOSITION_V1 } from '../../compositions/assts-library-corridor-v1';
import { ASSTS_ENVIRONMENT_SLOTS } from '../config/slots';
import { resolveAsstsSlot } from '../services/asstsApi';

/** ASSTS — Composition Studio entry for Asset Vault corridor environment. */
export default function AsstsCompositionStudioPage() {
  const [bgUrl, setBgUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    resolveAsstsSlot(ASSTS_ENVIRONMENT_SLOTS.library)
      .then((res) => {
        if (!cancelled) setBgUrl(res.resolved.url);
      })
      .catch(() => {
        if (!cancelled) setBgUrl(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <CompositionStudio
      environmentId={ASSTS_LIBRARY_CORRIDOR_COMPOSITION_V1.environmentId}
      environmentAssetUrl={bgUrl}
    />
  );
}
