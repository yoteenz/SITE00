import { useCallback, useEffect, useState } from 'react';
import type { ReaderAccountProfile } from '../../../../shared/site00-astral-world/readerAccount/types.js';
import {
  advanceOnboardingStep,
  getOrCreateReaderProfile,
  upsertReaderProfile,
} from '../../../../shared/site00-astral-world/readerAccount/readerAccountStore.js';

type ReaderAccountResponse = {
  ok: boolean;
  role: 'SEEKER' | 'READER';
  profile: ReaderAccountProfile;
};

export function useReaderAccount(userId = 'demo-reader-user') {
  const [profile, setProfile] = useState<ReaderAccountProfile>(() => getOrCreateReaderProfile(userId));
  const [role, setRole] = useState<'SEEKER' | 'READER'>('SEEKER');
  const [loaded, setLoaded] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/site00/astral-world-reader-account');
      if (res.ok) {
        const data = (await res.json()) as ReaderAccountResponse;
        setProfile(data.profile);
        setRole(data.role);
      }
    } catch {
      setProfile(getOrCreateReaderProfile(userId));
    } finally {
      setLoaded(true);
    }
  }, [userId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const saveProfile = useCallback(
    (patch: Partial<ReaderAccountProfile>) => {
      const next = upsertReaderProfile({ ...profile, ...patch });
      setProfile(next);
      void fetch('/api/site00/astral-world-reader-account', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      });
      return next;
    },
    [profile],
  );

  const advanceStep = useCallback(
    (step: ReaderAccountProfile['onboardingStep'], patch?: Partial<ReaderAccountProfile>) => {
      const next = advanceOnboardingStep(userId, step, patch);
      setProfile(next);
      void fetch('/api/site00/astral-world-reader-account?action=advance-onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ step, patch }),
      });
      return next;
    },
    [userId],
  );

  return { profile, role, loaded, saveProfile, advanceStep, refresh };
}
