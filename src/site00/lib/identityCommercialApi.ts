import { apiFetch } from '../../utils/api';

export async function fetchIdentityCommercialStatus(intakeId: string): Promise<unknown> {
  const res = await apiFetch(
    `/api/site00/identity-commercial?action=status&intakeId=${encodeURIComponent(intakeId)}`,
  );
  if (!res.ok) throw new Error('Identity commercial status unavailable');
  return res.json();
}

export async function ensureIdentityCommercial(intakeId: string, guestToken?: string | null): Promise<unknown> {
  const res = await apiFetch('/api/site00/identity-commercial?action=ensure-commercial', {
    method: 'POST',
    body: { intakeId, guestToken: guestToken ?? undefined },
  });
  if (!res.ok) throw new Error('Identity commercial ensure failed');
  return res.json();
}
