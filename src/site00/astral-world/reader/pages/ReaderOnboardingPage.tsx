import { useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import {
  READER_ONBOARDING_STEPS,
  type ReaderOnboardingStep,
  type ReaderSpecialtyId,
} from '../../../../../shared/site00-astral-world/readerAccount/types.js';
import { READER_SPECIALTY_LIST } from '../../../../../shared/site00-astral-world/readerAccount/readerSpecialties.js';
import { ASTRAL_READER_ROUTE_BASE } from '../../../../../shared/site00-astral-world/readerAccount/readerRoutes.js';
import type { DestinationSlug, ReaderPresenceState } from '../../../../../shared/site00-astral-world/types.js';
import { useReaderAccount } from '../../hooks/useReaderAccount';
import { AvatarSelector } from '../components/AvatarSelector';
import { CustomAvatarPremiumPanel } from '../components/CustomAvatarPremiumPanel';
import { AstralPortrait } from '../../components/immersive/AstralPortrait';

const DESTINATIONS: { slug: DestinationSlug; label: string }[] = [
  { slug: 'tarot-suite', label: 'Tarot Suite' },
  { slug: 'astral-mall', label: 'Astral Mall' },
  { slug: 'coffee-shop', label: 'Coffee Shop' },
];

const PRESENCE_OPTIONS = ['AVAILABLE', 'READING_NOW', 'AWAY', 'OFFLINE'] as const satisfies readonly ReaderPresenceState[];

function stepIndex(step: ReaderOnboardingStep): number {
  return READER_ONBOARDING_STEPS.indexOf(step);
}

export default function ReaderOnboardingPage() {
  const { profile, advanceStep, saveProfile } = useReaderAccount();
  const [avatarPath, setAvatarPath] = useState<'library' | 'premium'>('library');
  const [draft, setDraft] = useState({
    displayName: profile.displayName,
    introduction: profile.introduction,
    experienceNotes: profile.experienceNotes,
    specialties: [...profile.specialties] as ReaderSpecialtyId[],
    primaryDestination: profile.primaryDestination,
    avatarId: profile.avatarId,
    presence: profile.presence,
  });

  const step = profile.onboardingStep;
  const idx = stepIndex(step);

  const toggleSpecialty = (id: ReaderSpecialtyId) => {
    setDraft((d) => ({
      ...d,
      specialties: d.specialties.includes(id)
        ? d.specialties.filter((s) => s !== id)
        : [...d.specialties, id],
    }));
  };

  const goNext = (next: ReaderOnboardingStep, patch?: Partial<typeof profile>) => {
    advanceStep(next, { ...draft, ...patch });
  };

  const content = useMemo(() => {
    switch (step) {
      case 'WELCOME':
        return (
          <section className="aw-reader-onboarding-step">
            <p className="aw-label">Step 1</p>
            <h1 className="aw-display aw-display--hero">Welcome to Astral World</h1>
            <p className="aw-muted">Establish your Reader account and join the world as a persistent inhabitant.</p>
            <button type="button" className="aw-btn-primary" onClick={() => goNext('IDENTITY')}>
              Begin Reader Setup
            </button>
          </section>
        );
      case 'IDENTITY':
        return (
          <section className="aw-reader-onboarding-step">
            <p className="aw-label">Step 2 — Your Reader Identity</p>
            <label className="aw-reader-field">
              Display name
              <input value={draft.displayName} onChange={(e) => setDraft({ ...draft, displayName: e.target.value })} />
            </label>
            <label className="aw-reader-field">
              Short introduction
              <textarea value={draft.introduction} onChange={(e) => setDraft({ ...draft, introduction: e.target.value })} rows={3} />
            </label>
            <label className="aw-reader-field">
              Experience / profile
              <textarea value={draft.experienceNotes} onChange={(e) => setDraft({ ...draft, experienceNotes: e.target.value })} rows={4} />
            </label>
            <button type="button" className="aw-btn-primary" onClick={() => goNext('SPECIALTIES')}>
              Continue
            </button>
          </section>
        );
      case 'SPECIALTIES':
        return (
          <section className="aw-reader-onboarding-step">
            <p className="aw-label">Step 3 — What do you read?</p>
            <div className="aw-reader-chip-grid">
              {READER_SPECIALTY_LIST.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  className={`aw-reader-chip${draft.specialties.includes(s.id) ? ' aw-reader-chip--active' : ''}`}
                  onClick={() => toggleSpecialty(s.id)}
                >
                  {s.label}
                </button>
              ))}
            </div>
            <button type="button" className="aw-btn-primary" onClick={() => goNext('DESTINATION')} disabled={!draft.specialties.length}>
              Continue
            </button>
          </section>
        );
      case 'DESTINATION':
        return (
          <section className="aw-reader-onboarding-step">
            <p className="aw-label">Step 4 — Where do you practice?</p>
            <div className="aw-reader-dest-grid">
              {DESTINATIONS.map((d) => (
                <button
                  key={d.slug}
                  type="button"
                  className={`aw-reader-dest-card${draft.primaryDestination === d.slug ? ' aw-reader-dest-card--active' : ''}`}
                  onClick={() => setDraft({ ...draft, primaryDestination: d.slug })}
                >
                  {d.label}
                </button>
              ))}
            </div>
            <button type="button" className="aw-btn-primary" onClick={() => goNext('AVATAR')}>
              Continue
            </button>
          </section>
        );
      case 'AVATAR':
        return (
          <section className="aw-reader-onboarding-step aw-reader-onboarding-step--wide">
            <div className="aw-reader-avatar-path-tabs">
              <button type="button" className={avatarPath === 'library' ? 'aw-reader-tab--active' : ''} onClick={() => setAvatarPath('library')}>
                Choose from the World
              </button>
              <button type="button" className={avatarPath === 'premium' ? 'aw-reader-tab--active' : ''} onClick={() => setAvatarPath('premium')}>
                Create My Astral Self — Premium
              </button>
            </div>
            {avatarPath === 'library' ? (
              <AvatarSelector
                selectedAvatarId={draft.avatarId}
                onSelect={(id) => setDraft({ ...draft, avatarId: id })}
                onConfirm={() => goNext('AVAILABILITY', { avatarId: draft.avatarId })}
                previewPersonId={profile.readerId}
              />
            ) : (
              <>
                <CustomAvatarPremiumPanel
                  entitlement={profile.customAvatarEntitlement}
                  onPurchase={() => saveProfile({ customAvatarEntitlement: 'PURCHASED' })}
                />
                <button type="button" className="aw-btn-primary" onClick={() => goNext('AVAILABILITY')}>
                  Continue with library avatar for now
                </button>
              </>
            )}
          </section>
        );
      case 'AVAILABILITY':
        return (
          <section className="aw-reader-onboarding-step">
            <p className="aw-label">Step 6 — Availability</p>
            <div className="aw-reader-chip-grid">
              {PRESENCE_OPTIONS.map((p) => (
                <button
                  key={p}
                  type="button"
                  className={`aw-reader-chip${draft.presence === p ? ' aw-reader-chip--active' : ''}`}
                  onClick={() => setDraft({ ...draft, presence: p })}
                >
                  {p.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
            <button type="button" className="aw-btn-primary" onClick={() => goNext('CLIENT_CONNECTIONS', { presence: draft.presence })}>
              Continue
            </button>
          </section>
        );
      case 'CLIENT_CONNECTIONS':
        return (
          <section className="aw-reader-onboarding-step">
            <p className="aw-label">Step 7 — Client connections</p>
            <p className="aw-muted">Alert when eligible clients enter Astral World or your destination. Seeker privacy always overrides.</p>
            {(
              [
                ['CLIENT_ENTERED_WORLD', 'Favorite/client entered world'],
                ['CLIENT_ENTERED_DESTINATION', 'Client entered my destination'],
                ['NEW_READING_REQUEST', 'New reading request'],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className="aw-reader-check">
                <input
                  type="checkbox"
                  checked={profile.alertPreferences[key]}
                  onChange={(e) =>
                    saveProfile({
                      alertPreferences: { ...profile.alertPreferences, [key]: e.target.checked },
                    })
                  }
                />
                {label}
              </label>
            ))}
            <button type="button" className="aw-btn-primary" onClick={() => goNext('PROFILE_PREVIEW')}>
              Continue
            </button>
          </section>
        );
      case 'PROFILE_PREVIEW':
        return (
          <section className="aw-reader-onboarding-step">
            <p className="aw-label">Step 8 — Preview my world profile</p>
            <div className="aw-reader-profile-preview">
              <AstralPortrait personId={profile.readerId} avatarId={draft.avatarId} name={draft.displayName || 'Reader'} size={80} showPresence variant="reader" />
              <h2 className="aw-display">{draft.displayName || 'Your Reader Name'}</h2>
              <p className="aw-muted">{draft.introduction}</p>
              <p className="aw-muted">{draft.specialties.join(' · ')} · {draft.primaryDestination}</p>
            </div>
            <button type="button" className="aw-btn-primary" onClick={() => goNext('COMPLETE', { avatarId: draft.avatarId })}>
              Looks good
            </button>
          </section>
        );
      case 'COMPLETE':
        return (
          <section className="aw-reader-onboarding-step">
            <p className="aw-label">Step 9</p>
            <h1 className="aw-display aw-display--hero">Enter Astral World</h1>
            <p className="aw-muted">Your Reader identity is established. One face, everywhere in the world.</p>
            <Link to={`${ASTRAL_READER_ROUTE_BASE}/home`} className="aw-btn-primary">
              Go to Reader Home
            </Link>
            <Link to="/projects/astral-world/debug/world/home" className="aw-world-action">
              View as Seeker
            </Link>
          </section>
        );
      default:
        return null;
    }
  }, [step, draft, avatarPath, profile, advanceStep, saveProfile]);

  if (profile.onboardingComplete && step === 'COMPLETE') {
    return <Navigate to={`${ASTRAL_READER_ROUTE_BASE}/home`} replace />;
  }

  return (
    <div className="aw-reader-onboarding">
      <nav className="aw-reader-onboarding__progress" aria-label="Onboarding progress">
        {READER_ONBOARDING_STEPS.map((s, i) => (
          <span key={s} className={`aw-reader-progress-dot${i <= idx ? ' aw-reader-progress-dot--done' : ''}`} title={s} />
        ))}
      </nav>
      {content}
    </div>
  );
}
