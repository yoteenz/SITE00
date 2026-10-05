import { site00ClientApiUrl } from '../../site00ClientApiBase.js';

export async function requestTwinV2ImportConcept(input: {
  projectId: string;
  pageId: string;
  sessionId: string;
  imageUrl: string;
}): Promise<{ imageUrl: string; imageStorageRef: string | null }> {
  const url = site00ClientApiUrl('/api/site00/twin-v2-import-concept');
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'omit',
    body: JSON.stringify({
      ...input,
      founderConfirmedNoSpend: true,
    }),
  });
  const data = (await res.json()) as { imageUrl?: string; imageStorageRef?: string | null; error?: string };
  if (!res.ok) throw new Error(data.error ?? `Import failed (${res.status})`);
  return { imageUrl: data.imageUrl!, imageStorageRef: data.imageStorageRef ?? null };
}
