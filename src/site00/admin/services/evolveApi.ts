/** Admin client for EVOLVE Marketing OS API */

const BASE = '/api/admin/site00-evolve';

async function evolveFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    credentials: 'include',
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(err.error ?? `EVOLVE API ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const site00EvolveApi = {
  organizations: () => evolveFetch<{ organizations: Array<{ slug: string; name: string; classification: string }> }>('?action=organizations'),
  overview: (orgSlug: string) =>
    evolveFetch<{ overview: Record<string, unknown> }>(`?action=overview&orgSlug=${encodeURIComponent(orgSlug)}`),
  debug: (orgSlug: string) => evolveFetch<Record<string, unknown>>(`?action=debug&orgSlug=${encodeURIComponent(orgSlug)}`),
  runAssessment: (orgSlug: string) =>
    evolveFetch<{ assessment: Record<string, unknown> }>('', {
      method: 'POST',
      body: JSON.stringify({ action: 'run_assessment', orgSlug }),
    }),
  generateManifest: (orgSlug: string) =>
    evolveFetch<{ manifest: Record<string, unknown>; items: unknown[] }>('', {
      method: 'POST',
      body: JSON.stringify({ action: 'generate_manifest', orgSlug }),
    }),
};
